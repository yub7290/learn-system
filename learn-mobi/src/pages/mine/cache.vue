<template>
  <view class="cache-page">
    <view class="nav-bar">
      <u-icon name="arrow-left" size="22" color="#222" @click="goBack"></u-icon>
      <text class="nav-title">缓存管理</text>
      <view class="nav-right"></view>
    </view>

    <view class="size-card">
      <text class="size-label">本地缓存占用</text>
      <text class="size-value">{{ cacheSize }}</text>
      <text class="size-unit">KB</text>
    </view>

    <view class="tip-card">
      <u-icon name="info-circle" color="#0195ff" size="14"></u-icon>
      <text class="tip-text">清理缓存不会退出登录，也不会删除您的学习记录与离线数据。</text>
    </view>

    <view class="section-card">
      <view class="menu-item" @click="handleClearCache">
        <view class="menu-left">
          <view class="menu-icon-wrap icon-blue">
            <u-icon name="trash" color="#0195ff" size="18"></u-icon>
          </view>
          <text class="menu-text">清理本地缓存</text>
        </view>
        <view class="menu-right">
          <text class="cache-text">{{ cacheSize }} KB</text>
          <u-icon name="arrow-right" color="#c0c4cc" size="14"></u-icon>
        </view>
      </view>
      <view class="menu-divider"></view>
      <view class="menu-item" @click="handleClearOffline">
        <view class="menu-left">
          <view class="menu-icon-wrap icon-orange">
            <u-icon name="close" color="#ff7847" size="18"></u-icon>
          </view>
          <text class="menu-text">清空离线学习队列</text>
        </view>
        <view class="menu-right">
          <text class="cache-text">未同步记录</text>
          <u-icon name="arrow-right" color="#c0c4cc" size="14"></u-icon>
        </view>
      </view>
    </view>

    <view class="bottom-space"></view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { StorageKey } from '../../utils/storage'

const cacheSize = ref(0)
// 清理缓存时保留的键：登录态 + 用户信息（不清空避免退出登录）
const PRESERVE_KEYS = [
  StorageKey.ACCESS_TOKEN,
  StorageKey.REFRESH_TOKEN,
  StorageKey.USER_INFO,
  StorageKey.STUDY_OFFLINE_QUEUE,
]

function refreshSize() {
  try {
    const info = uni.getStorageInfoSync()
    cacheSize.value = Math.max(0, Math.round(info.currentSize || 0))
  } catch (e) {
    cacheSize.value = 0
  }
}

function handleClearCache() {
  uni.showModal({
    title: '清理本地缓存',
    content: '确认清理本地缓存吗？登录状态与学习记录将保留。',
    success: (res) => {
      if (!res.confirm) return
      try {
        const info = uni.getStorageInfoSync()
        const keys = (info.keys || []) as string[]
        keys.forEach((k) => {
          if (!PRESERVE_KEYS.includes(k as never)) {
            uni.removeStorageSync(k)
          }
        })
        refreshSize()
        uni.showToast({ title: '缓存已清理', icon: 'success' })
      } catch (e) {
        uni.showToast({ title: '清理失败', icon: 'none' })
      }
    },
  })
}

function handleClearOffline() {
  uni.showModal({
    title: '清空离线队列',
    content: '将删除尚未同步的离线学习记录，且不可恢复。确认继续？',
    confirmColor: '#f56c6c',
    success: (res) => {
      if (!res.confirm) return
      try {
        uni.removeStorageSync(StorageKey.STUDY_OFFLINE_QUEUE)
        uni.showToast({ title: '已清空', icon: 'success' })
      } catch (e) {
        uni.showToast({ title: '操作失败', icon: 'none' })
      }
    },
  })
}

function goBack() {
  uni.navigateBack().catch(() => uni.switchTab({ url: '/pages/mine/mine' }))
}

onShow(() => refreshSize())
</script>

<style scoped lang="scss">
.cache-page {
  min-height: 100vh;
  background: $bg-page;
  display: flex;
  flex-direction: column;
}
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(env(safe-area-inset-top) + 10px) 16px 10px;
  background: #fff;
  border-bottom: 1px solid $border;
}
.nav-title { font-size: 17px; font-weight: 600; color: $text-1; }
.nav-right { width: 22px; }
.size-card {
  margin: 16px 14px 0;
  background: $gradient-primary;
  border-radius: $radius-card;
  padding: 22px 20px;
  display: flex;
  align-items: baseline;
  gap: 6px;
  color: #fff;
  box-shadow: 0 6px 20px rgba(1, 149, 255, 0.22);
}
.size-label { font-size: 14px; opacity: 0.9; }
.size-value { font-size: 30px; font-weight: 700; margin-left: 6px; }
.size-unit { font-size: 13px; opacity: 0.85; }
.tip-card {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 14px;
  background: #e6f4ff;
  border-radius: 10px;
  padding: 10px 12px;
}
.tip-text { flex: 1; font-size: 12px; color: #2b7bbf; line-height: 1.6; }
.section-card {
  background: $bg-card;
  border-radius: $radius-card;
  overflow: hidden;
  box-shadow: $shadow-card;
  margin: 0 14px;
}
.menu-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 16px;
  box-sizing: border-box;
}
.menu-item:active { background: #f8f9fa; }
.menu-left { display: flex; flex-direction: row; align-items: center; gap: 12px; }
.menu-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.icon-blue { background: #e6f4ff; }
.icon-orange { background: #fff3ec; }
.menu-text { font-size: 15px; color: $text-1; }
.menu-right { display: flex; flex-direction: row; align-items: center; gap: 6px; }
.cache-text { font-size: 12px; color: $text-3; }
.menu-divider { height: 1px; background: $border; margin-left: 60px; }
.bottom-space { height: 20px; }
</style>
