import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRenderer, nextTick, ssrContextKey } from 'vue'
import HlsVideo from '../src/components/HlsVideo.vue'

const harness = vi.hoisted(() => ({ instances: [] as any[], native: false }))
vi.mock('hls.js', () => ({
  default: class {
    static Events = { ERROR: 'error', MEDIA_ATTACHED: 'attached', LEVEL_LOADED: 'level' }
    static ErrorTypes = { NETWORK_ERROR: 'network', MEDIA_ERROR: 'media' }
    static isSupported = () => true
    handlers = new Map<string, Function>()
    startLoad = vi.fn()
    recoverMediaError = vi.fn()
    destroy = vi.fn()
    attachMedia = vi.fn()
    loadSource = vi.fn()
    constructor(public config: any) { harness.instances.push(this) }
    on(event: string, callback: Function) { this.handlers.set(event, callback) }
    fire(event: string, data: any = {}) { this.handlers.get(event)?.(event, data) }
  },
}))

// Vue runs its real refs, watchers and lifecycle; only the host media device is fake.
class MediaNode {
  parent: any = null
  children: any[] = []
  props: Record<string, any> = {}
  src = ''
  paused = true
  ended = false
  seeking = false
  currentTime = 0
  duration = NaN
  readyState = 0
  error: { code: number } | null = null
  ranges: number[][] = []
  callbacks = new Map<number, Function>()
  nextCallback = 1
  buffered = { get length() { return 0 }, start: (_i: number) => 0, end: (_i: number) => 0 }
  constructor() {
    const node = this
    this.buffered = { get length() { return node.ranges.length },
      start: (i: number) => node.ranges[i][0], end: (i: number) => node.ranges[i][1] }
  }
  canPlayType() { return harness.native ? 'probably' : '' }
  load = vi.fn()
  pause() { this.paused = true }
  removeAttribute(name: string) { if (name === 'src') this.src = '' }
  play = vi.fn(() => { this.paused = false; this.props.onPlay?.(); return Promise.resolve() })
  requestVideoFrameCallback(callback: Function) {
    const id = this.nextCallback++
    this.callbacks.set(id, callback)
    return id
  }
  cancelVideoFrameCallback(id: number) { this.callbacks.delete(id) }
  presentFrame() {
    const callbacks = [...this.callbacks.values()]
    this.callbacks.clear()
    callbacks.forEach(callback => callback(0, {}))
  }
}

const renderer = createRenderer<any, any>({
  createElement: () => new MediaNode(),
  createText: text => ({ text }), createComment: text => ({ text }),
  setText: (node, text) => { node.text = text }, setElementText: (node, text) => { node.text = text },
  parentNode: node => node.parent, nextSibling: () => null,
  insert: (node, parent) => { node.parent = parent; parent.children.push(node) },
  remove: node => { if (node.parent) node.parent.children = node.parent.children.filter((n: any) => n !== node) },
  patchProp: (node, key, _previous, value) => { node.props[key] = value },
})

const unmounts: Array<() => void> = []
async function mount(initialTime = 0) {
  const events = { ready: vi.fn(), timeout: vi.fn(), error: vi.fn(), metric: vi.fn(), blocked: vi.fn(), playing: vi.fn() }
  const root = { children: [] as MediaNode[] }
  const app = renderer.createApp(HlsVideo, { src: 'https://media.example.test/master.m3u8', initialTime,
    onReady: events.ready, onTimeout: events.timeout, onError: events.error,
    onMetric: events.metric, onPlayblocked: events.blocked, onPlaying: events.playing })
  // Vitest's node transform adds Vue's SSR module registration to the SFC.
  app.provide(ssrContextKey, { modules: new Set() })
  const exposed = app.mount(root) as unknown as { reload: () => void; resume: () => void }
  unmounts.push(() => app.unmount())
  await nextTick()
  return { video: root.children[0], exposed, events, hls: harness.instances.at(-1) }
}

