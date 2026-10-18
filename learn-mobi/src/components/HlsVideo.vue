<script lang="ts">
import { defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Hls from 'hls.js'
import { createVideoPlaybackMonitor, videoStartPosition } from '../utils/videoPlayback'
import type { VideoPlaybackState } from '../utils/videoPlayback'

/**
 * H5 专用播放器。使用 render 函数创建原生 video，避免 uni-video 包装层阻止 hls.js
 * 取得 HTMLMediaElement。其他端继续使用 uni-app 原生 <video>。
 */
export default defineComponent({
  name: 'HlsVideo',
  inheritAttrs: false,
  props: {
    src: { type: String, default: '' },
    initialTime: { type: Number, default: 0 },
  },
  emits: ['loadstart', 'ready', 'waiting', 'timeout', 'playing', 'pause', 'timeupdate', 'ended', 'error', 'seeking', 'metric', 'playblocked'],
  setup(props, { emit, expose }) {
    const videoEl = ref<HTMLVideoElement | null>(null)
    let hls: Hls | null = null
    let generation = 0
    let networkRetries = 0
    let mediaRecoveries = 0
    let initialPosition = 0
    let lastPosition = 0
    let initialSeekPending = false
    let nativePositionApplied = false
    let usingHls = false
    let failed = false
    let frameCallback: number | null = null

    function readState(): VideoPlaybackState {
      const el = videoEl.value
      let bufferedAhead = 0
      if (el) {
        for (let i = 0; i < el.buffered.length; i++) {
          if (el.buffered.start(i) <= el.currentTime && el.buffered.end(i) >= el.currentTime) {
            bufferedAhead = el.buffered.end(i) - el.currentTime
            break
          }
        }
      }
      return { currentTime: el?.currentTime || 0, duration: el?.duration || 0, paused: el?.paused ?? true,
        seeking: el?.seeking ?? false, ended: el?.ended ?? false, readyState: el?.readyState || 0,
        bufferedAhead, hasError: !!el?.error }
    }

    const monitor = createVideoPlaybackMonitor({
      readState,
      onUpdate: ({ phase, reason, state }) => {
        const event = ({ loading: 'loadstart', ready: 'ready', waiting: 'waiting', timeout: 'timeout' } as const)[phase]
        emit(event, { detail: { ...state, reason } })
      },
      onMetric: metric => emit('metric', { detail: { ...metric, engine: usingHls ? 'hls.js' : 'native' } }),
    })

    function cancelFrame() {
      if (frameCallback !== null) videoEl.value?.cancelVideoFrameCallback?.(frameCallback)
      frameCallback = null
    }

    function observeFrame() {
      const el = videoEl.value
      if (!el || el.paused || typeof el.requestVideoFrameCallback !== 'function') return
      cancelFrame()
      const currentGeneration = generation
      frameCallback = el.requestVideoFrameCallback(() => {
        frameCallback = null
        if (currentGeneration === generation) monitor.frame('video-frame')
      })
    }

    function destroyHls() {
      if (hls) {
        hls.destroy()
        hls = null
      }
    }

    function resetElement() {
      const el = videoEl.value
      if (!el) return
      el.pause()
      el.removeAttribute('src')
      el.load()
    }

    function fail(message: string) {
      failed = true
      monitor.stop()
      cancelFrame()
      emit('error', { detail: { message, kind: 'fatal' } })
    }

    async function loadSource(position = props.initialTime) {
      const currentGeneration = ++generation
      monitor.stop()
      cancelFrame()
      destroyHls()
      resetElement()
      networkRetries = 0
      mediaRecoveries = 0
      initialPosition = videoStartPosition(position)
      lastPosition = initialPosition
      initialSeekPending = initialPosition > 0
      nativePositionApplied = false
      usingHls = false
      failed = false
      if (!props.src) return

      await nextTick()
      if (currentGeneration !== generation || !videoEl.value) return
      const el = videoEl.value
      const isHls = /\.m3u8(?:$|[?#])/i.test(props.src)
      monitor.load()
      if (document.hidden) monitor.suspend()

      if (!isHls || el.canPlayType('application/vnd.apple.mpegurl')) {
        el.src = props.src
        el.load()
        return
      }
      if (!Hls.isSupported()) {
        fail('当前浏览器不支持 HLS 播放')
        return
      }

      usingHls = true
      hls = new Hls({
        enableWorker: true,
        startLevel: -1,
        startPosition: initialPosition,
        capLevelToPlayerSize: true,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        backBufferLength: 30,
        manifestLoadingMaxRetry: 3,
        levelLoadingMaxRetry: 3,
        fragLoadingMaxRetry: 4,
      })
      hls.on(Hls.Events.LEVEL_LOADED, (_event, data) => {
        if (currentGeneration !== generation || !initialSeekPending || !hls) return
        const boundedPosition = videoStartPosition(initialPosition, data.details.totalduration)
        if (boundedPosition !== initialPosition) {
          initialPosition = boundedPosition
          lastPosition = boundedPosition
          hls.startLoad(initialPosition)
        }
      })
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (currentGeneration !== generation || !data.fatal || !hls) return
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR && networkRetries < 2) {
          networkRetries++
          hls.startLoad()
          return
        }
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR && mediaRecoveries < 1) {
          mediaRecoveries++
          hls.recoverMediaError()
          return
        }
        fail(data.details || 'HLS 播放失败')
      })
      hls.attachMedia(el)
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        if (currentGeneration === generation && hls) hls.loadSource(props.src)
      })
    }

    function restoreInitialTime() {
      const el = videoEl.value
      if (!el) return
      // hls.js loads the target fragment through startPosition, without first
      // fetching the opening fragment and then seeking a second time.
      if (!usingHls && !nativePositionApplied && Number.isFinite(el.duration)) {
        nativePositionApplied = true
        initialPosition = videoStartPosition(initialPosition, el.duration)
        lastPosition = initialPosition
        if (initialPosition > 0) el.currentTime = initialPosition
      }
      monitor.ready()
    }

    function reload() {
      const el = videoEl.value
      const position = el && el.readyState >= 1 ? el.currentTime : lastPosition
      void loadSource(position)
    }

    function resume() {
      const el = videoEl.value
      if (!el) return
      const currentGeneration = generation
      void el.play().catch((error: DOMException) => {
        if (currentGeneration !== generation || error.name === 'AbortError') return
        if (error.name === 'NotAllowedError') {
          monitor.pause()
          emit('playblocked')
        } else fail('视频无法播放，请重新加载')
      })
    }

    watch(() => props.src, () => { void loadSource() }, { immediate: true })
    function onVisibilityChange() {
      if (document.hidden) { monitor.suspend(); cancelFrame() }
      else { monitor.wake(); observeFrame() }
    }
    onMounted(() => document.addEventListener('visibilitychange', onVisibilityChange))
    onBeforeUnmount(() => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      generation++
      monitor.stop()
      cancelFrame()
      destroyHls()
      resetElement()
    })
    expose({ reload, resume })

    return () => h('video', {
      ref: videoEl,
      class: 'player',
      controls: true,
      playsinline: true,
      preload: 'metadata',
      onLoadedmetadata: restoreInitialTime,
      onCanplay: () => { monitor.ready(); observeFrame() },
      onLoadeddata: () => monitor.ready(),
      onProgress: () => monitor.ready(),
      onPlay: () => { monitor.play(); observeFrame() },
      onWaiting: () => monitor.waiting(),
      onStalled: () => monitor.waiting(),
      onSeeking: () => {
        cancelFrame()
        lastPosition = videoEl.value?.currentTime || 0
        monitor.seeking(initialSeekPending && Math.abs(lastPosition - initialPosition) < 1 ? 'resume' : 'user')
        emit('seeking')
      },
      onSeeked: () => {
        initialSeekPending = false
        monitor.seeked()
        observeFrame()
      },
      onPlaying: () => {
        const el = videoEl.value
        if (failed || !el || el.paused || el.readyState < 2 || el.error) return
        if (!el.seeking) initialSeekPending = false
        monitor.ready()
        if (typeof videoEl.value?.requestVideoFrameCallback === 'function') observeFrame()
        else monitor.frame('playing')
        emit('playing')
      },
      onPause: () => { cancelFrame(); monitor.pause(); emit('pause') },
      onTimeupdate: (event: Event) => {
        const el = event.currentTarget as HTMLVideoElement
        if (el.readyState >= 1 || el.currentTime > 0) lastPosition = el.currentTime
        monitor.ready()
        if (typeof el.requestVideoFrameCallback !== 'function') monitor.frame('timeupdate')
        emit('timeupdate', { detail: { currentTime: el.currentTime, duration: el.duration } })
      },
      onEnded: () => { monitor.pause(); cancelFrame(); emit('ended') },
      onError: () => { if (videoEl.value?.error) fail('视频资源加载失败') },
    })
  },
})
</script>

<style scoped>
.player {
  display: block;
  width: 100%;
  height: 100%;
  background: #000;
}
</style>
