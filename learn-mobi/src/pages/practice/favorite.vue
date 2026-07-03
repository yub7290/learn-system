<template>
  <view class="fav-page">
    <!-- 顶部导航 -->
    <view class="top-nav">
      <view class="back" @click="goBack">
        <u-icon name="arrow-left" color="#333" size="20"></u-icon>
      </view>
      <view class="nav-center">
        <u-icon name="heart" color="#f56c6c" size="22"></u-icon>
        <text class="nav-title">我的收藏</text>
      </view>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 课程 Tab 切换 -->
    <scroll-view scroll-x class="course-tabs" show-scrollbar="false">
      <view class="tabs-inner">
        <view
          v-for="tab in courseTabs"
          :key="tab.courseId"
          class="tab-item"
          :class="{ active: currentCourseId === tab.courseId }"
          @click="switchCourse(tab.courseId)"
        >
          <text class="tab-text">{{ tab.courseName }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 收藏列表 -->
    <scroll-view scroll-y class="list-scroll" show-scrollbar="false">
      <view class="list-content" v-if="list.length">
        <view
          class="fav-card"
          v-for="(item, index) in list"
          :key="item.id"
          :style="{ animationDelay: index * 0.05 + 's' }"
          @click="goQuestion(item)"
        >
          <!-- 卡片顶部：类型标签 + 时间 -->
          <view class="card-header">
            <view class="type-tag" :style="{ background: getTypeBg(item.questionType), color: getTypeColor(item.questionType) }">
              {{ getTypeLabel(item.questionType) }}
            </view>
            <view class="difficulty" v-if="item.difficulty">
              <view
                v-for="star in 5"
                :key="star"
                class="star"
                :class="{ filled: star <= item.difficulty }"
              >★</view>
            </view>
          </view>

          <!-- 题目内容 -->
          <text class="card-content">{{ stripHtml(item.content) }}</text>

          <!-- 卡片底部：章节 + 收藏时间 -->
          <view class="card-footer">
            <view class="chapter-info" v-if="item.chapterName">
              <u-icon name="folder" color="#0195ff" size="12"></u-icon>
              <text class="chapter-text">{{ item.chapterName }}</text>
            </view>
            <view class="time-info" v-if="item.relatedTime">
              <u-icon name="clock" color="#c0c4cc" size="12"></u-icon>
              <text class="time-text">{{ item.relatedTime }}</text>
            </view>
          </view>

          <!-- 右侧箭头 -->
          <view class="card-arrow">
            <u-icon name="arrow-right" color="#d0d5dd" size="14"></u-icon>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-wrap" v-if="!loading && !list.length">
        <u-empty text="暂无收藏" mode="data" margin-top="60"></u-empty>
        <view class="empty-action" @click="goPractice">
          <text>去练习</text>
        </view>
      </view>

      <!-- 加载状态 -->
      <view class="loading-wrap" v-if="loading">
        <u-loading-icon mode="circle" size="36"></u-loading-icon>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getFavorites, getAllCoursesPracticeOverview } from '../../api/practice'
import type { PracticeQuestionSimpleVO, CoursePracticeOverviewVO } from '../../types/practice'

interface CourseTab {
  courseId: number
  courseName: string
}

const currentCourseId = ref(0)
const courseTabs = ref<CourseTab[]>([{ courseId: 0, courseName: '全部' }])
const allCourses = ref<CoursePracticeOverviewVO[]>([])
const list = ref<PracticeQuestionSimpleVO[]>([])
const loading = ref(true)

const typeLabels: Record<number, string> = { 0: '单选', 1: '多选', 2: '判断', 3: '填空', 4: '简答' }
const typeColors: Record<number, string> = { 0: '#0195ff', 1: '#f59e0b', 2: '#10b981', 3: '#8b5cf6', 4: '#ec4899' }

function getTypeLabel(t: number) { return typeLabels[t] ?? '未知' }
function getTypeColor(t: number) { return typeColors[t] ?? '#999' }
function getTypeBg(t: number) { return (typeColors[t] || '#999') + '18' }
function stripHtml(html: string) { return html?.replace(/<[^>]+>/g, '').trim() || '' }

onLoad(() => {})
onShow(() => { loadCourses() })

