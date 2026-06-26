<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <u-navbar title="个人中心" :border="true" :fixed="true" :safeAreaInsetTop="true" @leftClick="goBack">
      <view slot="left" class="nav-left">
        <u-icon name="arrow-left" size="20"></u-icon>
      </view>
    </u-navbar>

    <scroll-view scroll-y class="content-scroll" show-scrollbar="false">
      <!-- 用户信息卡片 -->
      <view class="user-card">
        <image class="user-avatar" :src="userInfo.avatarUrl || '/static/default-avatar.png'" mode="aspectFill" />
        <view class="user-base">
          <text class="user-nickname">{{ userInfo.nickname || '同学' }}</text>
          <text class="user-account">账号: {{ userInfo.id || '-' }}</text>
        </view>
      </view>

      <!-- 基本信息 -->
      <view class="section-title">基本信息</view>
      <view class="section-card">
        <view class="menu-item" @click="goPage('personalInfo')">
          <view class="menu-left">
            <view class="menu-icon-wrap icon-blue">
              <u-icon name="account" color="#0195ff" size="18"></u-icon>
            </view>
            <text class="menu-text">个人信息</text>
          </view>
          <view class="menu-right">
            <text class="menu-desc">{{ userInfo.nickname || '未设置' }}</text>
            <u-icon name="arrow-right" color="#c0c4cc" size="14"></u-icon>
          </view>
        </view>
        <view class="menu-divider"></view>
        <view class="menu-item" @click="goPage('contact')">
          <view class="menu-left">
            <view class="menu-icon-wrap icon-green">
              <u-icon name="phone" color="#07c160" size="18"></u-icon>
            </view>
            <text class="menu-text">联系方式</text>
          </view>
          <view class="menu-right">
            <text class="menu-desc">{{ userInfo.phone || '未设置' }}</text>
            <u-icon name="arrow-right" color="#c0c4cc" size="14"></u-icon>
          </view>
        </view>
        <view class="menu-divider"></view>
        <view class="menu-item" @click="goPage('changePassword')">
          <view class="menu-left">
            <view class="menu-icon-wrap icon-orange">
              <u-icon name="lock" color="#ff7847" size="18"></u-icon>
            </view>
            <text class="menu-text">密码修改</text>
          </view>
          <u-icon name="arrow-right" color="#c0c4cc" size="14"></u-icon>
        </view>
      </view>

      <!-- 其他 -->
      <view class="section-title">其他</view>
      <view class="section-card">
        <view class="menu-item" @click="goPage('loginLog')">
          <view class="menu-left">
            <view class="menu-icon-wrap icon-blue">
              <u-icon name="order" color="#0195ff" size="18"></u-icon>
            </view>
            <text class="menu-text">登录日志</text>
          </view>
          <u-icon name="arrow-right" color="#c0c4cc" size="14"></u-icon>
        </view>
        <view class="menu-divider"></view>
        <view class="menu-item" @click="handleShare">
          <view class="menu-left">
            <view class="menu-icon-wrap icon-purple">
              <u-icon name="share" color="#9b59b6" size="18"></u-icon>
            </view>
            <text class="menu-text">分享</text>
          </view>
          <u-icon name="arrow-right" color="#c0c4cc" size="14"></u-icon>
        </view>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getPersonalInfo } from '../../api/mine'
import type { PersonalInfoVO } from '../../types/mine'

const userInfo = ref<PersonalInfoVO>({
  id: 0,
  nickname: '同学',
  avatarUrl: '',
  realName: '',
  phone: '',
  email: '',
  gender: 0,
  birthday: '',
  schoolName: '',
  gradeName: '',
})

onMounted(async () => {
  try {
    const info = await getPersonalInfo()
    userInfo.value = info
  } catch (e) {
    /* stub - use defaults */
  }
})

function goBack() {
  uni.navigateBack()
}

function goPage(pageKey: string) {
  const pageMap: Record<string, string> = {
    personalInfo: '/pages/profile/personal-info',
    contact: '/pages/profile/contact-info',
    changePassword: '/pages/profile/change-password',
    loginLog: '/pages/profile/login-log',
  }
  const url = pageMap[pageKey]
  if (url) {
    uni.navigateTo({ url }).catch(() => {})
  } else {
    uni.showToast({ title: '即将上线', icon: 'none' })
  }
}

function handleShare() {
  uni.showActionSheet({
    itemList: ['分享给好友', '分享到朋友圈', '复制链接'],
    success: (res) => {
      if (res.tapIndex === 0) {
        uni.showToast({ title: '已分享给好友', icon: 'success' })
      } else if (res.tapIndex === 1) {
        uni.showToast({ title: '已分享到朋友圈', icon: 'success' })
      } else {
        uni.setClipboardData({
          data: 'https://www.example.com/share',
          success: () => {
            uni.showToast({ title: '链接已复制', icon: 'success' })
          },
        })
      }
    },
  })
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $bg-page;
}

.content-scroll {
  flex: 1;
  width: 100%;
  padding-top: 12px;
  box-sizing: border-box;
}

/* 用户信息卡片 */
.user-card {
  margin: 12px 14px;
  padding: 20px 16px;
  background: $bg-card;
  border-radius: $radius-card;
  display: flex;
  flex-direction: row;
  align-items: center;
  box-shadow: $shadow-card;
}

.user-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid $primary-bg;
  background: $bg-page;
}

.user-base {
  margin-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.user-nickname {
  font-size: 18px;
  font-weight: 600;
  color: $text-1;
}

.user-account {
  font-size: 13px;
  color: $text-3;
}

/* 分组标题 */
.section-title {
  font-size: 13px;
  color: $text-3;
  margin: 8px 14px 6px;
  padding-left: 4px;
}

/* 功能卡片 */
.section-card {
  margin: 0 14px 12px;
  background: $bg-card;
  border-radius: $radius-card;
  overflow: hidden;
  box-shadow: $shadow-card;
}

/* 菜单项 */
.menu-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 16px;
  box-sizing: border-box;
}

.menu-item:active {
  background: #f8f9fa;
}

.menu-left {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

.menu-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-blue {
  background: #e6f4ff;
}

.icon-green {
  background: #f0f9eb;
}

.icon-orange {
  background: #fff3ec;
}

.icon-purple {
  background: #f3eef9;
}

.menu-text {
  font-size: 15px;
  color: $text-1;
}

.menu-right {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  max-width: 60%;
}

.menu-desc {
  font-size: 12px;
  color: $text-3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 分割线 */
.menu-divider {
  height: 1px;
  background: $border;
  margin-left: 60px;
}

.bottom-space {
  height: 30px;
  width: 100%;
}

.nav-left {
  display: flex;
  align-items: center;
  padding-left: 6px;
}
</style>
