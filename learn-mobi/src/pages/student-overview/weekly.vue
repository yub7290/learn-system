<template>
  <view class="plan-page">
    <!-- 顶部导航栏 -->
    <view class="page-header">
      <view class="header-left">
        <view class="back-btn" @click="goBack">
          <text class="back-icon">&#x2039;</text>
        </view>
        <text class="page-title">学习周计划</text>
      </view>

      <!-- 周次切换控件 -->
      <view class="week-switch">
        <view
          class="week-arrow-btn"
          :class="{ disabled: currentWeekIndex >= weekPlanList.length - 1 }"
          @click="prevWeek"
        >
          <text>&#x2039;</text>
        </view>
        <view class="week-tag" @click="showWeekPicker = true">
          <text>{{ currentWeek.weekName }}</text>
          <text class="week-arrow">&#x25BE;</text>
        </view>
        <view
          class="week-arrow-btn"
          :class="{ disabled: currentWeekIndex === 0 }"
          @click="nextWeek"
        >
          <text>&#x203A;</text>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="page-scroll">
      <!-- 生成说明卡片 -->
      <view class="intro-card">
        <view class="intro-icon">
          <text class="iconfont icon-robot"></text>
        </view>
        <view class="intro-content">
          <text class="intro-title">AI 智能学习计划</text>
          <text class="intro-desc">
            基于上周知识图谱分析，重点补强 {{ currentWeek.weakPoints }} 等薄弱知识点，针对性安排学习与练习，稳步提升掌握度。
          </text>
        </view>
      </view>

      <!-- 本周目标总览 -->
      <view class="section-card">
        <view class="card-header">
          <text class="card-title">本周目标总览</text>
          <view class="regen-btn" @click="regeneratePlan">
            <text>重新生成</text>
          </view>
        </view>
        <view class="target-grid">
          <view class="target-item">
            <text class="target-num">{{ doneDuration }}/{{ weekTotal.duration }}</text>
            <text class="target-label">学习时长(分钟)</text>
          </view>
          <view class="target-item">
            <text class="target-num">{{ doneQuestions }}/{{ weekTotal.questions }}</text>
            <text class="target-label">试题练习(道)</text>
          </view>
          <view class="target-item">
            <text class="target-num">{{ doneKnowledge }}/{{ weekTotal.knowledge }}</text>
            <text class="target-label">知识点学习(个)</text>
          </view>
        </view>
        <view class="total-progress">
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: totalProgress + '%' }"></view>
          </view>
          <text class="progress-text">已完成 {{ totalProgress }}%</text>
        </view>
      </view>

      <!-- 每日学习日程 -->
      <view class="section-card">
        <view class="card-header">
          <text class="card-title">每日学习日程</text>
          <text class="card-sub">AI 定制安排</text>
        </view>

        <view class="day-list">
          <view
            class="day-card"
            :class="{ active: activeDayIndex === index }"
            v-for="(day, index) in dailyPlanList"
            :key="index"
            @click="toggleDay(index)"
          >
            <view class="day-header">
              <view class="day-left">
                <text class="day-week">{{ day.weekday }}</text>
                <text class="day-date">{{ day.date }}</text>
              </view>
              <view class="day-stats">
                <view class="stat-item">
                  <text class="stat-value">{{ day.durationDone }}/{{ day.durationTarget }}</text>
                  <text class="stat-label">分钟</text>
                </view>
                <view class="stat-item">
                  <text class="stat-value">{{ day.questionDone }}/{{ day.questionTarget }}</text>
                  <text class="stat-label">道题</text>
                </view>
                <view class="stat-item">
                  <text class="stat-value">{{ day.knowledgeDone }}/{{ day.knowledgeTarget }}</text>
                  <text class="stat-label">知识点</text>
                </view>
              </view>
              <view class="day-arrow">
                <text>{{ activeDayIndex === index ? '&#x2227;' : '&#x2228;' }}</text>
              </view>
            </view>

            <view class="day-progress">
              <view class="day-progress-bar">
                <view
                  class="day-progress-fill"
                  :style="{ width: (day.durationDone / (day.durationTarget || 1)) * 100 + '%' }"
                ></view>
              </view>
            </view>

            <view class="day-detail" v-if="activeDayIndex === index">
              <view
                class="task-item"
                v-for="(task, tIndex) in day.tasks"
                :key="tIndex"
                @click.stop="goToTaskPage(task)"
              >
                <view class="task-dot" :class="[task.type, task.done ? 'done' : '']"></view>
                <view class="task-content">
                  <text class="task-title">{{ task.title }}</text>
                  <text class="task-sub">
                    {{ task.knowledge }}
                    {{ task.jumpType === 'question' || task.jumpType === 'paper' ? task.questionCount + '道题' : task.duration + '分钟' }}
                  </text>
                </view>
                <view class="task-status" v-if="task.done">
                  <text>&#x2713;</text>
                </view>
                <view class="task-arrow">
                  <text>&#x203A;</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 推荐课程 -->
      <view class="section-card">
        <view class="card-header">
          <text class="card-title">薄弱点推荐课程</text>
          <text class="card-sub">精准补强</text>
        </view>
        <view class="course-list">
          <view
            class="course-card"
            v-for="course in currentWeek.recommendCourses"
            :key="course.id"
            @click="goToCourseDetail(course)"
          >
            <view class="course-cover" :style="{ background: course.coverColor }">
              <text class="course-tag">{{ course.difficulty }}</text>
            </view>
            <view class="course-info">
              <text class="course-title">{{ course.title }}</text>
              <text class="course-knowledge">对应知识点：{{ course.knowledge }}</text>
              <view class="course-meta">
                <text class="course-duration">{{ course.duration }}分钟</text>
                <text class="course-count">共 {{ course.lessonCount }} 节课</text>
              </view>
            </view>
            <view class="course-btn">
              <text>去学习</text>
            </view>
          </view>
        </view>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 周次选择弹窗 -->
    <view class="week-picker-mask" v-if="showWeekPicker" @click="showWeekPicker = false">
      <view class="week-picker-content" @click.stop>
        <view class="picker-header">
          <text class="picker-title">选择周计划</text>
          <view class="picker-close" @click="showWeekPicker = false">
            <text>&#x2715;</text>
          </view>
        </view>
        <scroll-view scroll-y class="week-list">
          <view
            class="week-item"
            :class="{ active: currentWeekIndex === index }"
            v-for="(item, index) in weekPlanList"
            :key="index"
            @click="selectWeek(index)"
          >
            <text class="week-name">{{ item.weekName }}</text>
            <view class="week-right">
              <text class="week-status">{{ item.statusText }}</text>
              <text v-if="index === 0" class="current-tag">本周</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getWeekPlanDetail, getWeekPlanDetailList, regenerateWeekPlan, updateWeeklyTaskStatus } from '../../api/student'
