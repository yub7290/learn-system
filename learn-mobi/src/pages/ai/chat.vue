<template>
  <view class="ai-page">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-bar-inner">
        <view class="nav-back" @click="goBack">
          <u-icon name="arrow-left" color="#222" size="20"></u-icon>
        </view>
        <view class="nav-center">
          <text class="nav-title">AI 助教</text>
          <text class="nav-sub" v-if="currentCourseId">课程问答</text>
        </view>
        <view class="nav-actions">
          <view class="nav-btn" @click="goHistory">
            <u-icon name="clock" color="#666" size="20"></u-icon>
          </view>
          <view v-if="currentCourseId" class="nav-btn" @click="goHomework">
            <u-icon name="checkmark-circle" color="#0195ff" size="20"></u-icon>
          </view>
          <view class="nav-btn" @click="newConversation">
            <u-icon name="plus" color="#666" size="20"></u-icon>
          </view>
        </view>
      </view>
    </view>

    <!-- 模式切换 Tab -->
    <view class="mode-tabs">
      <view class="tab-item" :class="{ active: currentMode === 'chat' }" @click="switchMode('chat')">
        <u-icon :name="currentMode === 'chat' ? 'chat-fill' : 'chat'" :color="currentMode === 'chat' ? '#0195ff' : '#999'" size="16"></u-icon>
        <text class="tab-text">对话模式</text>
      </view>
      <view class="tab-item" :class="{ active: currentMode === 'correct' }" @click="switchMode('correct')">
        <u-icon :name="currentMode === 'correct' ? 'photo-fill' : 'photo'" :color="currentMode === 'correct' ? '#0195ff' : '#999'" size="16"></u-icon>
        <text class="tab-text">作业批改</text>
      </view>
    </view>

    <!-- 消息列表 -->
    <scroll-view scroll-y class="msg-scroll" :scroll-into-view="scrollToId" scroll-with-animation>
      <view class="msg-list">
        <view v-for="(msg, idx) in messageList" :key="msg.id" class="msg-item" :class="msg.role === 'user' ? 'msg-right' : 'msg-left'" :id="'msg-' + idx">
          <view v-if="msg.role === 'ai'" class="avatar ai-avatar">
            <view class="avatar-inner">
              <text class="iconfont icon-robot" style="font-size:20px;color:#fff"></text>
            </view>
          </view>
          <view v-if="msg.type === 'text'" class="msg-bubble" :class="msg.role === 'user' ? 'bubble-user' : 'bubble-ai'">
            <text class="msg-text">{{ msg.content }}</text>
          </view>
          <view v-if="msg.type === 'image'" class="msg-bubble" :class="msg.role === 'user' ? 'bubble-user' : 'bubble-ai'" style="padding:6px">
            <image :src="msg.content" class="msg-image" mode="widthFix" @click="previewImage(msg.content)" />
          </view>
          <!-- 作业批改结果 -->
          <view v-if="msg.type === 'homework-result' && msg.hwResult" class="msg-bubble bubble-ai hw-result-card">
            <view class="hw-header">
              <view class="hw-icon-wrap"><text style="font-size:18px;color:#07c160">✓</text></view>
              <view class="hw-header-text">
                <text class="hw-title">作业批改完成</text>
                <text class="hw-summary">{{ msg.hwResult.correctCount }}/{{ msg.hwResult.totalQuestions }} 题正确 · 得分 {{ msg.hwResult.score }}</text>
              </view>
            </view>
            <view class="hw-questions">
              <view class="hw-q-card" v-for="(q, qi) in msg.hwResult.questions" :key="qi" :class="{ 'hw-q-wrong': q.isCorrect === 0 }">
                <view class="hw-q-header">
                  <text class="hw-q-no">第{{ q.questionNo }}题</text>
                  <view v-if="q.isCorrect === 1" class="hw-badge hw-badge-ok"><text class="hw-badge-text">✓ 正确</text></view>
                  <view v-else-if="q.isCorrect === 0" class="hw-badge hw-badge-err"><text class="hw-badge-text">✗ 错误</text></view>
                  <view v-else class="hw-badge hw-badge-unknown"><text class="hw-badge-text">待判断</text></view>
                </view>
                <view class="hw-q-body">
                  <view class="hw-q-row"><text class="hw-label">题目：</text><text class="hw-value">{{ q.questionContent }}</text></view>
                  <view class="hw-q-row"><text class="hw-label">你的答案：</text><text class="hw-value hw-student-ans">{{ q.studentAnswer }}</text></view>
                  <view class="hw-q-row"><text class="hw-label">正确答案：</text><text class="hw-value hw-correct-ans">{{ q.displayAnswer }}</text></view>
                  <view class="hw-q-row" v-if="q.displayAnalysis"><text class="hw-label">解析：</text><text class="hw-value hw-analysis">{{ q.displayAnalysis }}</text></view>
                </view>
              </view>
            </view>
          </view>
          <view v-if="msg.role === 'user'" class="avatar user-avatar">
            <view class="avatar-inner">
              <u-icon name="account" color="#fff" size="18"></u-icon>
            </view>
          </view>
        </view>
        <!-- 加载中 -->
        <view v-if="isLoading" class="msg-item msg-left" id="msg-loading">
          <view class="avatar ai-avatar">
            <view class="avatar-inner">
              <text class="iconfont icon-robot" style="font-size:20px;color:#fff"></text>
            </view>
          </view>
          <view class="msg-bubble bubble-ai typing-bubble">
            <view class="typing-dots">
              <view class="dot dot1"></view>
              <view class="dot dot2"></view>
              <view class="dot dot3"></view>
            </view>
          </view>
        </view>
        <!-- 快捷问题 -->
        <view v-if="!isLoading && messageList.length <= 1 && currentMode === 'chat'" class="quick-section">
          <view class="quick-header">
            <view class="quick-icon-wrap">
              <text class="iconfont icon-zixunfuwu" style="font-size:16px;color:#ff7847"></text>
            </view>
            <text class="quick-title">试试这样问</text>
          </view>
          <view class="quick-grid">
            <view class="quick-item" v-for="(q, i) in quickQuestions" :key="i" @click="sendQuickQuestion(q)">
              <text class="quick-q">{{ q }}</text>
              <u-icon name="arrow-right" color="#bbb" size="14"></u-icon>
            </view>
          </view>
        </view>
        <view class="msg-bottom-space"></view>
      </view>
    </scroll-view>

    <!-- 底部输入 -->
    <view class="input-footer">
      <!-- 对话模式 -->
      <template v-if="currentMode === 'chat'">
        <view class="input-row">
          <view class="input-wrap">
            <input class="text-input" v-model="inputText" placeholder="输入你的问题..." placeholder-style="color:#bbb" confirm-type="send" @confirm="sendTextMessage" />
          </view>
          <view class="send-btn" :class="{ active: inputText.trim() && !isLoading }" @click="sendTextMessage">
            <u-icon name="arrow-up" color="#fff" size="20"></u-icon>
          </view>
        </view>
      </template>
      <!-- 作业批改模式 -->
      <template v-else>
        <view class="correct-area">
          <view v-if="selectedImages.length" class="image-grid">
            <view class="grid-item" v-for="(img, idx) in selectedImages" :key="idx">
              <image :src="img" class="grid-img" mode="aspectFill" @click="previewImage(img)" />
              <view class="grid-delete" @click="removeImage(idx)">
                <u-icon name="close-circle-fill" color="#f56c6c" size="18"></u-icon>
              </view>
            </view>
            <view v-if="selectedImages.length < 9" class="grid-item grid-add" @click="chooseImage('album')">
              <u-icon name="plus" color="#ccc" size="28"></u-icon>
            </view>
          </view>
          <view class="correct-row">
            <view class="correct-actions">
              <view class="action-item" @click="chooseImage('camera')">
                <view class="action-icon camera-icon">
                  <u-icon name="camera" color="#0195ff" size="22"></u-icon>
                </view>
                <text class="action-text">拍照</text>
              </view>
              <view class="action-item" @click="chooseImage('album')">
                <view class="action-icon album-icon">
                  <u-icon name="photo" color="#07c160" size="22"></u-icon>
                </view>
                <text class="action-text">相册</text>
              </view>
              <text class="image-count" v-if="selectedImages.length">{{ selectedImages.length }}/9</text>
            </view>
            <view class="submit-btn" :class="{ active: selectedImages.length > 0 && !isLoading }" @click="sendCorrectMessage">
              <u-icon name="checkmark" color="#fff" size="16"></u-icon>
              <text class="submit-text">提交批改</text>
            </view>
          </view>
        </view>
      </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { chatStream, getChatHistory, submitHomework } from '../../api/ai'
