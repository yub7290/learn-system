<template>
  <view class="study-page">
    <view class="player-box">
      <!-- #ifdef H5 -->
      <HlsVideo v-if="mediaType === 'video' && mediaSrc" ref="hlsVideo" :key="playerKey" class="player" :src="mediaSrc" :initial-time="playProgress" @loadstart="onMediaLoadStart" @ready="onMediaReady" @waiting="onMediaWaiting" @timeout="onMediaTimeout" @seeking="clearPlayTimer" @playing="onMediaPlaying" @timeupdate="onTimeUpdate" @ended="onVideoEnd" @error="onVideoError" @pause="onMediaPause" @metric="onPlaybackMetric" @playblocked="onPlayBlocked" />
      <!-- #endif -->
      <!-- #ifndef H5 -->
      <video v-if="mediaType === 'video' && mediaSrc" :key="playerKey" class="player" :src="mediaSrc" :initial-time="playProgress" object-fit="contain" @loadstart="onMediaLoadStart" @loadedmetadata="onMediaReady" @canplay="onMediaReady" @waiting="onMediaWaiting" @playing="onMediaPlaying" @timeupdate="onTimeUpdate" @ended="onVideoEnd" @error="onVideoError" @play="startTimer" @pause="onMediaPause" controls></video>
      <!-- #endif -->
      <live-player v-if="mediaType === 'live'" class="player" :src="mediaSrc" @play="onMediaPlaying" @statechange="onLiveStateChange" @pause="pauseTimer" @error="onVideoError" autoplay></live-player>
      <view v-if="!chapterLoading && mediaType === 'video' && !mediaSrc && !mediaError" class="player-empty">暂无视频</view>
      <view v-if="chapterLoading || mediaLoading" class="player-loading" role="status" aria-live="polite">
        <view class="loading-spinner"></view>
        <text>{{ chapterLoading ? '章节内容加载中...' : '视频缓冲中...' }}</text>
      </view>
      <view v-if="mediaError" class="player-error" :class="{ 'player-error-soft': mediaErrorKind === 'timeout' }">
        <view class="player-notice" :role="mediaErrorKind === 'timeout' ? 'status' : 'alert'" aria-live="polite">
          <text>{{ mediaError }}</text>
          <view class="player-actions">
            <!-- #ifdef H5 -->
            <button v-if="mediaErrorKind === 'timeout'" class="retry-button" @click="resumeVideo">尝试播放</button>
            <!-- #endif -->
            <button class="retry-button" @click="retryCurrentChapter">重新加载</button>
          </view>
        </view>
      </view>
      <view class="player-back" @click="goBack"><u-icon name="arrow-left" color="#fff" size="20"></u-icon></view>
      <view class="player-menu" @click="drawerShow = true"><u-icon name="list" color="#fff" size="20"></u-icon></view>
    </view>

    <view class="ch-bar">
      <text class="ch-title">{{ currentChapterName || '加载中...' }}</text>
      <text class="ch-progress">已学 {{ progressPercent }}%</text>
    </view>

    <scroll-view v-if="mediaType === 'video' && videoList.length > 1" scroll-x class="video-scroll">
      <view class="video-strip">
        <view
          class="video-chip"
          v-for="(video, index) in videoList"
          :key="video.videoUrl || index"
          :class="{ active: index === currentVideoIndex }"
          @click="switchVideo(index)"
        >
          {{ video.videoName || `视频${index + 1}` }}
        </view>
      </view>
    </scroll-view>

    <view class="tab-bar">
      <view class="tab-item" :class="{ active: bottomTab === 0 }" @click="handleTabClick(0)">章节列表</view>
      <view class="tab-item" :class="{ active: bottomTab === 1 }" @click="handleTabClick(1)">交流</view>
      <view class="tab-item" :class="{ active: bottomTab === 2 }" @click="handleTabClick(2)">学习内容</view>
      <view class="tab-item" :class="{ active: bottomTab === 3 }" @click="handleTabClick(3)">附件</view>
    </view>

    <view class="content">
      <view v-if="bottomTab === 0" class="empty-tab">点击底部"章节列表"按钮选择章节</view>
      <view v-if="bottomTab === 1" class="chat-region">
        <view v-if="mediaType === 'video'" class="chat-tip">录播视频暂不支持实时交流</view>
        <template v-else>
          <scroll-view scroll-y class="chat-list">
            <view class="msg" v-for="m in chatMsgs" :key="m.id"><text class="msg-user">{{ m.userName }}:</text> {{ m.content }}</view>
          </scroll-view>
          <view class="chat-input-bar">
            <u-input v-model="chatInput" placeholder="输入消息" border="none" @confirm="sendChat"></u-input>
            <u-button type="primary" size="mini" @click="sendChat">发送</u-button>
          </view>
        </template>
      </view>
      <view v-if="bottomTab === 2" class="article"><rich-text :nodes="articleContent"></rich-text></view>
      <view v-if="bottomTab === 3" class="attach-list">
        <view class="attach-item video-attach" v-for="(video, index) in liveAttachmentVideos" :key="video.videoUrl || index">
          <view class="a-icon-wrap a-icon-video">
            <u-icon name="play-circle" color="#fff" size="18"></u-icon>
          </view>
          <view class="a-info">
            <text class="a-name">{{ video.videoName || `视频${index + 1}` }}</text>
            <text class="a-size">{{ video.fileSize ? formatFileSize(video.fileSize) : '视频文件' }}</text>
          </view>
        </view>
        <view class="attach-item" v-for="f in attachList" :key="f.id" @click="downloadFile(f)">
          <view :class="['a-icon-wrap', getFileIconClass(f.fileName)]">
            <u-icon :name="getFileIcon(f.fileName)" color="#fff" size="18"></u-icon>
          </view>
          <view class="a-info">
            <text class="a-name">{{ f.fileName }}</text>
            <text class="a-size">{{ formatFileSize(f.fileSize) }}</text>
          </view>
          <view class="a-download">
            <u-icon name="download" color="#0195ff" size="20"></u-icon>
          </view>
        </view>
        <view v-if="!attachList.length && !liveAttachmentVideos.length" class="attach-empty">
          <u-icon name="folder" color="#c0c4cc" size="48"></u-icon>
          <text class="attach-empty-text">暂无附件</text>
        </view>
      </view>
    </view>

    <view class="mask" v-if="drawerShow" @click="drawerShow = false"></view>
    <view class="drawer" :class="{ open: drawerShow }">
      <view class="drawer-title">全部章节</view>
      <scroll-view scroll-y class="drawer-scroll">
        <view
          class="d-item"
          v-for="row in chapterTreeRows"
          :key="row.node.id"
          :class="{ active: row.node.id === currentChapterId, parent: row.hasChildren }"
          :style="{ paddingLeft: `${12 + row.depth * 18}px` }"
          @click="selectChapterNode(row.node)"
        >
          <u-icon v-if="row.hasChildren" :name="expandedChapterIds.has(row.node.id) ? 'arrow-down' : 'arrow-right'" color="#9aa4b2" size="13" class="d-toggle"></u-icon>
          <view v-else class="d-toggle-spacer"></view>
          <text>{{ row.node.chapterName }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onUnmounted } from 'vue'
