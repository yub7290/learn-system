<template>
  <view class="home-page">
    <!-- 顶部用户区 -->
    <view class="header-section">
      <view class="user-row">
        <view class="user-avatar">
          <text>{{ studentName.charAt(0) }}</text>
        </view>
        <view class="user-info">
          <text class="greeting">你好，{{ studentName }}</text>
          <text class="sub-greeting">今天也要加油，持续进步哦</text>
        </view>
      </view>
      <view class="growth-badge">
        <text class="growth-value">{{ growthValue }}</text>
        <text class="growth-label">成长值</text>
      </view>
    </view>

    <scroll-view scroll-y class="page-scroll">
      <!-- 核心数据看板 -->
      <view class="stats-card">
        <view class="stats-item">
          <text class="stats-num">{{ todayStats.duration }}</text>
          <text class="stats-unit">分钟</text>
          <text class="stats-label">今日学习</text>
        </view>
        <view class="stats-divider"></view>
        <view class="stats-item">
          <text class="stats-num">{{ todayStats.streak }}</text>
          <text class="stats-unit">天</text>
          <text class="stats-label">连续学习</text>
        </view>
        <view class="stats-divider"></view>
        <view class="stats-item">
          <text class="stats-num">{{ todayStats.knowledge }}</text>
          <text class="stats-unit">个</text>
          <text class="stats-label">已掌握知识点</text>
        </view>
      </view>

      <!-- 核心功能入口 -->
      <view class="entry-section">
        <view class="entry-card entry-overview" @click="goToOverview">
          <view class="entry-icon">
            <text class="iconfont icon-tongji"></text>
          </view>
          <view class="entry-content">
            <text class="entry-title">学习能力总览</text>
            <text class="entry-desc">查看五维能力 知识图谱 学情分析</text>
          </view>
          <view class="entry-arrow">
            <text>&#x203A;</text>
          </view>
        </view>

        <view class="entry-card entry-plan" @click="goToWeekPlan">
          <view class="entry-icon">
            <text class="iconfont icon-a-wangluokechengzaixianjiaoyu"></text>
          </view>
          <view class="entry-content">
            <text class="entry-title">本周学习计划</text>
            <text class="entry-desc">AI定制日程 每日任务 推荐课程</text>
          </view>
          <view class="entry-arrow">
            <text>&#x203A;</text>
          </view>
        </view>
      </view>

      <!-- 本周学习进度 -->
      <view class="section-card">
        <view class="card-header">
          <text class="card-title">本周学习进度</text>
          <text class="card-link" @click="goToWeekPlan">查看详情 &#x203A;</text>
        </view>
        <view class="week-progress">
          <view class="progress-main">
            <text class="progress-percent">{{ weekProgress }}%</text>
            <view class="progress-bar-wrap">
              <view class="progress-bar">
                <view class="progress-fill" :style="{ width: weekProgress + '%' }"></view>
              </view>
            </view>
          </view>
          <view class="progress-stats">
            <view class="p-stat">
              <text class="p-num">{{ weekDone.duration }}/{{ weekTotal.duration }}</text>
              <text class="p-label">学习时长(分)</text>
            </view>
            <view class="p-stat">
              <text class="p-num">{{ weekDone.questions }}/{{ weekTotal.questions }}</text>
              <text class="p-label">练习题(道)</text>
            </view>
            <view class="p-stat">
              <text class="p-num">{{ weekDone.knowledge }}/{{ weekTotal.knowledge }}</text>
              <text class="p-label">知识点(个)</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 今日待办 -->
      <view class="section-card">
        <view class="card-header">
          <text class="card-title">今日待办任务</text>
          <text class="card-sub">{{ todayTaskDone }}/{{ todayTaskTotal }} 项已完成</text>
        </view>
        <view class="task-list">
          <view
            class="task-item"
            :class="{ done: task.done }"
            v-for="task in todayTasks"
            :key="task.id"
            @click="handleTaskClick(task)"
          >
            <view class="task-check">
              <text v-if="task.done">&#x2713;</text>
            </view>
            <view class="task-info">
              <text class="task-name">{{ task.name }}</text>
              <text class="task-meta">{{ task.knowledge }} {{ task.desc }}</text>
            </view>
            <view class="task-tag" :class="task.type">
              <text>{{ task.typeText }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 成长亮点 -->
      <view class="section-card">
        <view class="card-header">
          <text class="card-title">成长亮点</text>
          <text class="card-sub">本周新解锁</text>
        </view>
        <view class="badge-list">
          <view class="badge-item" v-for="badge in badgeList" :key="badge.id">
            <view class="badge-icon" :style="{ background: badge.color }">
              <text class="iconfont" :class="badge.iconClass"></text>
            </view>
            <text class="badge-name">{{ badge.name }}</text>
          </view>
        </view>
        <view class="highlight-tip">
          <u-icon name="info-circle" size="14" color="#f57c00"></u-icon>
          <text>{{ highlightTip }}</text>
        </view>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <TabBar :current="2"></TabBar>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import TabBar from '../../components/TabBar.vue'
import { getStudentHomeData } from '../../api/student'
import { requireLogin } from '../../utils/auth'
import type { TodayStatsVO, WeekStatsVO, DailyTaskVO, BadgeVO } from '../../types/student'

const studentName = ref('')
const growthValue = ref(0)
const todayStats = ref<TodayStatsVO>({ duration: 0, streak: 0, knowledge: 0 })
const weekTotal = ref<WeekStatsVO>({ duration: 0, questions: 0, knowledge: 0 })
const weekDone = ref<WeekStatsVO>({ duration: 0, questions: 0, knowledge: 0 })
const todayTasks = ref<DailyTaskVO[]>([])
const badgeList = ref<BadgeVO[]>([])
const highlightTip = ref('')

const weekProgress = computed(() => {
  if (weekTotal.value.duration === 0) return 0
  return Math.round((weekDone.value.duration / weekTotal.value.duration) * 100)
})

const todayTaskTotal = computed(() => todayTasks.value.length)
const todayTaskDone = computed(() => todayTasks.value.filter((t) => t.done).length)

onShow(async () => {
  try {
    const data = await getStudentHomeData()
    studentName.value = data.studentName
    growthValue.value = data.growthValue
    todayStats.value = data.todayStats
    weekTotal.value = data.weekTotal
    weekDone.value = data.weekDone
    todayTasks.value = data.todayTasks
    badgeList.value = data.badgeList
    highlightTip.value = data.highlightTip
  } catch {
    /* 数据加载失败时保留空态 */
  }
})

function goToOverview(): void {
  if (!requireLogin('登录后才能查看学习能力总览')) return
  uni.navigateTo({ url: '/pages/student-overview/overview' })
}

function goToWeekPlan(): void {
  if (!requireLogin('登录后才能查看学习周计划')) return
  uni.navigateTo({ url: '/pages/student-overview/weekly' })
}

function handleTaskClick(task: DailyTaskVO): void {
  if (task.done) {
    uni.showToast({ title: '任务已完成', icon: 'none' })
    return
  }
  if (!requireLogin('登录后才能查看学习任务')) return
  const params = 'taskId=' + task.id + '&knowledge=' + encodeURIComponent(task.knowledge)
  if (task.type === 'course' || task.type === 'learn' || task.type === 'preview') {
    uni.navigateTo({ url: '/pages/course/detail?id=' + task.id + '&' + params })
    return
  }
  if (task.type === 'practice' || task.type === 'review') {
    uni.navigateTo({ url: '/pages/practice/question?' + params })
    return
  }
  uni.navigateTo({ url: '/pages/student-overview/weekly?taskId=' + task.id })
}
</script>

<style scoped lang="scss">
.home-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, #e8f5e9 0%, $bg-page 30%);
}

