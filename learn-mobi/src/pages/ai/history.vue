<template>
  <view class="history-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-bar-inner">
        <view class="nav-back" @click="goBack">
          <u-icon name="arrow-left" color="#222" size="20"></u-icon>
        </view>
        <text class="nav-title">对话历史</text>
        <view class="nav-right" @click="createNew">
          <u-icon name="plus" color="#0195ff" size="20"></u-icon>
        </view>
      </view>
    </view>

    <!-- 对话列表 -->
    <scroll-view scroll-y class="list-scroll">
      <view v-if="conversationList.length" class="list-wrap">
        <view
          v-for="(item, idx) in conversationList"
          :key="item.id"
          class="conv-card"
          @click="enterConversation(item)"
          @touchstart="touchStart($event, idx)"
          @touchmove="touchMove($event, idx)"
          @touchend="touchEnd(idx)"
        >
          <view class="conv-content" :style="{ transform: `translateX(${item._offset || 0}px)` }">
            <view class="conv-icon-wrap">
              <view class="conv-icon">
                <u-icon name="chat" color="#0195ff" size="22"></u-icon>
              </view>
            </view>
            <view class="conv-info">
              <text class="conv-title">{{ item.title }}</text>
              <text class="conv-preview">{{ item.lastMessage || '暂无消息' }}</text>
            </view>
            <view class="conv-meta">
              <text class="conv-time">{{ formatTime(item.updateTime) }}</text>
              <text class="conv-count">{{ item.messageCount || 0 }}条</text>
            </view>
          </view>
          <view class="conv-delete" :class="{ show: item._offset < -60 }" @click.stop="deleteConversation(idx)">
            <u-icon name="trash" color="#fff" size="18"></u-icon>
            <text class="del-text">删除</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-wrap">
        <view class="empty-icon">
          <u-icon name="chat" color="#d0d5dd" size="56"></u-icon>
        </view>
        <text class="empty-title">暂无对话记录</text>
        <text class="empty-desc">开始和AI助教对话吧</text>
        <view class="empty-btn" @click="createNew">
          <u-icon name="plus" color="#fff" size="16"></u-icon>
          <text class="btn-text">新建对话</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'

interface ConversationItem {
  id: number
  title: string
  lastMessage: string
  messageCount: number
  updateTime: string
  courseId?: number
  _offset?: number
  _startX?: number
}

const conversationList = ref<ConversationItem[]>([])
let touchStartX = 0

onShow(() => {
  loadConversations()
})

function loadConversations() {
  try {
    const raw = uni.getStorageSync('ai_conversations')
    if (raw) {
      conversationList.value = JSON.parse(raw).map((c: any) => ({ ...c, _offset: 0 }))
    }
  } catch {
    conversationList.value = []
  }
}

function saveConversations() {
  const data = conversationList.value.map(({ _offset, _startX, ...rest }) => rest)
  uni.setStorageSync('ai_conversations', JSON.stringify(data))
}

function formatTime(time: string): string {
  if (!time) return ''
  const d = new Date(time)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function touchStart(e: TouchEvent, idx: number) {
  touchStartX = e.touches[0].clientX
  conversationList.value.forEach((c, i) => { if (i !== idx) c._offset = 0 })
}

function touchMove(e: TouchEvent, idx: number) {
  const diff = e.touches[0].clientX - touchStartX
  const item = conversationList.value[idx]
  if (diff < 0) {
    item._offset = Math.max(diff, -100)
  } else {
    item._offset = 0
  }
}

function touchEnd(idx: number) {
  const item = conversationList.value[idx]
  item._offset = item._offset < -60 ? -80 : 0
}

function deleteConversation(idx: number) {
  uni.showModal({
    title: '确认删除',
    content: '删除后无法恢复，确定要删除吗？',
    confirmColor: '#f56c6c',
    success: (res) => {
      if (res.confirm) {
        conversationList.value.splice(idx, 1)
        saveConversations()
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}

function enterConversation(item: ConversationItem) {
  const query = `?chatId=${item.id}`
  const courseQuery = item.courseId ? `&courseId=${item.courseId}` : ''
  uni.navigateTo({ url: `/pages/ai/chat${query}${courseQuery}` })
}

function createNew() {
  uni.navigateTo({ url: '/pages/ai/chat' })
}

function goBack() {
  uni.navigateBack().catch(() => {
    uni.switchTab({ url: '/pages/index/index' })
  })
}
</script>

<style scoped lang="scss">
.history-page {
  min-height: 100vh;
  background: $bg-page;
  display: flex;
  flex-direction: column;
}

/* ===== 导航栏 ===== */
.nav-bar {
  flex-shrink: 0;
  background: $bg-card;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding-top: env(safe-area-inset-top);
}
.nav-bar-inner {
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 16px;
}
.nav-back {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-left: -8px;
}
.nav-back:active { background: #f0f0f0; }
.nav-title {
  flex: 1;
  text-align: center;
  font-size: 17px;
  font-weight: 600;
  color: $text-1;
}
.nav-right {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: -8px;
}
.nav-right:active { background: #f0f0f0; border-radius: 50%; }

/* ===== 列表滚动 ===== */
.list-scroll {
  flex: 1;
  padding: 12px 14px;
}
.list-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ===== 对话卡片 ===== */
.conv-card {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
}
.conv-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 12px;
  background: $bg-card;
  border-radius: 12px;
  padding: 14px;
  box-shadow: $shadow-card;
  transition: transform 0.2s ease;
}
.conv-icon-wrap { flex-shrink: 0; }
.conv-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: $primary-bg;
  display: flex;
  align-items: center;
  justify-content: center;
}
.conv-info { flex: 1; min-width: 0; }
.conv-title {
  display: block;
  font-size: 15px;
  font-weight: 500;
  color: $text-1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.conv-preview {
  display: block;
  font-size: 12px;
  color: $text-3;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.conv-meta {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
.conv-time { font-size: 11px; color: $text-3; }
.conv-count {
  font-size: 10px;
  color: $primary;
  background: $primary-bg;
  padding: 2px 6px;
  border-radius: 8px;
}

/* 滑动删除 */
.conv-delete {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 80px;
  background: $danger;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: 0 12px 12px 0;
  z-index: 1;
}
.del-text { font-size: 12px; color: #fff; }

/* ===== 空状态 ===== */
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 180rpx;
}
.empty-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #eef2f7;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}
.empty-title { font-size: 16px; font-weight: 500; color: $text-2; margin-bottom: 6px; }
.empty-desc { font-size: 13px; color: $text-3; margin-bottom: 30px; }
.empty-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 28px;
  background: $gradient-primary;
  border-radius: 24px;
  box-shadow: 0 4px 16px rgba(1, 149, 255, 0.3);
}
.btn-text { font-size: 14px; color: #fff; font-weight: 500; }
</style>