import { onLoad, onUnload, onHide } from '@dcloudio/uni-app'
// #ifdef H5
import HlsVideo from '../../components/HlsVideo.vue'
// #endif
import { getChapterDetail, getChapterList } from '../../api/course'
import { saveStudyRecord, batchUploadStudy } from '../../api/study'
import { StorageKey } from '../../utils/storage'
import { BASE_URL } from '../../env'
import { requireLogin } from '../../utils/auth'
import { COURSE_NO_ACCESS_CODE, showNoAccessModal } from '../../utils/permission'
import type { ChapterListItem } from '../../types/course'
import type { VideoPlaybackMetric } from '../../utils/videoPlayback'

interface AttachItem { id: number; fileName: string; fileSize: string; fileUrl?: string }
interface VideoItem { id?: number; videoName: string; videoUrl: string; fileSize?: number }
interface ChatMsg { id: number; userName: string; content: string }
interface ChapterTreeRow { node: ChapterListItem; depth: number; hasChildren: boolean }

const cid = ref(0)
const currentChapterId = ref(0)
const currentChapterName = ref('')
const mediaType = ref<'video' | 'live'>('video')
const mediaSrc = ref('')
const chapterLoading = ref(false)
const mediaLoading = ref(false)
const mediaError = ref('')
const mediaErrorKind = ref<'timeout' | 'fatal' | ''>('')
const hlsVideo = ref<{ reload: () => void; resume: () => void } | null>(null)
const playerKey = ref(0)
const videoList = ref<VideoItem[]>([])
const currentVideoIndex = ref(0)
const articleContent = ref('')
const attachList = ref<AttachItem[]>([])
const chapterAllList = ref<ChapterListItem[]>([])
const expandedChapterIds = ref(new Set<number>())
const bottomTab = ref(2)
const drawerShow = ref(false)
const chatMsgs = ref<ChatMsg[]>([])
const chatInput = ref('')