/* 顶部用户区 */
.header-section {
  flex-shrink: 0;
  width: 100%;
  padding: 32rpx 32rpx 24rpx;
  padding-top: calc(32rpx + env(safe-area-inset-top));
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}
.user-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20rpx;
}
.user-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #07c160, #67c23a);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 36rpx;
  font-weight: 600;
}
.user-info {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}
.greeting {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-1;
}
.sub-greeting {
  font-size: 24rpx;
  color: $text-2;
}
.growth-badge {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2rpx;
  padding: 10rpx 20rpx;
  background: $bg-card;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(7, 193, 96, 0.1);
}
.growth-value {
  font-size: 28rpx;
  font-weight: 700;
  color: #07c160;
  line-height: 1;
}
.growth-label {
  font-size: 20rpx;
  color: $text-3;
}

.page-scroll {
  flex: 1;
  width: 100%;
  height: 0;
  padding: 0 24rpx 24rpx;
  box-sizing: border-box;
}

/* 核心数据看板 */
.stats-card {
  width: 100%;
  padding: 32rpx 20rpx;
  background: linear-gradient(135deg, #07c160 0%, #10b981 100%);
  border-radius: 16rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 8rpx 20rpx rgba(7, 193, 96, 0.2);
  margin-bottom: 24rpx;
}
.stats-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  color: #fff;
}
.stats-num {
  font-size: 44rpx;
  font-weight: 700;
  line-height: 1;
}
.stats-unit {
  font-size: 22rpx;
  opacity: 0.9;
  margin-left: 4rpx;
}
.stats-label {
  font-size: 22rpx;
  opacity: 0.85;
  margin-top: 4rpx;
}
.stats-divider {
  width: 1rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.3);
}