import type { WeekPlanDetailVO, DailyPlanVO, TaskItemVO, RecommendCourseVO } from '../../types/student'

const activeDayIndex = ref(0)
const currentWeekIndex = ref(0)
const showWeekPicker = ref(false)

const currentWeek = ref<WeekPlanDetailVO>({
  planId: 0,
  weekName: '',
  statusText: '',
  weakPoints: '',
  weekTotal: { duration: 0, questions: 0, knowledge: 0 },
  dailyPlanList: [],
  recommendCourses: [],
  advantageSummary: '',
  weakSummary: '',
  studySuggestion: '',
})

const weekPlanList = ref<{ weekName: string; statusText: string }[]>([])
const weekTotal = computed(() => currentWeek.value.weekTotal)
const dailyPlanList = computed<DailyPlanVO[]>(() => currentWeek.value.dailyPlanList || [])

const doneDuration = computed(() => {
  let sum = 0
  dailyPlanList.value.forEach((day) => (sum += day.durationDone))
  return sum
})

const doneQuestions = computed(() => {
  let sum = 0
  dailyPlanList.value.forEach((day) => (sum += day.questionDone))
  return sum
})

const doneKnowledge = computed(() => {
  let sum = 0
  dailyPlanList.value.forEach((day) => (sum += day.knowledgeDone))
  return sum
})

const totalProgress = computed(() => {
  const total = weekTotal.value.duration
  if (total === 0) return 0
  return Math.round((doneDuration.value / total) * 100)
})

onShow(async () => {
  const [detail, list] = await Promise.all([
    getWeekPlanDetail(currentWeekIndex.value),
    getWeekPlanDetailList(),
  ])
  currentWeek.value = detail
  weekPlanList.value = list
})

async function loadWeekPlan(): Promise<void> {
  currentWeek.value = await getWeekPlanDetail(currentWeekIndex.value)
}