// Timer / progress (mirrors old study.js behavior)
const playProgress = ref(0)
const playSecond = ref(0)
const totalStudySecond = ref(0)
const mediaDuration = ref(0)
let timer: ReturnType<typeof setInterval> | null = null
let lastUploadTime = 0
let lastTimeUpdate = 0
let chapterRequestId = 0
let mediaLoadTimer: ReturnType<typeof setTimeout> | null = null

const progressPercent = computed(() => {
  if (!mediaDuration.value) return 0
  return Math.min(100, Math.round((playSecond.value / Math.max(1, mediaDuration.value)) * 100))
})
const liveAttachmentVideos = computed(() => mediaType.value === 'live' ? videoList.value : [])
const chapterTreeRows = computed<ChapterTreeRow[]>(() => {
  const rows: ChapterTreeRow[] = []
  const walk = (nodes: ChapterListItem[], depth: number) => {
    nodes.forEach((node) => {
      const hasChildren = !!node.children?.length
      rows.push({ node, depth, hasChildren })
      if (hasChildren && expandedChapterIds.value.has(node.id)) walk(node.children!, depth + 1)
    })
  }
  walk(chapterAllList.value, 0)
  return rows
})

onLoad((q: any) => {
  cid.value = Number(q.cid) || 0
  currentChapterId.value = Number(q.chId) || 0
  if (!cid.value || !currentChapterId.value) {
    uni.showToast({ title: '课程参数错误', icon: 'none' })
    setTimeout(() => uni.navigateBack().catch(() => uni.reLaunch({ url: '/pages/course/course' })), 1200)
    return
  }
  // 加载即触发服务端权限校验；未登录/无权限由 loadData 统一拦截（阻断深度链接）
  loadData()
})

// 关键修复：页面关闭/卸载时必须清理计时器。
// uni-app 页面生命周期中 onUnmounted 不一定触发，真正的页面销毁钩子是 onUnload；
// 若只靠 onUnmounted 清理，setInterval 会在后台持续运行（多次进出叠加多个定时器），
// 不断触发响应式重渲染与上报请求，最终拖垮 JS 线程 → 卡顿 / 卡退。
// 同时 onHide 时暂停计时，避免切后台仍累计时长。
function clearPlayTimer() { if (timer) { clearInterval(timer); timer = null } }
function clearMediaLoadTimer() { if (mediaLoadTimer) { clearTimeout(mediaLoadTimer); mediaLoadTimer = null } }
function invalidatePendingLoad() { chapterRequestId++; clearMediaLoadTimer() }
onUnload(() => { invalidatePendingLoad(); clearPlayTimer(); flushOfflineQueue() })
onHide(() => { clearMediaLoadTimer(); pauseTimer() })
onUnmounted(() => { invalidatePendingLoad(); clearPlayTimer(); flushOfflineQueue() })