/* 核心功能入口 */
.entry-section {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 24rpx;
}
.entry-card {
  width: 100%;
  padding: 28rpx 24rpx;
  border-radius: 12rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20rpx;
  box-sizing: border-box;
  box-shadow: $shadow-card;
  transition: transform 0.2s;
}
.entry-card:active {
  transform: scale(0.98);
}
.entry-overview {
  background: linear-gradient(135deg, #e3f2fd 0%, #fff 60%);
  border: 1rpx solid #bbdefb;
}
.entry-plan {
  background: linear-gradient(135deg, #f0f9eb 0%, #fff 60%);
  border: 1rpx solid #c8e6c9;
}
.entry-icon {
  width: 72rpx;
  height: 72rpx;
  font-size: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 12rpx;
  flex-shrink: 0;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}
.entry-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}
.entry-title {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-1;
}
.entry-desc {
  font-size: 24rpx;
  color: $text-2;
}
.entry-arrow {
  font-size: 36rpx;
  color: #ccc;
  flex-shrink: 0;
}

/* 通用卡片 */
.section-card {
  width: 100%;
  background: $bg-card;
  border-radius: 12rpx;
  padding: 28rpx 24rpx;
  box-sizing: border-box;
  box-shadow: $shadow-card;
  margin-bottom: 24rpx;
}
.card-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}
.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-1;
}
.card-sub {
  font-size: 24rpx;
  color: $text-3;
}
.card-link {
  font-size: 24rpx;
  color: #07c160;
}

/* 本周进度 */
.week-progress {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
.progress-main {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20rpx;
}
.progress-percent {
  font-size: 36rpx;
  font-weight: 700;
  color: #07c160;
  width: 120rpx;
  flex-shrink: 0;
}
.progress-bar-wrap {
  flex: 1;
}
.progress-bar {
  width: 100%;
  height: 16rpx;
  background: #f0f0f0;
  border-radius: 8rpx;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #07c160, #67c23a);
  border-radius: 8rpx;
  transition: width 0.3s;
}
.progress-stats {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  padding-top: 16rpx;
  border-top: 1rpx solid $border;
}
.p-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}
.p-num {
  font-size: 26rpx;
  font-weight: 500;
  color: $text-1;
}
.p-label {
  font-size: 22rpx;
  color: $text-3;
}

/* 今日待办 */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.task-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx;
  background: #fafbfc;
  border-radius: 10rpx;
  border: 1rpx solid $border;
}
.task-item.done {
  opacity: 0.6;
}
.task-check {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  border: 2rpx solid #ddd;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  color: #fff;
}
.task-item.done .task-check {
  background: #07c160;
  border-color: #07c160;
}
.task-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}
.task-name {
  font-size: 28rpx;
  color: $text-1;
  font-weight: 500;
}
.task-item.done .task-name {
  text-decoration: line-through;
  color: $text-3;
}
.task-meta {
  font-size: 22rpx;
  color: $text-3;
}
.task-tag {
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  flex-shrink: 0;
}
.task-tag.course {
  background: #e3f2fd;
  color: #1976d2;
}
.task-tag.practice {
  background: #fff3e0;
  color: #f57c00;
}
.task-tag.summary {
  background: #e8f5e9;
  color: #388e3c;
}

/* 成长亮点 */
.badge-list {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  margin-bottom: 20rpx;
}
.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}
.badge-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: #fff;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
}
.badge-name {
  font-size: 22rpx;
  color: $text-2;
}
.highlight-tip {
  padding: 20rpx;
  background: #fff8e1;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #f57c00;
  line-height: 1.6;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.bottom-space {
  height: 40rpx;
  width: 100%;
}
</style>
