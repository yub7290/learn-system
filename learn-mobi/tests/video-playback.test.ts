import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createVideoPlaybackMonitor, videoStartPosition } from '../src/utils/videoPlayback'
import type { VideoPlaybackState } from '../src/utils/videoPlayback'

function fixture() {
  const state: VideoPlaybackState = { currentTime: 0, duration: 900, paused: true, seeking: false,
    ended: false, readyState: 0, bufferedAhead: 0, hasError: false }
  const update = vi.fn()
  const metric = vi.fn()
  const monitor = createVideoPlaybackMonitor({ readState: () => ({ ...state }), onUpdate: update,
    onMetric: metric, now: () => Date.now() })
  monitor.load()
  return { state, update, metric, monitor }
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('video playback deadlines and recovery', () => {
  it('does not time out a paused metadata preload or buffered video', () => {
    const { state, monitor, update } = fixture()
    state.readyState = 1
    monitor.ready()
    for (let i = 0; i < 5; i++) {
      monitor.waiting()
      vi.advanceTimersByTime(10000)
    }
    expect(update.mock.calls.map(([event]) => event.phase)).toEqual(['loading', 'ready'])
  })

  it('rechecks actual media readiness at the deadline even if canplay was missed', () => {
    const { state, update } = fixture()
    state.readyState = 4
    state.bufferedAhead = 11.56
    vi.advanceTimersByTime(30000)
    expect(update).toHaveBeenLastCalledWith(expect.objectContaining({ phase: 'ready' }))
  })

  it('keeps a fixed deadline across repeated waiting events', () => {
    const { state, monitor, update } = fixture()
    state.paused = false
    state.readyState = 2
    monitor.play()
    for (let i = 0; i < 3; i++) {
      vi.advanceTimersByTime(10000)
      monitor.waiting()
    }
    expect(update).toHaveBeenLastCalledWith(expect.objectContaining({ phase: 'timeout', reason: 'play' }))
    expect(update.mock.calls.filter(([event]) => event.phase === 'timeout')).toHaveLength(1)
  })

  it('recovers after timeout and permits another distinct wait', () => {
    const { state, monitor, update } = fixture()
    state.paused = false
    state.readyState = 2
    monitor.play()
    vi.advanceTimersByTime(30000)
    state.readyState = 4
    monitor.ready()
    expect(update).toHaveBeenLastCalledWith(expect.objectContaining({ phase: 'ready' }))
    state.readyState = 2
    monitor.waiting()
    vi.advanceTimersByTime(30000)
    expect(update.mock.calls.filter(([event]) => event.phase === 'timeout')).toHaveLength(2)
  })

  it('stops a playback deadline when the user pauses', () => {
    const { state, monitor, update } = fixture()
    state.paused = false
    state.readyState = 2
    monitor.waiting()
    state.paused = true
    monitor.pause()
    vi.advanceTimersByTime(60000)
    expect(update.mock.calls.some(([event]) => event.phase === 'timeout')).toBe(false)
  })

  it('still detects an initial metadata failure while paused', () => {
    const { update } = fixture()
    vi.advanceTimersByTime(30000)
    expect(update).toHaveBeenLastCalledWith(expect.objectContaining({ phase: 'timeout', reason: 'load' }))
  })

  it('keeps the new metadata deadline across a queued pause from source replacement', () => {
    const { monitor, update } = fixture()
    monitor.pause()
    vi.advanceTimersByTime(30000)
    expect(update).toHaveBeenLastCalledWith(expect.objectContaining({ phase: 'timeout', reason: 'load' }))
  })

  it('waits for an actual paused seek instead of accepting stale readiness', () => {
    const { state, monitor, update, metric } = fixture()
    Object.assign(state, { currentTime: 200, readyState: 4, seeking: true })
    monitor.seeking()
    vi.advanceTimersByTime(30000)
    expect(update).toHaveBeenLastCalledWith(expect.objectContaining({ phase: 'timeout', reason: 'seek' }))
    state.seeking = false
    monitor.seeked()
    expect(update).toHaveBeenLastCalledWith(expect.objectContaining({ phase: 'ready' }))
    expect(metric).toHaveBeenCalledWith(expect.objectContaining({ name: 'seek', basis: 'seeked', outcome: 'ready', paused: true, elapsedMs: 30000 }))
  })

  it('does not mask a real media failure with timeout recovery', () => {
    const { state, monitor, update } = fixture()
    state.hasError = true
    state.readyState = 4
    monitor.stop()
    monitor.ready()
    monitor.waiting()
    vi.advanceTimersByTime(60000)
    expect(update).toHaveBeenCalledTimes(1)
  })

  it('cleans deadlines and measurements on source disposal', () => {
    const { state, monitor, update, metric } = fixture()
    state.paused = false
    monitor.play()
    monitor.stop()
    state.readyState = 4
    monitor.frame('video-frame')
    vi.advanceTimersByTime(60000)
    expect(metric).not.toHaveBeenCalled()
    expect(update.mock.calls.some(([event]) => event.phase === 'timeout')).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('excludes time in a background tab', () => {
    const { state, monitor, update } = fixture()
    monitor.suspend()
    vi.advanceTimersByTime(60000)
    expect(update.mock.calls.some(([event]) => event.phase === 'timeout')).toBe(false)
    state.readyState = 1
    monitor.wake()
    expect(update).toHaveBeenLastCalledWith(expect.objectContaining({ phase: 'ready' }))
  })
})

describe('first-frame and seek measurements', () => {
  it('also records timeouts so slow failures are not omitted from diagnostics', () => {
    const { state, monitor, metric } = fixture()
    Object.assign(state, { paused: false, readyState: 2, seeking: true, currentTime: 300 })
    monitor.play()
    monitor.seeking()
    vi.advanceTimersByTime(30000)
    expect(metric).toHaveBeenCalledWith(expect.objectContaining({ name: 'first-frame', outcome: 'timeout', elapsedMs: 30000 }))
    expect(metric).toHaveBeenCalledWith(expect.objectContaining({ name: 'seek', outcome: 'timeout', target: 300 }))
  })

  it('measures play to presented frame once, excluding preload and idle time', () => {
    const { state, monitor, metric } = fixture()
    state.readyState = 4
    monitor.ready()
    vi.advanceTimersByTime(120000)
    state.paused = false
    monitor.play()
    vi.advanceTimersByTime(45)
    monitor.frame('video-frame')
    monitor.frame('video-frame')
    expect(metric).toHaveBeenCalledTimes(1)
    expect(metric).toHaveBeenCalledWith(expect.objectContaining({ name: 'first-frame', elapsedMs: 45, basis: 'video-frame' }))
  })

  it('excludes a pause before the first frame', () => {
    const { state, monitor, metric } = fixture()
    state.paused = false
    monitor.play()
    vi.advanceTimersByTime(10)
    state.paused = true
    monitor.pause()
    vi.advanceTimersByTime(60000)
    Object.assign(state, { paused: false, readyState: 4 })
    monitor.play()
    vi.advanceTimersByTime(20)
    monitor.frame('playing')
    expect(metric).toHaveBeenCalledWith(expect.objectContaining({ name: 'first-frame', elapsedMs: 20, basis: 'playing' }))
  })

  it('measures a playing seek until its new frame, rather than only seeked', () => {
    const { state, monitor, metric } = fixture()
    Object.assign(state, { paused: false, readyState: 2, seeking: true, currentTime: 300 })
    monitor.seeking()
    vi.advanceTimersByTime(100)
    Object.assign(state, { readyState: 4, seeking: false })
    monitor.seeked()
    expect(metric).not.toHaveBeenCalled()
    vi.advanceTimersByTime(30)
    monitor.frame('video-frame')
    expect(metric).toHaveBeenCalledWith(expect.objectContaining({ name: 'seek', elapsedMs: 130, target: 300, basis: 'video-frame' }))
  })

  it('reports only the latest target after consecutive seeks and labels initial resume', () => {
    const { state, monitor, metric } = fixture()
    Object.assign(state, { readyState: 4, seeking: true, currentTime: 120 })
    monitor.seeking('resume')
    vi.advanceTimersByTime(70)
    state.currentTime = 500
    monitor.seeking('user')
    vi.advanceTimersByTime(20)
    state.seeking = false
    monitor.seeked()
    expect(metric).toHaveBeenCalledTimes(1)
    expect(metric).toHaveBeenCalledWith(expect.objectContaining({ name: 'seek', elapsedMs: 20, target: 500, reason: 'user' }))
  })

  it('does not report an early frame while the target is still seeking', () => {
    const { state, monitor, metric } = fixture()
    Object.assign(state, { paused: false, readyState: 4, seeking: true })
    monitor.play()
    monitor.frame('video-frame')
    expect(metric).not.toHaveBeenCalled()
  })
})

describe('resume position bounds', () => {
  it('sanitizes damaged cache values and clamps positions to the playable duration', () => {
    expect(videoStartPosition(NaN)).toBe(0)
    expect(videoStartPosition(Infinity)).toBe(0)
    expect(videoStartPosition(-30)).toBe(0)
    expect(videoStartPosition(120)).toBe(120)
    expect(videoStartPosition(120, 100)).toBe(99)
    expect(videoStartPosition(120, 0.5)).toBe(0)
  })
})
