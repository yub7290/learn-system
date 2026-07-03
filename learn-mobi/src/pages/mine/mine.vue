<template>
  <view class="mine-page">
    <!-- 顶部用户信息区 -->
    <view class="user-header">
      <view class="user-content">
        <image
          class="user-avatar"
          :src="user.avatarUrl || '/static/default-avatar.png'"
          mode="aspectFill"
          @click="goProfileCenter"
        />
        <view class="user-info" @click="goProfileCenter">
          <template v-if="userStore.isLoggedIn">
            <text class="user-nickname">{{ user.nickName || user.name || '同学' }}</text>
            <text class="user-desc">学号:{{ user.studentNo || '-' }}</text>
          </template>
          <template v-else>
            <text class="user-nickname">未登录</text>
            <text class="user-desc">点击登录账号</text>
          </template>
        </view>
        <u-icon name="setting" color="rgba(255,255,255,0.85)" size="20" @click="goSetting"></u-icon>
      </view>
    </view>

    <!-- 学习统计 -->
    <view class="stats-card">
      <view class="stat-item" @click="goPage('myCourse')">
        <text class="stat-num">{{ stats.courseCount || 0 }}</text>
        <text class="stat-label">在学课程</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-num">{{ stats.studyHours || 0 }}h</text>
        <text class="stat-label">累计学时</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item" @click="goPage('points')">
        <text class="stat-num">{{ stats.points || 0 }}</text>
        <text class="stat-label">我的积分</text>
      </view>
    </view>

    <!-- 功能区 -->
    <scroll-view scroll-y class="content-scroll" show-scrollbar="false">
      <!-- 学习服务 -->
      <view class="section-card">
        <view class="menu-item" @click="goPage('myCourse')">
          <view class="menu-left">
            <view class="menu-icon-wrap icon-blue">
              <u-icon name="bookmark" color="#0195ff" size="18"></u-icon>
            </view>
            <text class="menu-text">我的课程</text>
          </view>
          <u-icon name="arrow-right" color="#c0c4cc" size="14"></u-icon>
        </view>
        <view class="menu-divider"></view>
        <view class="menu-item" @click="goPage('studyCard')">
          <view class="menu-left">
            <view class="menu-icon-wrap icon-green">
              <u-icon name="coupon" color="#07c160" size="18"></u-icon>
            </view>
            <text class="menu-text">学习卡</text>
          </view>
          <u-icon name="arrow-right" color="#c0c4cc" size="14"></u-icon>
        </view>
        <view class="menu-divider"></view>
        <view class="menu-item" @click="goPage('points')">
          <view class="menu-left">
            <view class="menu-icon-wrap icon-orange">
              <u-icon name="gift" color="#ff7847" size="18"></u-icon>
            </view>
            <text class="menu-text">积分兑换</text>
          </view>
          <u-icon name="arrow-right" color="#c0c4cc" size="14"></u-icon>
        </view>
      </view>

      <!-- 学习记录 -->
      <view class="section-card">
        <view class="menu-item" @click="goPage('studyRecord')">
          <view class="menu-left">
            <view class="menu-icon-wrap icon-blue">
              <u-icon name="clock" color="#0195ff" size="18"></u-icon>
            </view>
            <text class="menu-text">学习记录</text>
          </view>
          <u-icon name="arrow-right" color="#c0c4cc" size="14"></u-icon>
        </view>
        <view class="menu-divider"></view>
        <view class="menu-item" @click="goPage('favorite')">
          <view class="menu-left">
            <view class="menu-icon-wrap icon-red">
              <u-icon name="heart" color="#f56c6c" size="18"></u-icon>
            </view>
            <text class="menu-text">我的收藏</text>
          </view>
          <u-icon name="arrow-right" color="#c0c4cc" size="14"></u-icon>
        </view>
        <view class="menu-divider"></view>
        <view class="menu-item" @click="goPage('note')">
          <view class="menu-left">
            <view class="menu-icon-wrap icon-purple">
              <u-icon name="edit-pen" color="#9b59b6" size="18"></u-icon>
            </view>
            <text class="menu-text">我的笔记</text>
          </view>
          <u-icon name="arrow-right" color="#c0c4cc" size="14"></u-icon>
        </view>
      </view>

      <!-- 账户相关 -->
      <view class="section-card">
        <view class="menu-item" @click="goPage('fund')">
          <view class="menu-left">
            <view class="menu-icon-wrap icon-green">
              <u-icon name="order" color="#07c160" size="18"></u-icon>
            </view>
            <text class="menu-text">资金明细</text>
          </view>
          <u-icon name="arrow-right" color="#c0c4cc" size="14"></u-icon>
        </view>
        <view class="menu-divider"></view>
        <view class="menu-item" @click="goPage('bindAccount')">
          <view class="menu-left">
            <view class="menu-icon-wrap icon-blue">
              <u-icon name="lock" color="#0195ff" size="18"></u-icon>
            </view>
            <text class="menu-text">账号绑定</text>
          </view>
          <u-icon name="arrow-right" color="#c0c4cc" size="14"></u-icon>
        </view>
        <view class="menu-divider"></view>
        <view class="menu-item" @click="goPage('friends')">
          <view class="menu-left">
            <view class="menu-icon-wrap icon-orange">
              <u-icon name="account" color="#ff7847" size="18"></u-icon>
            </view>
            <text class="menu-text">我的朋友</text>
          </view>
          <u-icon name="arrow-right" color="#c0c4cc" size="14"></u-icon>
        </view>
      </view>

      <!-- 系统设置 -->
      <view class="section-card">
        <view class="menu-item" @click="goPage('notice')">
          <view class="menu-left">
            <view class="menu-icon-wrap icon-blue">
              <u-icon name="bell" color="#0195ff" size="18"></u-icon>
            </view>
            <text class="menu-text">通知</text>
          </view>
          <u-icon name="arrow-right" color="#c0c4cc" size="14"></u-icon>
        </view>
        <view class="menu-divider"></view>
        <view class="menu-item" @click="goPage('news')">
          <view class="menu-left">
            <view class="menu-icon-wrap icon-green">
              <u-icon name="eye" color="#07c160" size="18"></u-icon>
            </view>
            <text class="menu-text">新闻资讯</text>
          </view>
          <u-icon name="arrow-right" color="#c0c4cc" size="14"></u-icon>
        </view>
        <view class="menu-divider"></view>
        <view class="menu-item" @click="handleClearCache">
          <view class="menu-left">
            <view class="menu-icon-wrap icon-gray">
              <u-icon name="reload" color="#999" size="18"></u-icon>
            </view>
            <text class="menu-text">缓存管理</text>
          </view>
          <view class="menu-right">
            <text class="cache-text">{{ cacheSize }}</text>
            <u-icon name="arrow-right" color="#c0c4cc" size="14"></u-icon>
          </view>
        </view>
      </view>

      <!-- 退出登录 -->
      <view class="logout-btn" v-if="userStore.isLoggedIn" @click="handleLogout">
        <text>退出登录</text>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <TabBar :current="4"></TabBar>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import TabBar from '../../components/TabBar.vue'
