<template>
  <view class="ai-page">
    <!-- 模式切换 Tab -->
    <view class="mode-tabs">
      <view class="tab-item" :class="{ active: currentMode === 'chat' }" @click="switchMode('chat')">
        对话模式
      </view>
      <view class="tab-item" :class="{ active: currentMode === 'correct' }" @click="switchMode('correct')">
        作业批改
      </view>
    </view>

    <!-- 消息列表 -->
    <scroll-view scroll-y class="msg-scroll" :scroll-into-view="scrollToId" scroll-with-animation>
      <view class="msg-list">
        <view v-for="(msg, idx) in messageList" :key="msg.id" class="msg-item" :class="msg.role === 'user' ? 'msg-right' : 'msg-left'" :id="'msg-' + idx">
          <!-- AI 头像 -->
          <view v-if="msg.role === 'ai'" class="avatar ai-avatar">
            <text class="iconfont icon-robot" style="font-size:28rpx;color:#fff"></text>
          </view>
          <!-- 内容气泡 -->
          <view class="msg-bubble" :class="msg.role === 'user' ? 'bubble-user' : 'bubble-ai'">
            <text v-if="msg.type === 'text'" class="msg-text">{{ msg.content }}</text>
            <image v-if="msg.type === 'image'" :src="msg.content" class="msg-image" mode="widthFix" @click="previewImage(msg.content)" />
          </view>
          <!-- 用户头像 -->
          <view v-if="msg.role === 'user'" class="avatar user-avatar">
            <text class="iconfont icon-xuesheng" style="font-size:28rpx;color:#fff"></text>
          </view>
        </view>
        <!-- 加载中 -->
        <view v-if="isLoading" class="msg-item msg-left" id="msg-loading">
          <view class="avatar ai-avatar">
            <text class="iconfont icon-robot" style="font-size:28rpx;color:#fff"></text>
          </view>
          <view class="msg-bubble bubble-ai">
            <text class="msg-text">正在思考中...</text>
          </view>
        </view>
        <!-- 快捷问题 -->
        <view v-if="!isLoading && messageList.length <= 1 && currentMode === 'chat'" class="quick-questions">
          <view class="qq-title">快捷问题</view>
          <view class="qq-grid">
            <view class="qq-item" v-for="(q, i) in quickQuestions" :key="i" @click="sendQuickQuestion(q)">{{ q }}</view>
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
          <input class="text-input" v-model="inputText" placeholder="请输入你的问题" confirm-type="send" @confirm="sendTextMessage" />
          <view class="send-btn" :class="{ disabled: !inputText.trim() }" @click="sendTextMessage">发送</view>
        </view>
      </template>
      <!-- 作业批改模式 -->
      <template v-else>
        <view class="correct-area">
          <view v-if="selectedImage" class="preview-wrap">
            <image :src="selectedImage" class="preview-img" mode="aspectFill" />
            <view class="delete-btn" @click="clearImage">
              <u-icon name="close-circle" color="#fff" size="14"></u-icon>
            </view>
          </view>
          <view class="correct-row">
            <view class="correct-actions">
              <view class="action-item" @click="chooseImage('camera')">
                <u-icon name="camera" color="#666" size="20"></u-icon>
                <text class="action-text">拍照</text>
              </view>
              <view class="action-item" @click="chooseImage('album')">
                <u-icon name="photo" color="#666" size="20"></u-icon>
                <text class="action-text">相册</text>
              </view>
            </view>
            <view class="send-btn" :class="{ disabled: !selectedImage }" @click="sendCorrectMessage">提交批改</view>
          </view>
        </view>
      </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { chatSync } from '../../api/ai'
import type { AiChatReqDTO } from '../../types/ai'

interface MessageItem {
  id: number
  role: 'user' | 'ai'
  type: 'text' | 'image'
  content: string
  time: string
}

const currentMode = ref<'chat' | 'correct'>('chat')
const inputText = ref('')
const selectedImage = ref('')
const isLoading = ref(false)
const scrollToId = ref('')
let msgIdCounter = 2

const messageList = ref<MessageItem[]>([
  { id: 1, role: 'ai', type: 'text', content: '你好，我是AI助教，有什么问题都可以问我哦~', time: getNow() },
])