beforeEach(() => {
  vi.useFakeTimers()
  harness.instances.length = 0
  harness.native = false
  vi.stubGlobal('document', { hidden: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
})
afterEach(() => {
  unmounts.splice(0).forEach(unmount => unmount())
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('HlsVideo media wiring', () => {
  it('starts HLS at the saved position without a second metadata seek', async () => {
    const { video, hls } = await mount(120)
    expect(hls.config.startPosition).toBe(120)
    video.duration = 900
    video.readyState = 1
    video.props.onLoadedmetadata()
    expect(video.currentTime).toBe(0)
    hls.fire('attached')
    expect(hls.loadSource).toHaveBeenCalledWith('https://media.example.test/master.m3u8')
  })

  it('bounds an outdated HLS resume position using the loaded playlist', async () => {
    const { hls } = await mount(1000)
    hls.fire('level', { details: { totalduration: 900 } })
    expect(hls.startLoad).toHaveBeenCalledWith(899)
  })

  it('restores a native position once, without overriding a subsequent seek', async () => {
    harness.native = true
    const { video } = await mount(120)
    video.duration = 100
    video.readyState = 1
    video.props.onLoadedmetadata()
    expect(video.currentTime).toBe(99)
    video.currentTime = 40
    video.props.onLoadedmetadata()
    expect(video.currentTime).toBe(40)
    expect(harness.instances).toHaveLength(0)
  })

  it('does not report paused stalled events as a playback timeout', async () => {
    const { video, events } = await mount()
    Object.assign(video, { readyState: 4, duration: 900, ranges: [[0, 11.56]] })
    video.props.onStalled()
    vi.advanceTimersByTime(60000)
    expect(events.ready).toHaveBeenCalled()
    expect(events.timeout).not.toHaveBeenCalled()
  })

  it('ignores queued playing events when the new media is still paused and empty', async () => {
    const { video, events } = await mount()
    video.props.onPlaying()
    expect(events.playing).not.toHaveBeenCalled()
    expect(events.metric).not.toHaveBeenCalled()
  })

  it('keeps network recovery bounded and preserves real fatal failures', async () => {
    const { hls, video, events } = await mount()
    for (let i = 0; i < 3; i++) hls.fire('error', { fatal: true, type: 'network', details: 'fragment failed' })
    expect(hls.startLoad).toHaveBeenCalledTimes(2)
    expect(events.error).toHaveBeenCalledWith({ detail: { kind: 'fatal', message: 'fragment failed' } })
    video.readyState = 4
    video.props.onCanplay()
    expect(events.ready).not.toHaveBeenCalled()
  })

  it('does not treat residual buffered playback after terminal HLS failure as recovery', async () => {
    const { hls, video, events } = await mount()
    for (let i = 0; i < 3; i++) hls.fire('error', { fatal: true, type: 'network' })
    Object.assign(video, { readyState: 4, paused: false, ranges: [[0, 10]] })
    video.props.onPlaying()
    expect(events.playing).not.toHaveBeenCalled()
    expect(events.ready).not.toHaveBeenCalled()
  })

  it('reloads the selected video at its current position and destroys the old HLS instance', async () => {
    const { video, hls, exposed } = await mount(120)
    video.currentTime = 250
    video.readyState = 4
    exposed.reload()
    await nextTick()
    expect(hls.destroy).toHaveBeenCalledOnce()
    expect(harness.instances.at(-1).config.startPosition).toBe(250)
    hls.fire('error', { fatal: true, type: 'network' })
    expect(hls.startLoad).not.toHaveBeenCalled()
  })

  it('preserves an explicit seek back to zero when retrying', async () => {
    const { video, exposed } = await mount(120)
    Object.assign(video, { readyState: 4, currentTime: 0 })
    exposed.reload()
    await nextTick()
    expect(harness.instances.at(-1).config.startPosition).toBe(0)
  })

  it('keeps the last playback position when a fatal error clears media metadata', async () => {
    const { video, exposed } = await mount(120)
    video.currentTime = 250
    video.props.onTimeupdate({ currentTarget: video })
    Object.assign(video, { readyState: 0, currentTime: 0, error: { code: 2 } })
    video.props.onError()
    exposed.reload()
    await nextTick()
    expect(harness.instances.at(-1).config.startPosition).toBe(250)
  })

  it('labels a user seek correctly even when the initial HLS position emitted no seeking event', async () => {
    const { video, events } = await mount(120)
    Object.assign(video, { paused: false, readyState: 4, currentTime: 120 })
    video.props.onPlaying()
    Object.assign(video, { paused: true, currentTime: 300, seeking: true })
    video.props.onSeeking()
    video.seeking = false
    video.props.onSeeked()
    expect(events.metric).toHaveBeenCalledWith(expect.objectContaining({ detail: expect.objectContaining({
      name: 'seek', reason: 'user', target: 300 }) }))
  })

  it('records a presented first frame and cancels pending frame callbacks on pause', async () => {
    const { video, events } = await mount()
    Object.assign(video, { paused: false, readyState: 4, ranges: [[0, 12]] })
    video.props.onPlay()
    video.props.onPlaying()
    expect(video.callbacks.size).toBe(1)
    video.presentFrame()
    expect(events.metric).toHaveBeenCalledWith(expect.objectContaining({ detail: expect.objectContaining({
      name: 'first-frame', basis: 'video-frame', engine: 'hls.js' }) }))
    video.props.onCanplay()
    video.paused = true
    video.props.onPause()
    expect(video.callbacks.size).toBe(0)
  })

  it('handles browser play restrictions as guidance instead of fatal media failure', async () => {
    const { video, exposed, events } = await mount()
    video.play.mockRejectedValueOnce(new DOMException('gesture required', 'NotAllowedError'))
    exposed.resume()
    await Promise.resolve()
    expect(events.blocked).toHaveBeenCalledOnce()
    expect(events.error).not.toHaveBeenCalled()
  })

  it('labels first-frame estimates on browsers without video frame callbacks', async () => {
    const { video, events } = await mount()
    ;(video as any).requestVideoFrameCallback = undefined
    Object.assign(video, { paused: false, readyState: 4 })
    video.props.onPlay()
    video.props.onPlaying()
    expect(events.metric).toHaveBeenCalledWith(expect.objectContaining({ detail: expect.objectContaining({
      name: 'first-frame', basis: 'playing' }) }))
  })
})
