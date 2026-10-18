export interface VideoPlaybackState {
  currentTime: number
  duration: number
  paused: boolean
  seeking: boolean
  ended: boolean
  readyState: number
  bufferedAhead: number
  hasError: boolean
}

export type PlaybackPhase = 'loading' | 'ready' | 'waiting' | 'timeout'
export type WaitReason = 'load' | 'play' | 'seek'
export type FrameBasis = 'video-frame' | 'playing' | 'timeupdate' | 'seeked'
export interface VideoPlaybackMetric {
  name: 'first-frame' | 'seek'
  elapsedMs: number
  basis: FrameBasis | 'watchdog'
  outcome: 'ready' | 'timeout'
  position: number
  target?: number
  reason?: 'user' | 'resume'
  paused: boolean
}

export interface PlaybackUpdate {
  phase: PlaybackPhase
  reason: WaitReason
  state: VideoPlaybackState
}

/** No DOM or Vue dependency: test actual media event sequences with a fake clock. */
export function createVideoPlaybackMonitor(options: {
  readState: () => VideoPlaybackState
  onUpdate: (update: PlaybackUpdate) => void
  onMetric: (metric: VideoPlaybackMetric) => void
  now?: () => number
  timeoutMs?: number
}) {
  const now = options.now || (() => performance.now())
  let timer: ReturnType<typeof setTimeout> | null = null
  let active = false
  let suspended = false
  let phase: PlaybackPhase = 'ready'
  let reason: WaitReason = 'load'
  let firstPlayAt: number | null = null
  let firstFrameRecorded = false
  let seek: { at: number; target: number; reason: 'user' | 'resume'; completed: boolean } | null = null

  function clearTimer() {
    if (timer !== null) clearTimeout(timer)
    timer = null
  }

  function publish(next: PlaybackPhase) {
    if (!active) return
    phase = next
    options.onUpdate({ phase, reason, state: options.readState() })
  }

  function canRecover(state: VideoPlaybackState) {
    if (state.hasError || state.seeking) return false
    return state.ended || (state.paused ? state.readyState >= 1 : state.readyState >= 3)
  }

  function ready() {
    if (!active || suspended || !canRecover(options.readState())) return
    clearTimer()
    if (phase !== 'ready') publish('ready')
  }

  function arm() {
    // Repeated stalled/waiting events must not extend an existing deadline.
    if (!active || suspended || timer !== null || phase === 'timeout') return
    timer = setTimeout(() => {
      timer = null
      if (!active) return
      const state = options.readState()
      if (state.hasError) return
      if (canRecover(state)) { ready(); return }
      if (firstPlayAt !== null && !firstFrameRecorded) {
        options.onMetric({ name: 'first-frame', elapsedMs: Math.round(now() - firstPlayAt),
          basis: 'watchdog', outcome: 'timeout', position: state.currentTime, paused: state.paused })
      }
      if (seek) {
        options.onMetric({ name: 'seek', elapsedMs: Math.round(now() - seek.at), basis: 'watchdog',
          outcome: 'timeout', position: state.currentTime, target: seek.target, reason: seek.reason, paused: state.paused })
      }
      publish('timeout')
    }, options.timeoutMs ?? 30000)
  }

  function load() {
    clearTimer()
    active = true
    suspended = false
    firstFrameRecorded = false
    firstPlayAt = null
    seek = null
    reason = 'load'
    publish('loading')
    arm()
  }

  function waiting() {
    if (!active || suspended) return
    const state = options.readState()
    if (state.hasError || state.ended) return
    // A paused metadata preload is not a playback stall. Keep only the initial
    // metadata deadline if no metadata has arrived at all.
    if (state.paused && !state.seeking) { ready(); return }
    if (canRecover(state) && state.bufferedAhead > 0.1) { ready(); return }
    reason = state.seeking ? 'seek' : 'play'
    if (phase !== 'timeout' && phase !== 'waiting') publish('waiting')
    arm()
  }

  function play() {
    if (!active || suspended) return
    if (!firstFrameRecorded && firstPlayAt === null) firstPlayAt = now()
    if (phase === 'timeout') phase = 'ready'
    ready()
    waiting()
  }

  function pause() {
    firstPlayAt = null
    const state = options.readState()
    if (!active || state.seeking) return
    // pause/load events queued by source replacement can arrive after the new
    // load has begun. They must not cancel its metadata deadline.
    if (phase === 'loading' && state.readyState === 0) return
    clearTimer()
    ready()
  }

  function seeking(seekReason: 'user' | 'resume' = 'user') {
    if (!active || suspended) return
    seek = { at: now(), target: options.readState().currentTime, reason: seekReason, completed: false }
    clearTimer()
    reason = 'seek'
    publish('waiting')
    arm()
  }

  function frame(basis: FrameBasis) {
    if (!active || suspended) return
    const state = options.readState()
    if (state.hasError || state.seeking || state.readyState < 2) return
    if (!firstFrameRecorded && firstPlayAt !== null && !state.paused && basis !== 'seeked') {
      firstFrameRecorded = true
      options.onMetric({ name: 'first-frame', elapsedMs: Math.round(now() - firstPlayAt), basis, outcome: 'ready',
        position: state.currentTime, paused: false })
      firstPlayAt = null
    }
    if (seek?.completed && (state.paused || basis !== 'seeked')) {
      options.onMetric({ name: 'seek', elapsedMs: Math.round(now() - seek.at), basis, outcome: 'ready',
        position: state.currentTime, target: seek.target, reason: seek.reason, paused: state.paused })
      seek = null
    }
    ready()
  }

  function seeked() {
    if (seek) seek.completed = true
    if (options.readState().paused) frame('seeked')
    ready()
  }

  function stop() {
    active = false
    clearTimer()
    firstPlayAt = null
    seek = null
  }

  function suspend() {
    suspended = true
    clearTimer()
    // Background throttling and time spent away are not playback latency.
    firstPlayAt = null
    seek = null
  }

  function wake() {
    suspended = false
    if (!active) return
    ready()
    if (phase === 'loading') arm()
    else waiting()
  }

  return { load, ready, waiting, play, pause, seeking, seeked, frame, stop, suspend, wake }
}

export function videoStartPosition(value: number, duration?: number) {
  const position = Number.isFinite(value) ? Math.max(0, value) : 0
  return duration !== undefined && Number.isFinite(duration) && duration > 0
    ? Math.min(position, Math.max(0, duration - 1)) : position
}