async function loadData() {
  const requestId = ++chapterRequestId
  const chapterId = currentChapterId.value
  chapterLoading.value = true
  mediaLoading.value = true
  mediaError.value = ''
  mediaErrorKind.value = ''
  try {
    const [d, res] = await Promise.all([
      getChapterDetail(chapterId, cid.value),
      chapterAllList.value.length
        ? Promise.resolve({ list: chapterAllList.value })
        : getChapterList(cid.value),
    ])
    if (requestId !== chapterRequestId || chapterId !== currentChapterId.value) return

    chapterAllList.value = res.list || []
    expandChapterPath(chapterId)
    videoList.value = (d.videoList || []).filter((item: VideoItem) => !!item.videoUrl)
    mediaType.value = d.mediaType === 'live' ? 'live' : 'video'
    currentVideoIndex.value = 0
    const nextMediaSrc = mediaType.value === 'live' ? (d.mediaSrc || '') : (videoList.value[0]?.videoUrl || d.mediaSrc || '')
    // 兼容旧的父章节深链接：父节点本身没有视频时自动进入第一个叶子章节。
    const selectedNode = findChapterNode(chapterAllList.value, chapterId)
    const firstLeaf = selectedNode?.children?.length ? findFirstLeaf(selectedNode) : null
    if (!nextMediaSrc && firstLeaf && firstLeaf.id !== chapterId) {
      currentChapterId.value = firstLeaf.id
      return loadData()
    }
    articleContent.value = d.article || ''
    attachList.value = (d.attachList || []) as AttachItem[]
    const ch = findChapterNode(chapterAllList.value, chapterId)
    currentChapterName.value = ch?.chapterName || ''
    try {
      const cache = uni.getStorageSync(`study_record_${cid.value}_${chapterId}`)
      if (cache) {
        const c = typeof cache === 'string' ? JSON.parse(cache) : cache
        playSecond.value = c.playSecond || 0
        totalStudySecond.value = c.totalStudySecond || 0
        playProgress.value = playSecond.value
      }
    } catch (e) { /* ignore damaged local cache */ }

    mediaSrc.value = nextMediaSrc
    playerKey.value++
    await nextTick()
    if (requestId !== chapterRequestId) return
    chapterLoading.value = false
    if (!nextMediaSrc) mediaLoading.value = false
    // H5 watchdog reads the actual media state inside HlsVideo.
    // #ifndef H5
    else armMediaLoadTimeout()
    // #endif
  } catch (e: any) {
    if (requestId !== chapterRequestId) return
    chapterLoading.value = false
    mediaLoading.value = false
    mediaSrc.value = ''
    if (e?.code === COURSE_NO_ACCESS_CODE) {
      showNoAccessModal(cid.value)
      return
    }
    if (e?.message === 'unauthorized') {
      requireLogin('登录后才能开始学习')
      return
    }
    mediaError.value = '章节加载失败，请检查网络后重试'
    mediaErrorKind.value = 'fatal'
  }
}