import { uploadFile } from '../../api/request'
import type { AiChatReqDTO } from '../../types/ai'

interface HomeworkResult {
  totalQuestions: number
  correctCount: number
  score: number
  questions: {
    questionNo: number
    questionContent: string
    studentAnswer: string
    correctAnswer: string
    isCorrect: number | null
    analysis: string
    displayAnswer: string
    displayAnalysis: string
    reviewStatus: number
  }[]
}

interface MessageItem {
  id: number
  role: 'user' | 'ai'
  type: 'text' | 'image' | 'homework-result'
  content: string
  time: string
  hwResult?: HomeworkResult
}

interface ConversationLocal {
  id: number
  title: string
  lastMessage: string
  messageCount: number
  updateTime: string
  courseId?: number
}

const currentMode = ref<'chat' | 'correct'>('chat')
const inputText = ref('')
const selectedImages = ref<string[]>([])
const isLoading = ref(false)
const scrollToId = ref('')
const currentCourseId = ref<number>(0)
const currentChatId = ref<number>(0)
let msgIdCounter = 2

onLoad((options: any) => {
  if (options?.courseId) currentCourseId.value = Number(options.courseId)
  if (options?.chatId) {
    currentChatId.value = Number(options.chatId)
    loadHistory(Number(options.chatId))
  }
})

