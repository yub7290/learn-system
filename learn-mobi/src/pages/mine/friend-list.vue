<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <u-navbar title="我的朋友" :border="true" :fixed="true" :safeAreaInsetTop="true" @leftClick="goBack">
      <view slot="left" class="nav-left">
        <u-icon name="arrow-left" size="20"></u-icon>
      </view>
    </u-navbar>

    <scroll-view
      scroll-y
      class="content-scroll"
      show-scrollbar="false"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 好友列表 -->
      <view class="friend-list" v-if="friendList.length > 0">
        <view
          v-for="item in friendList"
          :key="item.id"
          class="friend-card"
          @click="openProfile(item)"
        >
          <image class="friend-avatar" :src="item.avatarUrl || '/static/default-avatar.png'" mode="aspectFill" />
          <view class="friend-info">
            <text class="friend-name">{{ item.nickName || item.name || '同学' }}</text>
            <text class="friend-desc">学号:{{ item.studentNo || '-' }}<text v-if="item.school"> · {{ item.school }}</text></text>
          </view>
          <u-icon name="arrow-right" color="#c0c4cc" size="14" class="friend-arrow"></u-icon>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-wrap" v-if="!loading && friendList.length === 0">
        <u-empty mode="list" text="还没有好友，快去邀请吧" :marginTop="60"></u-empty>
        <u-button type="primary" shape="circle" size="small" customStyle="margin-top:16px" @click="handleInvite">邀请好友</u-button>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 好友资料弹窗 -->
    <u-popup :show="showProfile" mode="center" @close="showProfile = false" :round="16" :closeable="true">
      <view class="profile-body" v-if="currentFriend">
        <image class="profile-avatar" :src="currentFriend.avatarUrl || '/static/default-avatar.png'" mode="aspectFill" />
        <text class="profile-name">{{ currentFriend.nickName || currentFriend.name || '同学' }}</text>
        <view class="profile-row"><text class="profile-label">学号</text><text class="profile-value">{{ currentFriend.studentNo || '-' }}</text></view>
        <view class="profile-row"><text class="profile-label">学校</text><text class="profile-value">{{ currentFriend.school || '未填写' }}</text></view>
        <u-button type="error" shape="circle" size="medium" class="profile-remove-btn" @click="confirmRemove">移除好友</u-button>
      </view>
    </u-popup>

    <!-- 邀请好友悬浮按钮 -->
    <view class="fab-btn" @click="handleInvite">
      <u-icon name="share" color="#fff" size="22"></u-icon>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getMyFriends, removeFriend } from '../../api/friend'
import { shareRecord } from '../../api/mine'
import { useUserStore } from '../../stores/user'
import { H5_BASE_URL } from '../../env'
import type { FriendVO } from '../../types/mine'

const userStore = useUserStore()
const loading = ref(false)
const refreshing = ref(false)
const friendList = ref<FriendVO[]>([])
const showProfile = ref(false)
const currentFriend = ref<FriendVO | null>(null)

async function loadList() {
  loading.value = true
  try {
    const list = await getMyFriends()
    friendList.value = list || []
  } catch {
    friendList.value = []
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

onShow(() => {
  loadList()
})

async function onRefresh() {
  refreshing.value = true
  await loadList()
}

function openProfile(item: FriendVO) {
  currentFriend.value = item
  showProfile.value = true
}

function confirmRemove() {
  const f = currentFriend.value
  if (!f) return
  uni.showModal({
    title: '移除好友',
    content: `确定将 "${f.nickName || f.name || '该好友'}" 从好友列表移除吗？`,
    confirmColor: '#f56c6c',
    success: async (res) => {
      if (!res.confirm) return
      uni.showLoading({ title: '移除中...' })
      try {
        await removeFriend(f.friendId)
        uni.showToast({ title: '已移除', icon: 'success' })
        showProfile.value = false
        await loadList()
      } catch {
        // 错误已由 request 拦截器处理
      } finally {
        uni.hideLoading()
      }
    },
  })
}

function handleInvite() {
  const myId = userStore.userInfo?.id
  if (!myId) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  const shareUrl = `${H5_BASE_URL}/#/pages/register/register?inviter=${myId}`
  uni.showActionSheet({
    itemList: ['分享给好友', '分享到朋友圈', '复制链接'],
    success: async (res) => {
      if (res.tapIndex === 0 || res.tapIndex === 1) {
        try {
          await shareRecord()
          uni.showToast({ title: '分享成功,获得积分奖励', icon: 'success' })
        } catch {
          uni.showToast({ title: '已分享', icon: 'success' })
        }
      } else {
        uni.setClipboardData({
          data: shareUrl,
          success: () => {
            uni.showToast({ title: '链接已复制', icon: 'success' })
          },
        })
      }
    },
  })
}

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $bg-page;
}

.content-scroll {
  width: 100%;
  height: 100vh;
  padding: 64px 14px;
  box-sizing: border-box;
}

.nav-left {
  display: flex;
  align-items: center;
  padding-left: 6px;
}

.friend-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.friend-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  background: $bg-card;
  border-radius: $radius-card;
  box-shadow: $shadow-card;
  padding: 14px 16px;
}

.friend-card:active {
  background: #f8f9fa;
}

.friend-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid $primary-bg;
  background: $bg-page;
}

.friend-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-left: 12px;
  overflow: hidden;
}

.friend-name {
  font-size: 16px;
  font-weight: 600;
  color: $text-1;
}

.friend-desc {
  font-size: 13px;
  color: $text-3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.friend-arrow {
  flex-shrink: 0;
  margin-left: 8px;
}

.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bottom-space {
  height: 100px;
  width: 100%;
}

/* 资料弹窗 */
.profile-body {
  width: 280px;
  padding: 24px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 2px solid $primary-bg;
  background: $bg-page;
}

.profile-name {
  font-size: 17px;
  font-weight: 600;
  color: $text-1;
  margin-top: 10px;
}

.profile-row {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 14px;
}

.profile-label {
  font-size: 13px;
  color: $text-3;
}

.profile-value {
  font-size: 13px;
  color: $text-1;
  max-width: 60%;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-remove-btn {
  margin-top: 20px;
  width: 100%;
}

/* 邀请悬浮按钮（与地址页"+"保持一致） */
.fab-btn {
  position: fixed;
  right: 20px;
  bottom: calc(40px + constant(safe-area-inset-bottom));
  bottom: calc(40px + env(safe-area-inset-bottom));
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: $primary;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(1, 149, 255, 0.4);
}

.fab-btn:active {
  opacity: 0.85;
}
</style>