import { useUserStore } from '../../stores/user'
import { getStudyStats } from '../../api/study'
import { getPointsAccount } from '../../api/mine'
import { requireLogin } from '../../utils/auth'
import type { StudyStatsVO } from '../../types/study'

const userStore = useUserStore()
const user = ref(userStore.userInfo || ({} as any))
const stats = ref<StudyStatsVO & { points?: number }>({
  courseCount: 0,
  studyHours: 0,
  certCount: 0,
  points: 0,
})
const cacheSize = ref('0M')

onShow(async () => {
  if (userStore.isLoggedIn) {
    // 刷新用户信息（从个人中心修改头像/昵称后同步）
    try {
      await userStore.fetchUserInfo()
    } catch (e) {
      /* 忽略 */
    }
    user.value = userStore.userInfo || ({} as any)
    try {
      const s = await getStudyStats()
      stats.value = { ...stats.value, ...s }
    } catch (e) {
      /* stub => zeros */
    }
    try {
      const pa = await getPointsAccount()
      stats.value.points = pa.availablePoints || 0
    } catch (e) {
      /* stub */
    }
  } else {
    user.value = {} as any
    stats.value = {
      courseCount: 0,
      studyHours: 0,
      certCount: 0,
      points: 0,
    }
  }
  getCacheSize()
})

