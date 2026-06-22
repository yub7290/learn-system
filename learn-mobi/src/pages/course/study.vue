<template>
  <view class="study-page">
    <view class="player-box">
      <video v-if="mediaType === 'video'" class="player" :src="mediaSrc" :initial-time="playProgress" @timeupdate="onTimeUpdate" @ended="onVideoEnd" @play="startTimer" @pause="pauseTimer" controls></video>
      <live-player v-if="mediaType === 'live'" class="player" :src="mediaSrc" @play="startTimer" @pause="pauseTimer" autoplay></live-player>
      <view class="player-back" @click="goBack"><u-icon name="arrow-left" color="#fff" size="20"></u-icon></view>
      <view class="player-menu" @click="drawerShow = true"><u-icon name="list" color="#fff" size="20"></u-icon></view>
    </view>

    <view class="ch-bar">
      <text class="ch-title">{{ currentChapterName || '加载中...' }}</text>
      <text class="ch-progress">已学 {{ progressPercent }}%</text>
    </view>

    <view class="tab-bar">
      <view class="tab-item" :class="{ active: bottomTab === 0 }" @click="bottomTab = 0">章节列表</view>
      <view class="tab-item" :class="{ active: bottomTab === 1 }" @click="bottomTab = 1">交流</view>
      <view class="tab-item" :class="{ active: bottomTab === 2 }" @click="bottomTab = 2">学习内容</view>
      <view class="tab-item" :class="{ active: bottomTab === 3 }" @click="bottomTab = 3">附件</view>
      <view class="tab-item" :class="{ active: bottomTab === 4 }" @click="goBack">返回课程</view>
    </view>

    <view class="content">
      <view v-if="bottomTab === 0" class="empty-tab">章节列表请点右上角目录</view>
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
        <view class="attach-item" v-for="f in attachList" :key="f.id">
          <text class="a-name">{{ f.fileName }}</text>
          <text class="a-size">{{ f.fileSize }}</text>
          <u-button type="primary" size="mini" @click="downloadFile(f)">下载</u-button>
        </view>
        <u-empty v-if="!attachList.length" text="暂无附件" mode="list" margin-top="30"></u-empty>
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
import { onLoad } from '@dcloudio/uni-app'
import { getChapterDetail, getChapterList } from '../../api/course'
import { saveStudyRecord, batchUploadStudy } from '../../api/study'
import { StorageKey } from '../../utils/storage'

interface AttachItem { id: number; fileName: string; fileSize: string; fileUrl?: string }
interface ChatMsg { id: number; userName: string; content: string }

const cid = ref(0)
const currentChapterId = ref(0)
const currentChapterName = ref('')
const mediaType = ref<'video' | 'live'>('video')
const mediaSrc = ref('')
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

const progressPercent = computed(() => {
  if (!totalStudySecond.value) return 0
  return Math.min(100, Math.round((playSecond.value / Math.max(1, totalStudySecond.value)) * 100))
})

onLoad((q: any) => {
  cid.value = Number(q.cid) || 0
  currentChapterId.value = Number(q.chId) || 0
  if (cid.value && currentChapterId.value) loadData()
})

onUnmounted(() => { pauseTimer(); flushOfflineQueue() })

async function loadData() {
  // Load chapter detail
  try {
    const d = await getChapterDetail(currentChapterId.value, cid.value)
    mediaType.value = d.mediaType
    mediaSrc.value = d.mediaSrc
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

function onTimeUpdate(e: any) { playSecond.value = Math.floor(e.detail.currentTime || 0) }
function onVideoEnd() { pauseTimer(); uploadRecord() }
function startTimer() { if (timer) return; timer = setInterval(() => { totalStudySecond.value++; const now = Date.now(); if (now - lastUploadTime > 15000) { lastUploadTime = now; uploadRecord() } }, 1000) }
function pauseTimer() { if (timer) { clearInterval(timer); timer = null }; uploadRecord() }

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
  playSecond.value = 0; totalStudySecond.value = 0; playProgress.value = 0
  lastUploadTime = 0
  timer = null
  loadData()
}

function goBack() { pauseTimer(); uni.navigateBack().catch(() => uni.reLaunch({ url: `/pages/course/detail?cid=${cid.value}` })) }

function sendChat() {
  if (!chatInput.value.trim()) return
  chatMsgs.value.push({ id: Date.now(), userName: '我', content: chatInput.value })
  chatInput.value = ''
}
function downloadFile(f: AttachItem) { uni.showToast({ title: `下载 ${f.fileName}`, icon: 'none' }) }
</script>

<style scoped lang="scss">
.study-page { min-height: 100vh; background: $bg-card; display: flex; flex-direction: column; }
.player-box { position: relative; height: 220px; background: #000; }
.player { width: 100%; height: 100%; }
.player-back { position: absolute; top: 12px; left: 12px; width: 30px; height: 30px; border-radius: 50%; background: rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; }
.player-menu { position: absolute; top: 12px; right: 12px; width: 30px; height: 30px; border-radius: 50%; background: rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; }
.ch-bar { display: flex; align-items: center; padding: 12px 14px; border-bottom: 1px solid $border; }
.ch-title { font-size: 14px; font-weight: 600; color: $text-1; flex: 1; }
.ch-progress { font-size: 11px; color: $text-3; }
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
.attach-item { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid $border; gap: 8px; }
.a-name { flex: 1; font-size: 13px; color: $text-1; }
.a-size { font-size: 11px; color: $text-3; }
.mask { position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 99; }
.drawer { position: fixed; left: 0; top: 0; bottom: 0; width: 72%; background: $bg-card; transform: translateX(-100%); transition: transform .25s; z-index: 100; padding-top: 44px; }
.drawer.open { transform: translateX(0); }
.drawer-title { font-size: 15px; font-weight: 700; padding: 14px 16px; color: $text-1; }
.drawer-scroll { height: calc(100vh - 50px); }
.d-item { padding: 14px 16px; font-size: 14px; color: $text-2; border-bottom: 1px solid $border; }
.d-item.active { color: $primary; background: $primary-bg; }
</style>