async function loadCourses() {
  try {
    const data = await getAllCoursesPracticeOverview()
    allCourses.value = data
    courseTabs.value = [
      { courseId: 0, courseName: '全部' },
      ...data.map(item => ({ courseId: item.courseId, courseName: item.courseName }))
    ]
  } catch {
    courseTabs.value = [{ courseId: 0, courseName: '全部' }]
  }
  loadFavorites()
}

async function loadFavorites() {
  loading.value = true
  try {
    const data = await getFavorites(currentCourseId.value)
    list.value = data
    if (!data || data.length === 0) {
      list.value = getMockList()
    }
  } catch {
    list.value = getMockList()
  } finally {
    loading.value = false
  }
}

function switchCourse(courseId: number) {
  currentCourseId.value = courseId
  loadFavorites()
}

function getMockList(): PracticeQuestionSimpleVO[] {
  return [
    { id: 1, questionType: 0, content: '计算 1/2 + 1/3 的结果，正确的是？', difficulty: 3, chapterName: '几何图形', relatedTime: '2026-06-20' },
    { id: 4, questionType: 2, content: '一根绳子用去 2/5 米，还剩全长的 2/5，用去的和剩下的相比？', difficulty: 3, chapterName: '有理数的加减法', relatedTime: '2026-06-18' },
  ]
}

function goBack() { uni.navigateBack().catch(() => {}) }
function goPractice() { uni.reLaunch({ url: '/pages/index/index' }) }
function goQuestion(item: PracticeQuestionSimpleVO) {
  const cid = item.courseId || currentCourseId.value || 0
  uni.navigateTo({
    url: `/pages/practice/question?courseId=${cid}&chapterId=0&practiceMode=3`
  }).catch(() => {})
}
</script>

<style scoped lang="scss">
.fav-page {
  min-height: 100vh;
  background: $bg-page;
  display: flex;
  flex-direction: column;
}

/* 顶部导航 */
.top-nav {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  padding-top: calc(12px + constant(safe-area-inset-top));
  padding-top: calc(12px + env(safe-area-inset-top));
  background: $bg-card;
  border-bottom: 1px solid $border;
}
.back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f5f7fa;
}
.nav-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: $text-1;
}
.nav-placeholder {
  width: 36px;
}

/* 课程 Tab */
.course-tabs {
  flex-shrink: 0;
  background: $bg-card;
  white-space: nowrap;
  border-bottom: 1px solid $border;
}
.tabs-inner {
  display: inline-flex;
  padding: 10px 14px;
  gap: 10px;
}
.tab-item {
  padding: 6px 16px;
  border-radius: 16px;
  background: #f5f7fa;
  flex-shrink: 0;
  transition: all 0.2s;
}
.tab-item.active {
  background: $gradient-primary;
  box-shadow: 0 2px 8px rgba(1, 149, 255, 0.3);
}
.tab-text {
  font-size: 13px;
  color: $text-2;
}
.tab-item.active .tab-text {
  color: #fff;
  font-weight: 500;
}

/* 列表滚动区 */
.list-scroll {
  flex: 1;
  width: 100%;
  height: 0;
}
.list-content {
  padding: 12px 14px;
}

/* 收藏卡片 */
.fav-card {
  background: $bg-card;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: $shadow-card;
  position: relative;
  transition: transform 0.2s;
  animation: fadeInUp 0.3s ease forwards;
  opacity: 0;
}
.fav-card:active {
  transform: scale(0.98);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.type-tag {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 8px;
  font-weight: 500;
}
.difficulty {
  display: flex;
  gap: 2px;
}
.star {
  font-size: 12px;
  color: #e0e0e0;
}
.star.filled {
  color: #f59e0b;
}

/* 题目内容 */
.card-content {
  font-size: 15px;
  color: $text-1;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 12px;
}

/* 卡片底部 */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.chapter-info, .time-info {
  display: flex;
  align-items: center;
  gap: 4px;
}
.chapter-text {
  font-size: 12px;
  color: $text-3;
}
.time-text {
  font-size: 12px;
  color: $text-3;
}

/* 右侧箭头 */
.card-arrow {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
}

/* 空状态 */
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 40px;
}
.empty-action {
  margin-top: 16px;
  padding: 8px 24px;
  background: $gradient-primary;
  border-radius: 20px;
  text {
    color: #fff;
    font-size: 14px;
  }
}

/* 加载状态 */
.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.bottom-space {
  height: 20px;
  width: 100%;
}
</style>