function getCacheSize() {
  try {
    const info = uni.getStorageInfoSync()
    const size = (info.currentSize / 1024).toFixed(1)
    cacheSize.value = `${size}M`
  } catch (e) {
    cacheSize.value = '0M'
  }
}

function goProfileCenter() {
  if (!requireLogin('登录后才能查看个人资料')) return
  uni.navigateTo({ url: '/pages/mine/centre' })
}

function goSetting() {
  if (!requireLogin('登录后才能进入账号设置')) return
  uni.navigateTo({ url: '/pages/mine/centre' })
}

function goPage(pageKey: string) {
  if (!requireLogin('登录后才能使用该功能')) return
  const pageMap: Record<string, string> = {
    myCourse: '/pages/mine/my-course',
    studyCard: '/pages/mine/study-card',
    points: '/pages/mine/points-exchange',
    studyRecord: '/pages/mine/study-record',
    favorite: '/pages/practice/favorite',
    note: '/pages/practice/note',
  }
  const url = pageMap[pageKey]
  if (url) {
    uni.navigateTo({ url }).catch(() => {})
  } else {
    uni.showToast({ title: '功能开发中', icon: 'none' })
  }
}

function handleClearCache() {
  uni.showModal({
    title: '提示',
    content: '确定要清除本地缓存吗？',
    success: (res) => {
      if (res.confirm) {
        uni.clearStorageSync()
        cacheSize.value = '0M'
        uni.showToast({ title: '缓存已清除', icon: 'success' })
      }
    },
  })
}

function handleLogout() {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出当前账号吗？',
    confirmColor: '#f56c6c',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        user.value = {} as any
        stats.value = {
          courseCount: 0,
          studyHours: 0,
          certCount: 0,
          points: 0,
        }
        uni.showToast({ title: '已退出登录', icon: 'success' })
      }
    },
  })
}
</script>

<style scoped lang="scss">
.mine-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: $bg-page;
  padding-bottom: 0;
}

/* 顶部用户信息区 */
.user-header {
  flex-shrink: 0;
  background: $gradient-primary;
  padding: 24px 18px 40px;
}

.user-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 14px;
  color: #fff;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.25);
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-nickname {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

.user-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 2px;
}

/* 学习统计 */
.stats-card {
  background: $bg-card;
  margin: -26px 14px 0;
  border-radius: $radius-card;
  padding: 16px 6px;
  display: flex;
  box-shadow: 0 6px 20px rgba(1, 149, 255, 0.22);
  position: relative;
  z-index: 1;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-num {
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: $primary;
}

.stat-label {
  font-size: 11px;
  color: $text-3;
  margin-top: 4px;
}

.stat-divider {
  width: 1px;
  background: $border;
}

/* 滚动内容区 */
.content-scroll {
  flex: 1;
  width: 100%;
  padding: 12px 14px 0;
  box-sizing: border-box;
}

/* 功能卡片分组 */
.section-card {
  background: $bg-card;
  border-radius: $radius-card;
  overflow: hidden;
  box-shadow: $shadow-card;
  margin-bottom: 12px;
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

.icon-red {
  background: #fef0f0;
}

.icon-purple {
  background: #f3eef9;
}

.icon-gray {
  background: #f5f7fa;
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
}

.cache-text {
  font-size: 12px;
  color: $text-3;
}

/* 分割线 */
.menu-divider {
  height: 1px;
  background: $border;
  margin-left: 60px;
}

/* 退出登录 */
.logout-btn {
  margin: 16px 0;
  height: 46px;
  background: $bg-card;
  border-radius: $radius-card;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-card;
}

.logout-btn:active {
  opacity: 0.8;
}

.logout-btn text {
  font-size: 15px;
  color: $danger;
  font-weight: 500;
}

.bottom-space {
  height: 20px;
  width: 100%;
}
</style>