function toggleDay(index: number): void {
  activeDayIndex.value = activeDayIndex.value === index ? -1 : index
}

async function regeneratePlan(): Promise<void> {
  uni.showLoading({ title: '正在重新生成' })
  try {
    currentWeek.value = await regenerateWeekPlan(currentWeekIndex.value)
    weekPlanList.value = await getWeekPlanDetailList()
    uni.showToast({ title: '计划已更新', icon: 'success' })
  } finally {
    uni.hideLoading()
  }
}

function prevWeek(): void {
  if (currentWeekIndex.value >= weekPlanList.value.length - 1) return
  currentWeekIndex.value++
  resetViewState()
  loadWeekPlan()
}

function nextWeek(): void {
  if (currentWeekIndex.value === 0) return
  currentWeekIndex.value--
  resetViewState()
  loadWeekPlan()
}

function selectWeek(index: number): void {
  currentWeekIndex.value = index
  showWeekPicker.value = false
  resetViewState()
  loadWeekPlan()
}

function resetViewState(): void {
  activeDayIndex.value = 0
}

async function goToTaskPage(task: TaskItemVO): Promise<void> {
  if (task.done) {
    uni.showToast({ title: '任务已完成', icon: 'none' })
    return
  }
  await updateWeeklyTaskStatus(task.taskId, true)
  task.done = true
  let url = ''
  const targetId = task.targetId || task.taskId
  const params = 'taskId=' + task.taskId + '&knowledge=' + encodeURIComponent(task.knowledge)
  switch (task.jumpType) {
    case 'course':
      url = '/pages/course/detail?cid=' + targetId + '&' + params
      break
    case 'question':
      url = '/pages/practice/question?' + params
      break
    case 'paper':
      url = '/pages/exam/online-test?examId=' + targetId + '&' + params
      break
    case 'result':
      url = '/pages/course/knowledge-detail?id=' + targetId + '&' + params
      break
  }
  if (url) uni.navigateTo({ url })
}

function goToCourseDetail(course: RecommendCourseVO): void {
  uni.navigateTo({
    url: '/pages/course/detail?cid=' + course.id + '&knowledge=' + encodeURIComponent(course.knowledge),
  })
}

function goBack(): void {
  uni.navigateBack()
}
</script>

<style scoped lang="scss">
.plan-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: $bg-page;
}
.page-header {
  flex-shrink: 0;
  width: 100%;
  padding: 24rpx 32rpx;
  padding-top: calc(24rpx + env(safe-area-inset-top));
  background: $bg-card;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}
.header-left {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12rpx;
}
.back-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.back-icon {
  font-size: 40rpx;
  color: $text-1;
  line-height: 1;
}
.page-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-1;
}

.week-switch {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8rpx;
}
.week-arrow-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: $text-2;
  border-radius: 50%;
  background: $bg-page;
}
.week-arrow-btn.disabled {
  color: #ccc;
  background: #fafafa;
}
.week-tag {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 20rpx;
  background: #f0f9eb;
  border-radius: 24rpx;
}
.week-tag text {
  font-size: 24rpx;
  color: #07c160;
}
.week-arrow {
  font-size: 20rpx;
  margin-left: 2rpx;
}

.page-scroll {
  flex: 1;
  width: 100%;
  height: 0;
  padding: 24rpx;
  box-sizing: border-box;
}

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
.regen-btn {
  padding: 10rpx 20rpx;
  background: #f0f9eb;
  border-radius: 24rpx;
  font-size: 24rpx;
  color: #07c160;
}

.intro-card {
  width: 100%;
  padding: 24rpx;
  background: linear-gradient(135deg, #f0f9eb 0%, #e8f5e9 100%);
  border-radius: 12rpx;
  display: flex;
  flex-direction: row;
  gap: 20rpx;
  margin-bottom: 24rpx;
  box-sizing: border-box;
}
.intro-icon {
  font-size: 40rpx;
  flex-shrink: 0;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 50%;
  color: #07c160;
}
.intro-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.intro-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #2e7d32;
}
.intro-desc {
  font-size: 24rpx;
  color: #558b2f;
  line-height: 1.6;
}