const quickQuestions = ref<string[]>([
  '能帮我总结一下今天的知识点吗？',
  '这道题怎么解：3x+5=20',
  '给我推荐一些学习资料',
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

function switchMode(mode: 'chat' | 'correct') {
  if (currentMode.value === mode || isLoading.value) return
  currentMode.value = mode
  inputText.value = ''
  selectedImage.value = ''
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

  try {
    const res = await chatSync({ message: text } as AiChatReqDTO)
    addMsg('ai', 'text', res.content)
    isLoading.value = false
    scrollBottom()
  } catch (e) {
    setTimeout(() => {
      addMsg('ai', 'text', `关于「${text}」的回复：这是一个模拟回答，正式对接AI接口后将返回真实内容。`)
      isLoading.value = false
      scrollBottom()
    }, 800)
  }
}

function chooseImage(source: 'camera' | 'album') {
  uni.chooseImage({
    count: 1,
    sourceType: source === 'camera' ? ['camera'] : ['album'],
    sizeType: ['compressed'],
    success: (res) => {
      const path = res.tempFilePaths[0]
      uni.getFileSystemManager().readFile({
        filePath: path,
        encoding: 'base64',
        success: (r: any) => { selectedImage.value = `data:image/jpeg;base64,${r.data}` },
        fail: () => { uni.showToast({ title: '图片处理失败', icon: 'none' }) },
      })
    },
    fail: () => { uni.showToast({ title: '选择图片失败', icon: 'none' }) },
  })
}

function clearImage() { selectedImage.value = '' }

function sendCorrectMessage() {
  if (!selectedImage.value || isLoading.value) return
  addMsg('user', 'image', selectedImage.value)
  const img = selectedImage.value
  selectedImage.value = ''
  isLoading.value = true
  scrollBottom()

  setTimeout(() => {
    const result = `【作业批改结果】\n1. 第2题计算错误：\n   错误原因：乘法分配律应用错误\n   正确思路：3×(x+2) = 3x + 6\n\n2. 第5题单位错误：\n   错误原因：最终结果未换算\n   正确思路：先统一单位，最终换算为24.5㎡\n\n整体正确率75%，继续加油！`
    addMsg('ai', 'text', result)
    isLoading.value = false
    scrollBottom()
  }, 1500)
}
</script>

<style scoped lang="scss">
.ai-page {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: $bg-page;
  box-sizing: border-box;
}

/* ===== 模式切换 ===== */
.mode-tabs {
  flex-shrink: 0;
  display: flex;
  background: $bg-card;
  padding: 0 80rpx 20rpx;
  justify-content: space-between;
  padding-top: calc(env(safe-area-inset-top) + 12rpx);
}
.tab-item {
  font-size: 28rpx;
  color: $text-2;
  padding: 16rpx 20rpx;
  position: relative;
}
.tab-item.active {
  color: $primary;
  font-weight: 500;
}
.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 4rpx;
  background: $primary;
  border-radius: 2rpx;
}

/* ===== 消息区域 ===== */
.msg-scroll {
  flex: 1;
  width: 100%;
  min-height: 0;
  overflow-y: auto;
  padding: 20rpx 24rpx;
  box-sizing: border-box;
}
.msg-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  width: 100%;
}
.msg-bottom-space { height: 20rpx; }

.msg-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  width: 100%;
}
.msg-left { justify-content: flex-start; }
.msg-right { justify-content: flex-end; }

.avatar {
  flex-shrink: 0;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ai-avatar { background: $gradient-primary; }
.user-avatar { background: #67c23a; }

.msg-bubble {
  max-width: calc(100% - 80rpx);
  padding: 16rpx 20rpx;
  border-radius: 12rpx;
  line-height: 1.6;
  box-sizing: border-box;
  word-break: break-word;
}
.bubble-ai {
  background: $bg-card;
  color: $text-1;
  border-top-left-radius: 4rpx;
}
.bubble-user {
  background: $primary;
  color: #fff;
  border-top-right-radius: 4rpx;
}

.msg-text {
  font-size: 28rpx;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}
.msg-image {
  max-width: 400rpx;
  max-height: 500rpx;
  border-radius: 8rpx;
}

/* ===== 快捷问题 ===== */
.quick-questions {
  margin-top: 20rpx;
}
.qq-title {
  font-size: 26rpx;
  color: $text-3;
  margin-bottom: 16rpx;
}
.qq-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.qq-item {
  padding: 12rpx 24rpx;
  background: $bg-card;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: $text-2;
  border: 1rpx solid $border;
}

/* ===== 底部输入 ===== */
.input-footer {
  flex-shrink: 0;
  width: 100%;
  background: $bg-card;
  border-top: 1rpx solid $border;
  padding: 20rpx 24rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  width: 100%;
}
.text-input {
  flex: 1;
  height: 72rpx;
  padding: 0 24rpx;
  background: $bg-page;
  border-radius: 36rpx;
  font-size: 28rpx;
  color: $text-1;
  box-sizing: border-box;
}

.send-btn {
  height: 72rpx;
  line-height: 72rpx;
  padding: 0 40rpx;
  background: $primary;
  color: #fff;
  font-size: 28rpx;
  border-radius: 36rpx;
  text-align: center;
  flex-shrink: 0;
}
.send-btn.disabled { background: $u-primary-disabled; }

/* ===== 作业批改 ===== */
.correct-area {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  width: 100%;
}
.preview-wrap {
  position: relative;
  width: 160rpx;
  height: 160rpx;
}
.preview-img {
  width: 100%;
  height: 100%;
  border-radius: 8rpx;
  object-fit: cover;
}
.delete-btn {
  position: absolute;
  top: -12rpx;
  right: -12rpx;
}
.correct-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.correct-actions {
  display: flex;
  gap: 40rpx;
  align-items: center;
}
.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}
.action-text { font-size: 22rpx; color: $text-3; }
</style>