const messageList = ref<MessageItem[]>([
  { id: 1, role: 'ai', type: 'text', content: '你好，我是AI助教 🎓\n有什么学习上的问题都可以问我哦~', time: getNow() },
])

const quickQuestions = ref<string[]>([
  '帮我总结一下本节课的知识点',
  '这道题怎么解：3x+5=20',
  '推荐一些学习资料',
  '如何提高学习效率？',
])

function getNow(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function scrollBottom() {
  nextTick(() => {
    scrollToId.value = isLoading.value ? 'msg-loading' : `msg-${messageList.value.length - 1}`
  })
}

function addMsg(role: 'user' | 'ai', type: 'text' | 'image', content: string) {
  messageList.value.push({ id: msgIdCounter++, role, type, content, time: getNow() })
}

function previewImage(src: string) {
  uni.previewImage({ urls: [src], current: src }).catch(() => {})
}

async function loadHistory(chatId: number) {
  try {
    const list = await getChatHistory(currentCourseId.value, chatId, 50)
    if (list?.length) {
      messageList.value = list.map((item) => ({
        id: msgIdCounter++,
        role: item.role === 'assistant' ? 'ai' : 'user',
        type: 'text' as const,
        content: item.content,
        time: item.createTime,
      }))
      scrollBottom()
    }
  } catch { /* 保持默认欢迎语 */ }
}

function saveToLocal() {
  const msgs = messageList.value.filter((m) => m.id > 1)
  if (!msgs.length) return
  const firstUserMsg = msgs.find((m) => m.role === 'user')
  const title = firstUserMsg ? firstUserMsg.content.slice(0, 20) : '新对话'
  const lastMsg = msgs[msgs.length - 1]
  const conv: ConversationLocal = {
    id: currentChatId.value || Date.now(),
    title,
    lastMessage: lastMsg.content.slice(0, 50),
    messageCount: msgs.length,
    updateTime: new Date().toISOString(),
    courseId: currentCourseId.value || undefined,
  }
  try {
    const raw = uni.getStorageSync('ai_conversations')
    let list: ConversationLocal[] = raw ? JSON.parse(raw) : []
    const idx = list.findIndex((c) => c.id === conv.id)
    if (idx >= 0) list[idx] = conv
    else { list.unshift(conv); currentChatId.value = conv.id }
    uni.setStorageSync('ai_conversations', JSON.stringify(list))
  } catch { /* 忽略 */ }
}

function switchMode(mode: 'chat' | 'correct') {
  if (currentMode.value === mode || isLoading.value) return
  currentMode.value = mode
  inputText.value = ''
  selectedImages.value = []
}

function sendQuickQuestion(text: string) {
  inputText.value = text
  sendTextMessage()
}

async function sendTextMessage() {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return
  addMsg('user', 'text', text)
  inputText.value = ''
  isLoading.value = true
  scrollBottom()

  // 创建空的AI消息用于流式填充
  const streamMsgId = msgIdCounter++
  messageList.value.push({ id: streamMsgId, role: 'ai', type: 'text', content: '', time: getNow() })
  scrollBottom()

  let fullResponse = ''

  chatStream(
    { message: text, courseId: currentCourseId.value, chatId: currentChatId.value || undefined } as AiChatReqDTO,
    (token) => {
      fullResponse += token
      const msg = messageList.value.find((m) => m.id === streamMsgId)
      if (msg) msg.content = fullResponse
      scrollBottom()
    },
    () => {
      const msg = messageList.value.find((m) => m.id === streamMsgId)
      if (msg && !fullResponse) msg.content = '暂无回复'
      isLoading.value = false
      scrollBottom()
      saveToLocal()
    },
    (err) => {
      const msg = messageList.value.find((m) => m.id === streamMsgId)
      if (msg) msg.content = err || '回复失败，请稍后重试。'
      isLoading.value = false
      scrollBottom()
    },
    (id) => {
      if (!currentChatId.value) currentChatId.value = id
    },
  )
}

function chooseImage(source: 'camera' | 'album') {
  const remain = 9 - selectedImages.value.length
  if (remain <= 0) { uni.showToast({ title: '最多选择9张图片', icon: 'none' }); return }
  // #ifdef H5
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = remain > 1
  if (source === 'camera') input.capture = 'environment'
  input.onchange = () => {
    if (!input.files) return
    const files = Array.from(input.files).slice(0, remain)
    const urls = files.map(f => URL.createObjectURL(f))
    selectedImages.value.push(...urls)
    if (selectedImages.value.length > 9) selectedImages.value = selectedImages.value.slice(0, 9)
  }
  input.click()
  // #endif
  // #ifndef H5
  uni.chooseImage({
    count: remain,
    sourceType: source === 'camera' ? ['camera'] : ['album'],
    sizeType: ['compressed'],
    success: (res) => {
      selectedImages.value.push(...(res.tempFilePaths as string[]))
      if (selectedImages.value.length > 9) selectedImages.value = selectedImages.value.slice(0, 9)
    },
    fail: () => { uni.showToast({ title: '选择图片失败', icon: 'none' }) },
  })
  // #endif
}

function removeImage(index: number) { selectedImages.value.splice(index, 1) }

async function uploadImages(filePaths: string[]): Promise<string[]> {
  const urls: string[] = []
  for (const p of filePaths) { try { urls.push(await uploadFile({ filePath: p })) } catch { /* skip */ } }
  return urls
}

async function sendCorrectMessage() {
  if (!selectedImages.value.length || isLoading.value) return
  const images = [...selectedImages.value]
  images.forEach((img) => addMsg('user', 'image', img))
  selectedImages.value = []
  isLoading.value = true
  scrollBottom()
  try {
    const imageUrls = await uploadImages(images)
    if (!imageUrls.length) { addMsg('ai', 'text', '图片上传失败，请重试。'); isLoading.value = false; scrollBottom(); return }
    const streamMsgId = msgIdCounter++
    messageList.value.push({ id: streamMsgId, role: 'ai', type: 'text', content: '📝 正在识别题目并批改中...', time: getNow() })
    scrollBottom()

    const result = await submitHomework({ courseId: currentCourseId.value, imageUrls })
    const msg = messageList.value.find((m) => m.id === streamMsgId)
    if (msg) {
      if (result && result.questions && result.questions.length > 0) {
        msg.type = 'homework-result'
        msg.content = ''
        msg.hwResult = {
          totalQuestions: result.totalQuestions || result.questions.length,
          correctCount: result.correctCount || 0,
          score: result.score || 0,
          questions: result.questions.map((q) => ({
            questionNo: q.questionNo, questionContent: q.questionContent || '未知题目',
            studentAnswer: q.studentAnswer || '未作答', correctAnswer: q.correctAnswer || '',
            isCorrect: q.isCorrect, analysis: q.analysis || '',
            displayAnswer: q.displayAnswer || q.correctAnswer || '',
            displayAnalysis: q.displayAnalysis || q.analysis || '',
            reviewStatus: q.reviewStatus || 0,
          })),
        }
      } else {
        msg.type = 'text'
        msg.content = '✅ 批改完成！请在批改记录中查看详情。'
      }
    }
  } catch {
    addMsg('ai', 'text', '作业提交失败，请稍后重试。')
  } finally {
    isLoading.value = false
    scrollBottom()
  }
}

function newConversation() {
  if (messageList.value.length > 1) saveToLocal()
  currentChatId.value = 0
  msgIdCounter = 2
  messageList.value = [{ id: 1, role: 'ai', type: 'text', content: '你好，我是AI助教 🎓\n有什么学习上的问题都可以问我哦~', time: getNow() }]
  inputText.value = ''
  selectedImages.value = []
}

function goHistory() {
  if (messageList.value.length > 1) saveToLocal()
  uni.navigateTo({ url: '/pages/ai/history' }).catch(() => {})
}

function goHomework() {
  if (messageList.value.length > 1) saveToLocal()
  if (!currentCourseId.value) return
  uni.navigateTo({ url: `/pages/ai/homework-list?courseId=${currentCourseId.value}` }).catch(() => {})
}

function goBack() {
  if (messageList.value.length > 1) saveToLocal()
  uni.navigateBack().catch(() => { uni.switchTab({ url: '/pages/index/index' }) })
}
</script>

<style scoped lang="scss">
.ai-page { width: 100%; height: 100vh; display: flex; flex-direction: column; overflow: hidden; background: $bg-page; box-sizing: border-box; }

/* 导航栏 */
.nav-bar { flex-shrink: 0; background: $bg-card; box-shadow: 0 2px 8px rgba(0,0,0,0.04); padding-top: env(safe-area-inset-top); }
.nav-bar-inner { height: 48px; display: flex; align-items: center; padding: 0 8px; }
.nav-back { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
.nav-back:active { background: #f0f0f0; }
.nav-center { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 1px; }
.nav-title { font-size: 16px; font-weight: 600; color: $text-1; line-height: 1.2; }
.nav-sub { font-size: 10px; color: $text-3; line-height: 1.2; }
.nav-actions { display: flex; gap: 2px; }
.nav-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
.nav-btn:active { background: #f0f0f0; }

/* 模式切换 */
.mode-tabs { flex-shrink: 0; display: flex; background: $bg-card; padding: 0 40px 12px; justify-content: space-between; border-bottom: 1rpx solid $border; }
.tab-item { display: flex; align-items: center; gap: 6px; font-size: 14px; color: $text-2; padding: 8px 12px; border-radius: 20px; transition: all 0.2s; }
.tab-item.active { color: $primary; background: $primary-bg; }
.tab-text { font-size: 13px; }

/* 消息 */
.msg-scroll { flex: 1; width: 100%; min-height: 0; overflow-y: auto; padding: 16px 14px; box-sizing: border-box; }
.msg-list { display: flex; flex-direction: column; gap: 16px; width: 100%; }
.msg-bottom-space { height: 12px; }
.msg-item { display: flex; align-items: flex-start; gap: 10px; width: 100%; }
.msg-left { justify-content: flex-start; }
.msg-right { justify-content: flex-end; }
.avatar { flex-shrink: 0; width: 40px; height: 40px; }
.avatar-inner { width: 100%; height: 100%; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
.ai-avatar .avatar-inner { background: $gradient-primary; box-shadow: 0 3px 10px rgba(1,149,255,0.3); }
.user-avatar .avatar-inner { background: #67c23a; box-shadow: 0 3px 10px rgba(103,194,58,0.3); }
.msg-bubble { max-width: calc(100% - 64px); padding: 12px 16px; border-radius: 16px; line-height: 1.6; box-sizing: border-box; word-break: break-word; }
.bubble-ai { background: $bg-card; color: $text-1; border-top-left-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.bubble-user { background: $gradient-primary; color: #fff; border-top-right-radius: 4px; box-shadow: 0 3px 12px rgba(1,149,255,0.25); }
.msg-text { font-size: 15px; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
.msg-image { max-width: 400rpx; max-height: 500rpx; border-radius: 8px; }

/* 打字动画 */
.typing-bubble { padding: 14px 20px; }
.typing-dots { display: flex; gap: 6px; align-items: center; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: #c0c4cc; animation: typingBounce 1.4s infinite ease-in-out; }
.dot2 { animation-delay: 0.2s; }
.dot3 { animation-delay: 0.4s; }
@keyframes typingBounce { 0%,80%,100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }

/* 快捷问题 */
.quick-section { margin-top: 20px; }
.quick-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.quick-icon-wrap { width: 28px; height: 28px; border-radius: 8px; background: #fff3ec; display: flex; align-items: center; justify-content: center; }
.quick-title { font-size: 14px; color: $text-2; font-weight: 500; }
.quick-grid { display: flex; flex-direction: column; gap: 8px; }
.quick-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: $bg-card; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.03); }
.quick-item:active { background: #f8f9fa; }
.quick-q { font-size: 13px; color: $text-2; flex: 1; margin-right: 8px; }

/* 底部输入 */
.input-footer { flex-shrink: 0; width: 100%; background: $bg-card; border-top: 1rpx solid $border; padding: 12px 14px; padding-bottom: calc(12px + env(safe-area-inset-bottom)); box-sizing: border-box; }
.input-row { display: flex; align-items: center; gap: 10px; width: 100%; }
.input-wrap { flex: 1; height: 42px; background: $bg-page; border-radius: 21px; display: flex; align-items: center; padding: 0 4px 0 18px; }
.text-input { flex: 1; height: 42px; font-size: 15px; color: $text-1; }
.send-btn { width: 42px; height: 42px; border-radius: 50%; background: #ccc; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s; }
.send-btn.active { background: $gradient-primary; box-shadow: 0 3px 10px rgba(1,149,255,0.3); }

/* 作业批改 */
.correct-area { display: flex; flex-direction: column; gap: 12px; width: 100%; }
.image-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.grid-item { position: relative; width: 72px; height: 72px; border-radius: 10px; overflow: hidden; }
.grid-img { width: 100%; height: 100%; }
.grid-delete { position: absolute; top: -2px; right: -2px; }
.grid-add { border: 2px dashed #ddd; display: flex; align-items: center; justify-content: center; background: #fafafa; }
.grid-add:active { background: #f0f0f0; }
.image-count { font-size: 12px; color: $text-3; align-self: center; }
.correct-row { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.correct-actions { display: flex; gap: 20px; align-items: center; }
.action-item { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.action-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
.camera-icon { background: #e6f4ff; }
.album-icon { background: #f0f9eb; }
.action-text { font-size: 11px; color: $text-3; }
.submit-btn { display: flex; align-items: center; gap: 6px; padding: 10px 22px; background: #ccc; border-radius: 22px; transition: all 0.2s; }
.submit-btn.active { background: $gradient-primary; box-shadow: 0 3px 10px rgba(1,149,255,0.3); }
.submit-text { font-size: 14px; color: #fff; font-weight: 500; }

/* 作业批改结果卡片 */
.hw-result-card { padding: 16px !important; max-width: calc(100% - 64px) !important; }
.hw-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid #f0f0f0; }
.hw-icon-wrap { flex-shrink: 0; width: 32px; height: 32px; border-radius: 50%; background: #e8f8ee; display: flex; align-items: center; justify-content: center; }
.hw-header-text { display: flex; flex-direction: column; gap: 2px; }
.hw-title { font-size: 15px; font-weight: 600; color: #07c160; }
.hw-summary { font-size: 13px; color: #999; }
.hw-questions { display: flex; flex-direction: column; gap: 10px; }
.hw-q-card { background: #f8faf8; border-radius: 10px; padding: 12px; border-left: 3px solid #07c160; }
.hw-q-wrong { border-left-color: #f56c6c; background: #fef8f8; }
.hw-q-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.hw-q-no { font-size: 14px; font-weight: 600; color: #333; }
.hw-badge { display: flex; align-items: center; gap: 3px; padding: 2px 8px; border-radius: 10px; }
.hw-badge-ok { background: #07c160; }
.hw-badge-err { background: #f56c6c; }
.hw-badge-unknown { background: #999; }
.hw-badge-text { color: #fff; font-size: 11px; }
.hw-q-body { display: flex; flex-direction: column; gap: 6px; }
.hw-q-row { display: flex; gap: 4px; line-height: 1.5; }
.hw-label { font-size: 13px; color: #999; flex-shrink: 0; }
.hw-value { font-size: 13px; color: #333; }
.hw-student-ans { color: #f56c6c; }
.hw-correct-ans { color: #07c160; font-weight: 500; }
.hw-analysis { color: #666; }
</style>