function onTimeUpdate(e: any) {
  const t = Math.floor(e.detail.currentTime || 0)
  const duration = Math.floor(e.detail.duration || 0)
  if (duration > 0) mediaDuration.value = duration
  // 节流：timeupdate 约每秒触发 4 次，降低刷新频率避免频繁重渲染造成卡顿
  const now = Date.now()
  if (now - lastTimeUpdate >= 1000 || t === 0) {
    lastTimeUpdate = now
    playSecond.value = t
  }
}
function armMediaLoadTimeout() {
  if (mediaLoadTimer) return
  mediaLoadTimer = setTimeout(() => {
    mediaLoadTimer = null
    if (!mediaLoading.value) return
    onMediaTimeout()
  }, 30000)
}
function onMediaLoadStart() {
  mediaLoading.value = true
  mediaError.value = ''
  mediaErrorKind.value = ''
  // #ifndef H5
  armMediaLoadTimeout()
  // #endif
}
function onMediaReady(e?: any) {
  const duration = Math.floor(e?.detail?.duration || 0)
  if (duration > 0) mediaDuration.value = duration
  mediaLoading.value = false
  clearMediaLoadTimer()
  // Metadata/progress may recover a timeout, but must not dismiss a real failure.
  if (mediaErrorKind.value === 'timeout') {
    mediaError.value = ''
    mediaErrorKind.value = ''
  }
}
function onMediaWaiting() {
  if (!chapterLoading.value) {
    mediaLoading.value = true
    clearPlayTimer()
    // #ifndef H5
    armMediaLoadTimeout()
    // #endif
  }
}
function onMediaTimeout(e?: any) {
  if (mediaErrorKind.value === 'fatal') return
  mediaLoading.value = false
  mediaErrorKind.value = 'timeout'
  mediaError.value = e?.detail?.reason === 'seek'
    ? '视频定位较慢，可继续等待或重新加载'
    : '视频准备较慢，可点击播放或重新加载'
  clearMediaLoadTimer()
  clearPlayTimer()
}
function onMediaPlaying() {
  onMediaReady()
  if (mediaErrorKind.value === 'fatal') return
  startTimer()
}
function onMediaPause() {
  clearMediaLoadTimer()
  mediaLoading.value = false
  pauseTimer()
}
function resumeVideo() { hlsVideo.value?.resume() }
function onPlayBlocked() { uni.showToast({ title: '请点击播放器的播放按钮', icon: 'none' }) }
function onPlaybackMetric(e: { detail: VideoPlaybackMetric & { engine: string } }) {
  // Local diagnostics only: no playback URL, token or account information.
  const record = { ...e.detail, at: new Date().toISOString(), courseId: cid.value,
    chapterId: currentChapterId.value, videoIndex: currentVideoIndex.value }
  console.info('[video-playback]', record)
  // #ifdef H5
  try {
    const key = 'learn-video-playback-metrics'
    const previous = JSON.parse(sessionStorage.getItem(key) || '[]')
    const records = Array.isArray(previous) ? previous.slice(-49) : []
    records.push(record)
    sessionStorage.setItem(key, JSON.stringify(records))
  } catch { /* Private browsing/storage limits must not affect playback. */ }
  // #endif
}
function onLiveStateChange(e: any) {
  const code = Number(e?.detail?.code)
  if ([2004, 2007].includes(code)) onMediaReady()
  if (code < 0) onVideoError({ detail: { message: '直播流加载失败' } })
}
function onVideoError(e?: any) {
  mediaLoading.value = false
  clearMediaLoadTimer()
  mediaError.value = e?.detail?.message || '视频加载失败，请稍后重试'
  mediaErrorKind.value = 'fatal'
  clearPlayTimer()
}
function onVideoEnd() { pauseTimer() }
function startTimer() { if (timer) return; timer = setInterval(() => { totalStudySecond.value++; const now = Date.now(); if (now - lastUploadTime > 15000) { lastUploadTime = now; uploadRecord() } }, 1000) }
function pauseTimer() { clearPlayTimer(); uploadRecord() }

async function uploadRecord() {
  const record = { courseId: cid.value, chapterId: currentChapterId.value, playSecond: playSecond.value, totalStudySecond: totalStudySecond.value }
  uni.setStorageSync(`study_record_${cid.value}_${currentChapterId.value}`, record)
  try { await saveStudyRecord(record) } catch (e) {
    // Offline queue (mirrors old study.js)
    const queue: any[] = []
    try { const q = uni.getStorageSync(StorageKey.STUDY_OFFLINE_QUEUE); if (q) { const parsed = typeof q === 'string' ? JSON.parse(q) : q; if (Array.isArray(parsed)) queue.push(...parsed) } } catch (ex) {}
    queue.push(record)
    uni.setStorageSync(StorageKey.STUDY_OFFLINE_QUEUE, queue)
  }
}

function flushOfflineQueue() {
  let queue: any[] = []
  try { const q = uni.getStorageSync(StorageKey.STUDY_OFFLINE_QUEUE); if (q) { const parsed = typeof q === 'string' ? JSON.parse(q) : q; if (Array.isArray(parsed)) queue = parsed } } catch (e) {}
  if (!queue.length) return
  batchUploadStudy(queue).then(() => { uni.removeStorageSync(StorageKey.STUDY_OFFLINE_QUEUE) }).catch(() => { /* keep for next retry */ })
}

function findChapterNode(nodes: ChapterListItem[], id: number): ChapterListItem | null {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children?.length) {
      const found = findChapterNode(node.children, id)
      if (found) return found
    }
  }
  return null
}

