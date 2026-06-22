<template>
  <view class="ai-page">
    <view class="topbar">
      <u-icon name="arrow-left" color="#222" size="20" @click="goBack"></u-icon>
      <text class="title">AI 助教</text>
    </view>

    <scroll-view scroll-y class="msg-list" :scroll-top="scrollTop">
      <view class="msg" :class="m.role" v-for="m in msgList" :key="m.id">
        <view class="bubble">{{ m.content }}</view>
      </view>
      <view v-if="sending" class="msg assistant"><view class="bubble">思考中...</view></view>
    </scroll-view>

    <view class="input-bar">
      <u-input v-model="input" placeholder="向 AI 提问..." @confirm="send" border="none"></u-input>
      <u-button type="primary" :loading="sending" size="small" @click="send">发送</u-button>
    </view>

    <TabBar :current="2"></TabBar>
  </view>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import TabBar from '../../components/TabBar.vue'
import { chatSync, getChatHistory } from '../../api/ai'
import type { AiChatRespVO } from '../../types/ai'

const courseId = ref(0)
const chatId = ref<number | undefined>(undefined)
const msgList = ref<AiChatRespVO[]>([])
const input = ref('')
const sending = ref(false)
const scrollTop = ref(0)

onLoad((q: any) => { courseId.value = Number(q.courseId) || 0 })
onShow(() => { if (courseId.value) loadHistory() })

async function loadHistory() {
  try {
    const list = await getChatHistory(courseId.value, chatId.value)
    msgList.value = list || []
    if (list.length) chatId.value = list[0].conversationId
    scrollBottom()
  } catch (e) { /* stub → empty */ }
}

async function send() {
  const text = input.value.trim()
  if (!text || sending.value) return
  sending.value = true
  msgList.value.push({ id: Date.now(), conversationId: chatId.value || 0, role: 'user', content: text, createTime: '' })
  input.value = ''
  scrollBottom()
  try {
    const reply = await chatSync({ courseId: courseId.value, chatId: chatId.value, message: text })
    msgList.value.push(reply)
    if (reply.conversationId) chatId.value = reply.conversationId
    scrollBottom()
  } catch (e) { /* toast already handled by request layer */ }
  finally { sending.value = false }
}

async function scrollBottom() { await nextTick(); scrollTop.value = scrollTop.value === 99998 ? 99999 : 99998 }
function goBack() { uni.navigateBack().catch(() => uni.reLaunch({ url: '/pages/index/index' })) }
</script>

<style scoped lang="scss">
.ai-page { display: flex; flex-direction: column; height: 100vh; background: $bg-page; }
.topbar { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: $bg-card; }
.title { font-size: 16px; font-weight: 600; color: $text-1; }
.msg-list { flex: 1; padding: 14px; }
.msg { margin-bottom: 12px; display: flex; }
.msg.user { justify-content: flex-end; }
.msg.assistant { justify-content: flex-start; }
.bubble { max-width: 75%; padding: 10px 14px; border-radius: 12px; font-size: 14px; line-height: 1.6; }
.msg.user .bubble { background: linear-gradient(135deg,$primary,$primary-light); color: #fff; }
.msg.assistant .bubble { background: $bg-card; color: $text-1; box-shadow: 0 2px 8px rgba(0,0,0,.04); }
.input-bar { display: flex; gap: 8px; align-items: center; padding: 10px 14px; background: $bg-card; }
</style>
