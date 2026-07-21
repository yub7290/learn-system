<template>
  <view class="share-modal" v-if="visible" @click="handleClose">
    <view class="share-mask"></view>
    <view class="share-panel" @click.stop>
      <view class="share-header">
        <text class="share-title">分享给好友</text>
        <view class="share-close" @click="handleClose">
          <u-icon name="close" color="#999" size="18"></u-icon>
        </view>
      </view>
      
      <view class="share-card" v-if="shareContent">
        <image class="share-card-image" :src="shareContent.imageUrl || '/static/default-avatar.png'" mode="aspectFill" />
        <view class="share-card-info">
          <text class="share-card-title">{{ shareContent.title }}</text>
          <text class="share-card-desc">{{ shareContent.description }}</text>
        </view>
      </view>
      
      <view class="share-card" v-else>
        <image class="share-card-image" :src="'/static/default-avatar.png'" mode="aspectFill" />
        <view class="share-card-info">
          <text class="share-card-title">智慧教育</text>
          <text class="share-card-desc">随时随地，学你所想</text>
        </view>
      </view>

      <view class="share-qr-code">
        <view class="qr-code-img">
          <text>二维码</text>
        </view>
        <text class="qr-code-tip">扫码注册成为好友</text>
      </view>

      <view class="share-actions">
        <view class="share-action-item" @click="handleShareFriend">
          <view class="share-action-icon friend-icon">
            <u-icon name="chat-circle-fill" color="#07c160" size="28"></u-icon>
          </view>
          <text class="share-action-text">分享给好友</text>
        </view>
        <view class="share-action-item" @click="handleShareTimeline">
          <view class="share-action-icon timeline-icon">
            <u-icon name="share-alt" color="#4a90e2" size="28"></u-icon>
          </view>
          <text class="share-action-text">分享到朋友圈</text>
        </view>
        <view class="share-action-item" @click="handleCopyLink">
          <view class="share-action-icon link-icon">
            <u-icon name="link" color="#0195ff" size="28"></u-icon>
          </view>
          <text class="share-action-text">复制链接</text>
        </view>
      </view>

      <view class="share-footer">
        <text class="share-footer-tip">分享后好友注册可获得积分奖励</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { getActiveShareContent } from '../api/share'
import { shareRecord } from '../api/mine'
import { H5_BASE_URL } from '../env'
import type { ShareContentVO } from '../types/share'

const props = defineProps<{
  visible: boolean
  inviterId: number | undefined
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const shareContent = ref<ShareContentVO | null>(null)

async function loadShareContent() {
  try {
    const content = await getActiveShareContent()
    shareContent.value = content
  } catch {
    shareContent.value = null
  }
}

watch(() => props.visible, (val) => {
  if (val) {
    loadShareContent()
  }
})

function handleClose() {
  emit('close')
}

function getShareUrl() {
  return `${H5_BASE_URL}/#/pages/register/register?inviter=${props.inviterId}`
}

async function handleShareFriend() {
  try {
    await shareRecord()
    uni.showToast({ title: '分享成功', icon: 'success' })
  } catch {
    uni.showToast({ title: '已分享', icon: 'success' })
  }
  emit('close')
}

async function handleShareTimeline() {
  try {
    await shareRecord()
    uni.showToast({ title: '分享成功', icon: 'success' })
  } catch {
    uni.showToast({ title: '已分享', icon: 'success' })
  }
  emit('close')
}

function handleCopyLink() {
  uni.setClipboardData({
    data: getShareUrl(),
    success: () => {
      uni.showToast({ title: '链接已复制', icon: 'success' })
    },
  })
  emit('close')
}
</script>

<style scoped lang="scss">
.share-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.share-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.share-panel {
  position: relative;
  width: 100%;
  background: #fff;
  border-radius: 20px 20px 0 0;
  padding: 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.share-header {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-bottom: 16px;
}

.share-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.share-close {
  position: absolute;
  right: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.share-card {
  display: flex;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 16px;
}

.share-card-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  flex-shrink: 0;
}

.share-card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 12px;
}

.share-card-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.share-card-desc {
  font-size: 12px;
  color: #999;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.share-qr-code {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.qr-code-img {
  width: 120px;
  height: 120px;
  background: #fff;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #999;
}

.qr-code-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.share-actions {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.share-action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.share-action-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.friend-icon {
  background: rgba(7, 193, 96, 0.1);
}

.timeline-icon {
  background: rgba(74, 144, 226, 0.1);
}

.link-icon {
  background: rgba(1, 149, 255, 0.1);
}

.share-action-text {
  font-size: 12px;
  color: #666;
}

.share-footer {
  text-align: center;
}

.share-footer-tip {
  font-size: 12px;
  color: #ccc;
}
</style>