.target-grid {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  margin-bottom: 24rpx;
}
.target-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}
.target-num {
  font-size: 32rpx;
  font-weight: 700;
  color: #07c160;
}
.target-label {
  font-size: 22rpx;
  color: $text-3;
}
.total-progress {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20rpx;
}
.progress-bar {
  flex: 1;
  height: 12rpx;
  background: #f0f0f0;
  border-radius: 6rpx;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #07c160, #67c23a);
  border-radius: 6rpx;
  transition: width 0.3s;
}
.progress-text {
  font-size: 24rpx;
  color: $text-2;
  flex-shrink: 0;
}

.day-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.day-card {
  width: 100%;
  background: #fafbfc;
  border: 1rpx solid $border;
  border-radius: 10rpx;
  padding: 20rpx;
  box-sizing: border-box;
  transition: all 0.3s;
}
.day-card.active {
  background: $bg-card;
  border-color: #07c160;
  box-shadow: 0 4rpx 12rpx rgba(7, 193, 96, 0.1);
}
.day-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16rpx;
}
.day-left {
  width: 80rpx;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}
.day-week {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-1;
}
.day-date {
  font-size: 22rpx;
  color: $text-3;
}
.day-stats {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rpx;
}
.stat-value {
  font-size: 24rpx;
  font-weight: 500;
  color: $text-1;
}
.stat-label {
  font-size: 20rpx;
  color: $text-3;
}
.day-arrow {
  width: 32rpx;
  flex-shrink: 0;
  text-align: center;
  font-size: 24rpx;
  color: $text-3;
}

.day-progress {
  margin-top: 16rpx;
}
.day-progress-bar {
  width: 100%;
  height: 6rpx;
  background: #eee;
  border-radius: 3rpx;
  overflow: hidden;
}
.day-progress-fill {
  height: 100%;
  background: #07c160;
  border-radius: 3rpx;
  transition: width 0.3s;
}

.day-detail {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx dashed #e8e8e8;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.task-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16rpx;
}
.task-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  flex-shrink: 0;
}
.task-dot.learn { background: #409eff; }
.task-dot.practice { background: #ff7d00; }
.task-dot.review { background: #e6a23c; }
.task-dot.summary { background: #67c23a; }
.task-dot.preview { background: #909399; }
.task-dot.done { opacity: 0.5; }
.task-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}
.task-title {
  font-size: 26rpx;
  color: $text-1;
  font-weight: 500;
}
.task-sub {
  font-size: 22rpx;
  color: $text-3;
}
.task-status {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: #07c160;
  color: #fff;
  font-size: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.task-arrow {
  font-size: 28rpx;
  color: #ccc;
  flex-shrink: 0;
}

.course-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.course-card {
  display: flex;
  flex-direction: row;
  gap: 20rpx;
  padding: 16rpx;
  background: #fafbfc;
  border-radius: 10rpx;
  align-items: center;
}
.course-cover {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  padding: 8rpx;
  box-sizing: border-box;
}
.course-tag {
  font-size: 20rpx;
  color: #fff;
  background: rgba(0, 0, 0, 0.3);
  padding: 2rpx 8rpx;
  border-radius: 4rpx;
}
.course-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.course-title {
  font-size: 28rpx;
  font-weight: 500;
  color: $text-1;
}
.course-knowledge {
  font-size: 22rpx;
  color: $text-3;
}
.course-meta {
  display: flex;
  flex-direction: row;
  gap: 20rpx;
}
.course-duration,
.course-count {
  font-size: 22rpx;
  color: $text-2;
}
.course-btn {
  padding: 12rpx 24rpx;
  background: #07c160;
  color: #fff;
  font-size: 24rpx;
  border-radius: 24rpx;
  flex-shrink: 0;
}

.week-picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.week-picker-content {
  width: 100%;
  background: $bg-card;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}
.picker-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid $border;
}
.picker-title {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-1;
}
.picker-close {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: $text-3;
}
.week-list {
  flex: 1;
  padding: 12rpx 0;
}
.week-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #f8f8f8;
}
.week-item.active {
  background: #f0f9eb;
}
.week-name {
  font-size: 28rpx;
  color: $text-1;
}
.week-item.active .week-name {
  color: #07c160;
  font-weight: 500;
}
.week-right {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16rpx;
}
.week-status {
  font-size: 24rpx;
  color: $text-3;
}
.current-tag {
  padding: 4rpx 12rpx;
  background: #07c160;
  color: #fff;
  font-size: 22rpx;
  border-radius: 20rpx;
}

.bottom-space {
  height: 40rpx;
  width: 100%;
}
</style>