function findFirstLeaf(node: ChapterListItem): ChapterListItem | null {
  if (!node.children?.length) return node
  for (const child of node.children) {
    const leaf = findFirstLeaf(child)
    if (leaf) return leaf
  }
  return null
}

function findChapterPath(nodes: ChapterListItem[], id: number, path: number[] = []): number[] | null {
  for (const node of nodes) {
    const nextPath = [...path, node.id]
    if (node.id === id) return nextPath
    if (node.children?.length) {
      const found = findChapterPath(node.children, id, nextPath)
      if (found) return found
    }
  }
  return null
}

function expandChapterPath(id: number) {
  const path = findChapterPath(chapterAllList.value, id)
  if (!path || path.length < 2) return
  expandedChapterIds.value = new Set(path.slice(0, -1))
}

function selectChapterNode(ch: ChapterListItem) {
  if (ch.children?.length) {
    const expanded = new Set(expandedChapterIds.value)
    expanded.has(ch.id) ? expanded.delete(ch.id) : expanded.add(ch.id)
    expandedChapterIds.value = expanded
    return
  }
  switchChapter(ch)
}

function switchChapter(ch: ChapterListItem) {
  drawerShow.value = false
  if (ch.children?.length) {
    selectChapterNode(ch)
    return
  }
  if (ch.id === currentChapterId.value) return
  invalidatePendingLoad()
  pauseTimer()
  currentChapterId.value = ch.id
  currentChapterName.value = ch.chapterName
  videoList.value = []
  currentVideoIndex.value = 0
  mediaSrc.value = ''
  playSecond.value = 0; totalStudySecond.value = 0; playProgress.value = 0
  mediaDuration.value = 0
  lastUploadTime = 0
  lastTimeUpdate = 0
  timer = null
  loadData()
}

function switchVideo(index: number) {
  const video = videoList.value[index]
  if (!video || index === currentVideoIndex.value) return
  pauseTimer()
  currentVideoIndex.value = index
  mediaError.value = ''
  mediaErrorKind.value = ''
  mediaLoading.value = true
  // #ifndef H5
  armMediaLoadTimeout()
  // #endif
  mediaSrc.value = video.videoUrl
  playerKey.value++
  playSecond.value = 0
  playProgress.value = 0
  mediaDuration.value = 0
  lastUploadTime = 0
  lastTimeUpdate = 0
}

function retryCurrentChapter() {
  // Keep the selected video and its current position when reloading the media.
  // Chapter/API failures still go through loadData and its permission checks.
  // #ifdef H5
  if (mediaSrc.value && hlsVideo.value) {
    clearMediaLoadTimer()
    clearPlayTimer()
    mediaError.value = ''
    mediaErrorKind.value = ''
    hlsVideo.value.reload()
    return
  }
  // #endif
  invalidatePendingLoad()
  pauseTimer()
  mediaError.value = ''
  mediaErrorKind.value = ''
  mediaSrc.value = ''
  loadData()
}

function handleTabClick(idx: number) {
  if (idx === 4) { goBack(); return }
  if (idx === 0) { drawerShow.value = true; return }
  bottomTab.value = idx
}

function goBack() { pauseTimer(); uni.navigateBack().catch(() => uni.reLaunch({ url: `/pages/course/detail?cid=${cid.value}` })) }

function sendChat() {
  if (!chatInput.value.trim()) return
  chatMsgs.value.push({ id: Date.now(), userName: '我', content: chatInput.value })
  chatInput.value = ''
}
function downloadFile(f: AttachItem) {
  if (!f.fileUrl) {
    uni.showToast({ title: '文件地址不可用', icon: 'none' })
    return
  }
  const downloadUrl = `${BASE_URL}/edu/upload/download?fileUrl=${encodeURIComponent(f.fileUrl)}&fileName=${encodeURIComponent(f.fileName)}`
  // #ifdef H5
  window.open(downloadUrl, '_blank')
  // #endif
  // #ifndef H5
  uni.showLoading({ title: '下载中...', mask: true })
  uni.downloadFile({
    url: downloadUrl,
    header: { Authorization: 'Bearer ' + (uni.getStorageSync(StorageKey.ACCESS_TOKEN) || '') },
    success(res) {
      uni.hideLoading()
      if (res.statusCode === 200) {
        uni.openDocument({ filePath: res.tempFilePath, showMenu: true })
      } else {
        uni.showToast({ title: '下载失败', icon: 'none' })
      }
    },
    fail() {
      uni.hideLoading()
      uni.showToast({ title: '下载失败', icon: 'none' })
    }
  })
  // #endif
}
function formatVideoSize(size?: number) {
  if (!size) return '视频'
  if (size < 1024 * 1024) return `${Math.round(size / 1024)}KB`
  return `${(size / 1024 / 1024).toFixed(1)}MB`
}

