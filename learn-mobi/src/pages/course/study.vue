<template>
  <view class="study-page">
    <view class="player-box">
      <video v-if="mediaType === 'video' && mediaSrc" :key="mediaSrc" class="player" :src="mediaSrc" :initial-time="playProgress" object-fit="contain" @timeupdate="onTimeUpdate" @ended="onVideoEnd" @error="onVideoError" @play="startTimer" @pause="pauseTimer" controls></video>
      <live-player v-if="mediaType === 'live'" class="player" :src="mediaSrc" @play="startTimer" @pause="pauseTimer" @error="onVideoError" autoplay></live-player>
      <view v-if="mediaType === 'video' && !mediaSrc" class="player-empty">暂无视频</view>
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
        <view class="d-item" v-for="ch in chapterAllList" :key="ch.id" :class="{ active: ch.id === currentChapterId }" @click="switchChapter(ch)">{{ ch.chapterName }}</view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { onLoad, onUnload, onHide } from '@dcloudio/uni-app'
import { getChapterDetail, getChapterList } from '../../api/course'
import { saveStudyRecord, batchUploadStudy } from '../../api/study'
import { StorageKey } from '../../utils/storage'
import { BASE_URL } from '../../env'

interface AttachItem { id: number; fileName: string; fileSize: string; fileUrl?: string }
interface VideoItem { id?: number; videoName: string; videoUrl: string; fileSize?: number }
interface ChatMsg { id: number; userName: string; content: string }

const cid = ref(0)
const currentChapterId = ref(0)
const currentChapterName = ref('')
const mediaType = ref<'video' | 'live'>('video')
const mediaSrc = ref('')
const videoList = ref<VideoItem[]>([])
const currentVideoIndex = ref(0)
const articleContent = ref('')
const attachList = ref<AttachItem[]>([])
const chapterAllList = ref<Array<{ id: number; chapterName: string }>>([])
const bottomTab = ref(2)
const drawerShow = ref(false)
const chatMsgs = ref<ChatMsg[]>([])
const chatInput = ref('')

// Timer / progress (mirrors old study.js behavior)
const playProgress = ref(0)
const playSecond = ref(0)
const totalStudySecond = ref(0)
let timer: ReturnType<typeof setInterval> | null = null
let lastUploadTime = 0
let lastTimeUpdate = 0

const progressPercent = computed(() => {
  if (!totalStudySecond.value) return 0
  return Math.min(100, Math.round((playSecond.value / Math.max(1, totalStudySecond.value)) * 100))
})
const liveAttachmentVideos = computed(() => mediaType.value === 'live' ? videoList.value : [])

onLoad((q: any) => {
  cid.value = Number(q.cid) || 0
  currentChapterId.value = Number(q.chId) || 0
  if (cid.value && currentChapterId.value) loadData()
})

// 关键修复：页面关闭/卸载时必须清理计时器。
// uni-app 页面生命周期中 onUnmounted 不一定触发，真正的页面销毁钩子是 onUnload；
// 若只靠 onUnmounted 清理，setInterval 会在后台持续运行（多次进出叠加多个定时器），
// 不断触发响应式重渲染与上报请求，最终拖垮 JS 线程 → 卡顿 / 卡退。
// 同时 onHide 时暂停计时，避免切后台仍累计时长。
function clearPlayTimer() { if (timer) { clearInterval(timer); timer = null } }
onUnload(() => { clearPlayTimer(); flushOfflineQueue() })
onHide(() => { pauseTimer() })
onUnmounted(() => { clearPlayTimer(); flushOfflineQueue() })

async function loadData() {
  // Load chapter detail
  try {
    const d = await getChapterDetail(currentChapterId.value, cid.value)
    videoList.value = (d.videoList || []).filter((item: VideoItem) => !!item.videoUrl)
    mediaType.value = d.mediaType === 'live' ? 'live' : 'video'
    currentVideoIndex.value = 0
    mediaSrc.value = mediaType.value === 'live' ? (d.mediaSrc || '') : (videoList.value[0]?.videoUrl || d.mediaSrc || '')
    articleContent.value = d.article || ''
    attachList.value = (d.attachList || []) as AttachItem[]
    const ch = chapterAllList.value.find((c) => c.id === currentChapterId.value)
    currentChapterName.value = ch?.chapterName || ''
  } catch (e) { uni.showToast({ title: '章节加载失败', icon: 'none' }) }
  // Load chapter list for drawer
  try {
    const res = await getChapterList(cid.value)
    chapterAllList.value = res.list || []
    const ch = (res.list || []).find((c: any) => c.id === currentChapterId.value)
    if (ch && !currentChapterName.value) currentChapterName.value = ch.chapterName
  } catch (e) { /* stub --- empty */ }
  // Restore local progress cache (mirrors old study.js: storage key study_record_{cid}_{chId})
  try {
    const cache = uni.getStorageSync(`study_record_${cid.value}_${currentChapterId.value}`)
    if (cache) {
      const c = typeof cache === 'string' ? JSON.parse(cache) : cache
      playSecond.value = c.playSecond || 0
      totalStudySecond.value = c.totalStudySecond || 0
      playProgress.value = playSecond.value
    }
  } catch (e) { /* ignore parse errors */ }
}

function onTimeUpdate(e: any) {
  const t = Math.floor(e.detail.currentTime || 0)
  // 节流：timeupdate 约每秒触发 4 次，降低刷新频率避免频繁重渲染造成卡顿
  const now = Date.now()
  if (now - lastTimeUpdate >= 1000 || t === 0) {
    lastTimeUpdate = now
    playSecond.value = t
  }
}
function onVideoError() {
  uni.showToast({ title: '视频加载失败，请稍后重试', icon: 'none' })
}
function onVideoEnd() { pauseTimer(); uploadRecord() }
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

function switchChapter(ch: { id: number; chapterName: string }) {
  drawerShow.value = false
  pauseTimer()
  currentChapterId.value = ch.id
  currentChapterName.value = ch.chapterName
  videoList.value = []
  currentVideoIndex.value = 0
  mediaSrc.value = ''
  playSecond.value = 0; totalStudySecond.value = 0; playProgress.value = 0
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
  mediaSrc.value = video.videoUrl
  playSecond.value = 0
  playProgress.value = 0
  lastUploadTime = 0
  lastTimeUpdate = 0
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
    header: { Authorization: 'Bearer ' + (uni.getStorageSync('access_token') || '') },
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
.player-back { position: absolute; top: 12px; left: 12px; width: 30px; height: 30px; border-radius: 50%; background: rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; }
.player-menu { position: absolute; top: 12px; right: 12px; width: 30px; height: 30px; border-radius: 50%; background: rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; }
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
.d-item { padding: 14px 16px; font-size: 14px; color: $text-2; border-bottom: 1px solid $border; }
.d-item.active { color: $primary; background: $primary-bg; }
</style>