function formatFileSize(size: any): string {
  const n = Number(size)
  if (!n || isNaN(n)) return ''
  if (n < 1024) return `${n}B`
  if (n < 1024 * 1024) return `${Math.round(n / 1024)}KB`
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)}MB`
  return `${(n / 1024 / 1024 / 1024).toFixed(1)}GB`
}

function getFileIcon(name: string): string {
  const ext = (name || '').split('.').pop()?.toLowerCase() || ''
  if (['mp4', 'avi', 'mov', 'flv', 'wmv', 'mkv'].includes(ext)) return 'play-circle'
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'image'
  if (['mp3', 'wav', 'aac', 'flac'].includes(ext)) return 'music'
  if (['zip', 'rar', '7z'].includes(ext)) return 'zip'
  if (['doc', 'docx'].includes(ext)) return 'file-text'
  if (['xls', 'xlsx'].includes(ext)) return 'list'
  if (['ppt', 'pptx'].includes(ext)) return 'order'
  if (ext === 'pdf') return 'file-text'
  return 'file'
}

function getFileIconClass(name: string): string {
  const ext = (name || '').split('.').pop()?.toLowerCase() || ''
  if (['mp4', 'avi', 'mov', 'flv', 'wmv', 'mkv'].includes(ext)) return 'a-icon-video'
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'a-icon-image'
  if (['doc', 'docx'].includes(ext)) return 'a-icon-doc'
  if (['xls', 'xlsx'].includes(ext)) return 'a-icon-excel'
  if (['ppt', 'pptx'].includes(ext)) return 'a-icon-ppt'
  if (ext === 'pdf') return 'a-icon-pdf'
  if (['zip', 'rar', '7z'].includes(ext)) return 'a-icon-zip'
  return 'a-icon-file'
}
</script>

<style scoped lang="scss">
.study-page { min-height: 100vh; background: $bg-card; display: flex; flex-direction: column; }
.player-box { position: relative; height: 220px; background: #000; }
.player { width: 100%; height: 100%; }
.player-empty { height: 100%; display: flex; align-items: center; justify-content: center; color: #a8b0bd; font-size: 14px; }
.player-loading, .player-error { position: absolute; inset: 0; z-index: 3; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: #d7dce5; font-size: 13px; background: rgba(0,0,0,.35); pointer-events: none; }
.player-error-soft { background: transparent; }
.player-notice { max-width: calc(100% - 80px); padding: 10px 12px; border-radius: 8px; background: rgba(0,0,0,.8); text-align: center; pointer-events: auto; }
.player-actions { display: flex; justify-content: center; gap: 8px; margin-top: 8px; }
.loading-spinner { width: 28px; height: 28px; border: 3px solid rgba(255,255,255,.25); border-top-color: #fff; border-radius: 50%; animation: player-spin .8s linear infinite; }
.retry-button { display: flex; align-items: center; justify-content: center; min-height: 44px; margin: 0; padding: 0 12px; font-size: 13px; line-height: 1.4; color: #fff; background: transparent; border: 1px solid rgba(255,255,255,.75); border-radius: 16px; }
.retry-button::after { border: 0; }
@keyframes player-spin { to { transform: rotate(360deg); } }
.player-back { position: absolute; z-index: 4; top: 12px; left: 12px; width: 30px; height: 30px; border-radius: 50%; background: rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; }
.player-menu { position: absolute; z-index: 4; top: 12px; right: 12px; width: 30px; height: 30px; border-radius: 50%; background: rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; }
.ch-bar { display: flex; align-items: center; padding: 12px 14px; border-bottom: 1px solid $border; }
.ch-title { font-size: 14px; font-weight: 600; color: $text-1; flex: 1; }
.ch-progress { font-size: 11px; color: $text-3; }
.video-scroll { white-space: nowrap; border-bottom: 1px solid $border; background: $bg-card; }
.video-strip { display: inline-flex; gap: 8px; padding: 10px 14px; }
.video-chip { max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; color: $text-2; background: $bg-page; border: 1px solid $border; border-radius: 14px; padding: 5px 12px; }
.video-chip.active { color: $primary; border-color: $primary; background: $primary-bg; font-weight: 600; }
.tab-bar { display: flex; border-bottom: 1px solid $border; }
.tab-item { flex: 1; text-align: center; padding: 10px 0; font-size: 12px; color: $text-3; }
.tab-item.active { color: $primary; font-weight: 600; }
.content { flex: 1; padding: 14px; }
.empty-tab { text-align: center; color: $text-3; padding: 40px 0; }
.chat-tip { text-align: center; color: $text-3; padding: 30px 0; }
.chat-list { height: 300px; }
.msg { font-size: 13px; padding: 6px 0; color: $text-1; }
.msg-user { color: $primary; }
.chat-input-bar { display: flex; gap: 8px; align-items: center; margin-top: 8px; }
.article { font-size: 14px; color: $text-2; line-height: 1.7; }
.attach-list { padding: 4px 0; }
.attach-item { display: flex; align-items: center; padding: 14px 12px; margin: 0 0 8px; background: $bg-card; border-radius: 10px; gap: 12px; box-shadow: 0 1px 4px rgba(0,0,0,.04); }
.attach-item:active { background: #f5f7fa; }
.a-icon-wrap { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.a-icon-video { background: linear-gradient(135deg, #36d1dc, #5b86e5); }
.a-icon-image { background: linear-gradient(135deg, #f093fb, #f5576c); }
.a-icon-doc { background: linear-gradient(135deg, #4facfe, #00f2fe); }
.a-icon-excel { background: linear-gradient(135deg, #43e97b, #38f9d7); }
.a-icon-ppt { background: linear-gradient(135deg, #fa709a, #fee140); }
.a-icon-pdf { background: linear-gradient(135deg, #f5576c, #ff6a88); }
.a-icon-zip { background: linear-gradient(135deg, #a18cd1, #fbc2eb); }
.a-icon-file { background: linear-gradient(135deg, #89f7fe, #66a6ff); }
.a-info { flex: 1; min-width: 0; }
.a-name { display: block; font-size: 14px; color: $text-1; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.a-size { display: block; font-size: 11px; color: $text-3; margin-top: 3px; }
.a-download { width: 36px; height: 36px; border-radius: 50%; background: $primary-bg; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.attach-empty { display: flex; flex-direction: column; align-items: center; padding: 48px 0; }
.attach-empty-text { font-size: 13px; color: $text-3; margin-top: 10px; }
.mask { position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 99; }
.drawer { position: fixed; left: 0; top: 0; bottom: 0; width: 72%; background: $bg-card; transform: translateX(-100%); transition: transform .25s; z-index: 100; padding-top: 44px; }
.drawer.open { transform: translateX(0); }
.drawer-title { font-size: 15px; font-weight: 700; padding: 14px 16px; color: $text-1; }
.drawer-scroll { height: calc(100vh - 50px); }
.d-item { display: flex; align-items: center; gap: 5px; min-height: 46px; padding-top: 12px; padding-right: 16px; padding-bottom: 12px; font-size: 14px; color: $text-2; border-bottom: 1px solid $border; box-sizing: border-box; }
.d-item.parent { font-weight: 600; color: $text-1; }
.d-item.active { color: $primary; background: $primary-bg; }
.d-toggle { flex: 0 0 13px; }
.d-toggle-spacer { width: 13px; flex: 0 0 13px; }
</style>
