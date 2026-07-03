<template>
  <view class="practice-page">
    <!-- Top navigation -->
    <view class="top-nav">
      <view class="back" @click="goBack">
        <u-icon name="arrow-left" color="#333" size="20"></u-icon>
      </view>
      <view class="nav-center">
        <u-icon name="clock" color="#0195ff" size="22"></u-icon>
        <text class="nav-title">学习记录</text>
      </view>
      <view class="nav-home" @click="goHome">
        <u-icon name="home" color="#ff7847" size="22"></u-icon>
      </view>
    </view>

    <!-- Course tabs (横向滚动) -->
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

    <!-- Big ring progress -->
    <view class="progress-area">
      <ring-progress
        :percent="overviewData.passRate"
        :size="190"
        :stroke-width="14"
        label="通过率"
        :value="`${overviewData.passRate}%`"
        :label-size="14"
        :value-size="32"
      />
    </view>

    <!-- Stats -->
    <view class="stats-row">
      <view class="stat-box">
        <text class="stat-label">总题量：</text>
        <text class="stat-value">{{ overviewData.totalQuestionCount }}道</text>
      </view>
      <view class="stat-box">
        <text class="stat-label">已练习：</text>
        <text class="stat-value">{{ overviewData.practicedCount }}道</text>
      </view>
      <view class="stat-box">
        <text class="stat-label">正确率：</text>
        <text class="stat-value green">{{ overviewData.passRate }}%</text>
      </view>
    </view>

    <!-- Quick actions -->
    <view class="quick-card">
      <view
        v-for="item in quickItems"
        :key="item.key"
        class="quick-item"
        @click="onQuickAction(item.key)"
      >
        <view class="qi-icon" :style="{ background: item.bg }">
          <u-icon :name="item.icon" :color="item.color" size="24"></u-icon>
        </view>
        <text class="qi-name">{{ item.name }}</text>
      </view>
    </view>

    <!-- Chapter practice -->
    <view class="chapter-card">
      <view class="chapter-head">
        <view class="ch-title">
          <u-icon name="edit-pen" color="#ff7847" size="16"></u-icon>
          <text>试题练习</text>
        </view>
        <view class="ch-btns">
          <view class="btn-all" @click="showAll = !showAll">
            {{ showAll ? '收起章节' : '显示所有章节' }}
          </view>
          <view class="btn-go" @click="onContinue">继续练习</view>
        </view>
      </view>

      <view v-if="loading" class="loading-wrap">
        <u-loading-icon mode="circle" size="28"></u-loading-icon>
      </view>

      <view v-else-if="displayChapters.length" class="chapter-list">
        <!-- 按课程分组显示章节（仅在非展开模式下） -->
        <template v-if="currentCourseId === 0 && !showAll">
          <view v-for="course in courseChapterMap" :key="course.courseId" class="course-group">
            <view class="course-group-title">
              <u-icon name="bookmark" color="#0195ff" size="14"></u-icon>
              <text>{{ course.courseName }}</text>
            </view>
            <view
              v-for="ch in course.chapters"
              :key="ch.chapterId"
              class="chapter-row"
              @click="startChapterPractice(course.courseId, ch)"
            >
              <view class="ch-ring">
                <ring-progress
                  :percent="ch.accuracyRate"
                  :size="48"
                  :stroke-width="5"
                  :value="`${ch.accuracyRate}`"
                  :value-size="12"
                  :label-size="0"
                  :rounded="false"
                />
              </view>
              <text class="ch-name">{{ ch.chapterName }}</text>
              <view class="ch-tag">{{ ch.practicedQuestionCount }}/{{ ch.totalQuestionCount }}</view>
            </view>
          </view>
        </template>
        <!-- 展平显示（全部课程展开模式 或 单个课程模式） -->
        <template v-else>
          <view
            v-for="ch in displayChapters"
            :key="ch.chapterId"
            class="chapter-row"
            @click="startChapterPractice(currentCourseId === 0 ? findCourseIdByChapter(ch) : currentCourseId, ch)"
          >
            <view class="ch-ring">
              <ring-progress
                :percent="ch.accuracyRate"
                :size="48"
                :stroke-width="5"
                :value="`${ch.accuracyRate}`"
                :value-size="12"
                :label-size="0"
                :rounded="false"
              />
            </view>
            <text class="ch-name">{{ ch.chapterName }}</text>
            <view class="ch-tag">{{ ch.practicedQuestionCount }}/{{ ch.totalQuestionCount }}</view>
          </view>
        </template>
      </view>

      <u-empty v-else-if="!loading" text="暂无章节数据" mode="list" margin-top="30"></u-empty>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import RingProgress from '../../components/RingProgress.vue'
import { getAllCoursesPracticeOverview, continuePractice } from '../../api/practice'
import type { PracticeOverviewVO, ChapterPracticeProgressVO, CoursePracticeOverviewVO } from '../../types/practice'

interface QuickItem {
  key: string
  name: string
  icon: string
  bg: string
  color: string
}

interface CourseTab {
  courseId: number
  courseName: string
}

interface CourseChapterGroup {
  courseId: number
  courseName: string
  chapters: ChapterPracticeProgressVO[]
}

const quickItems: QuickItem[] = [
  { key: 'wrong', name: '错题回顾', icon: 'file-text', bg: '#fff3ec', color: '#ff7847' },
  { key: 'highFreq', name: '高频错题', icon: 'grid', bg: '#fef0f0', color: '#f56c6c' },
]

const loading = ref(true)
const showAll = ref(false)
const currentCourseId = ref(0) // 0 表示全部课程
const courseTabs = ref<CourseTab[]>([{ courseId: 0, courseName: '全部课程' }])
const allCoursesData = ref<CoursePracticeOverviewVO[]>([])
const overviewData = ref<PracticeOverviewVO>({
  totalQuestionCount: 0,
  practicedCount: 0,
  totalAttempts: 0,
  passRate: 0,
  chapterProgressList: [],
})
const courseChapterMap = ref<CourseChapterGroup[]>([])

// 当前选中课程的章节列表
const displayChapters = computed(() => {
  if (currentCourseId.value === 0) {
    // 全部课程：展平所有章节（支持showAll展开子章节）
    const flat: ChapterPracticeProgressVO[] = []
    courseChapterMap.value.forEach(course => {
      course.chapters.forEach(ch => {
        flat.push(ch)
        if (showAll.value && ch.children?.length) {
          flat.push(...ch.children)
        }
      })
    })
    return flat
  }
  // 单个课程：直接返回该课程的章节
  const course = courseChapterMap.value.find(c => c.courseId === currentCourseId.value)
  if (!course) return []
  if (showAll.value) {
    const flat: ChapterPracticeProgressVO[] = []
    course.chapters.forEach(ch => {
      flat.push(ch)
      if (ch.children?.length) flat.push(...ch.children)
    })
    return flat
  }
  return course.chapters
})

onLoad(() => {
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    allCoursesData.value = await getAllCoursesPracticeOverview()
  } catch {
    // Mock数据兜底
    allCoursesData.value = getMockAllCoursesData()
  } finally {
    loading.value = false
  }
  applyCoursesData()
}

/** 应用课程数据到UI状态 */
function applyCoursesData() {
  // 构建Tab列表
  courseTabs.value = [
    { courseId: 0, courseName: '全部课程' },
    ...allCoursesData.value.map(item => ({ courseId: item.courseId, courseName: item.courseName }))
  ]

  // 构建章节分组
  courseChapterMap.value = allCoursesData.value.map(item => ({
    courseId: item.courseId,
    courseName: item.courseName,
    chapters: item.overview.chapterProgressList || []
  }))

  // 计算全部课程的汇总概览
  updateOverviewData()
}

function updateOverviewData() {
  if (currentCourseId.value === 0) {
    // 全部课程：汇总数据（按总答题次数加权计算通过率）
    let totalQuestionCount = 0
    let practicedCount = 0
    let totalAttempts = 0
    let correctCount = 0
    for (const course of allCoursesData.value) {
      totalQuestionCount += course.overview.totalQuestionCount
      practicedCount += course.overview.practicedCount
      totalAttempts += course.overview.totalAttempts || course.overview.practicedCount
      correctCount += Math.round((course.overview.totalAttempts || course.overview.practicedCount) * course.overview.passRate / 100)
    }
    overviewData.value = {
      totalQuestionCount,
      practicedCount,
      totalAttempts,
      passRate: totalAttempts > 0 ? Math.round(correctCount / totalAttempts * 100) : 0,
      chapterProgressList: courseChapterMap.value.flatMap(c => c.chapters)
    }
  } else {
    // 单个课程：直接使用该课程数据
    const courseData = allCoursesData.value.find(c => c.courseId === currentCourseId.value)
    if (courseData) {
      overviewData.value = courseData.overview
    }
  }
}

function switchCourse(courseId: number) {
  currentCourseId.value = courseId
  showAll.value = false
  updateOverviewData()
}

function getMockAllCoursesData(): CoursePracticeOverviewVO[] {
  return [
    {
      courseId: 1,
      courseName: '数学基础',
      overview: {
        totalQuestionCount: 120,
        practicedCount: 45,
        passRate: 57,
        chapterProgressList: [
          { chapterId: 1, chapterName: '几何图形', practicedQuestionCount: 15, totalQuestionCount: 20, accuracyRate: 67 },
          { chapterId: 2, chapterName: '正数和负数', practicedQuestionCount: 12, totalQuestionCount: 18, accuracyRate: 58 },
        ]
      }
    },
    {
      courseId: 2,
      courseName: '语文阅读',
      overview: {
        totalQuestionCount: 80,
        practicedCount: 30,
        passRate: 65,
        chapterProgressList: [
          { chapterId: 3, chapterName: '古诗词鉴赏', practicedQuestionCount: 20, totalQuestionCount: 30, accuracyRate: 70 },
          { chapterId: 4, chapterName: '现代文阅读', practicedQuestionCount: 10, totalQuestionCount: 25, accuracyRate: 55 },
        ]
      }
    }
  ]
}

function goBack() {
  uni.navigateBack().catch(() => uni.reLaunch({ url: '/pages/mine/mine' }))
}

function goHome() {
  uni.reLaunch({ url: '/pages/index/index' })
}

/** 根据章节查找对应的课程ID */
function findCourseIdByChapter(ch: ChapterPracticeProgressVO): number {
  for (const course of courseChapterMap.value) {
    if (course.chapters.some(c => c.chapterId === ch.chapterId)) {
      return course.courseId
    }
  }
  return 0
}

function startChapterPractice(courseId: number, ch: ChapterPracticeProgressVO) {
  uni.navigateTo({
    url: `/pages/practice/question?courseId=${courseId}&chapterId=${ch.chapterId}`,
  }).catch(() => {})
}

async function onContinue() {
  if (currentCourseId.value === 0 && courseChapterMap.value.length > 0) {
    // 全部课程：选择第一个有章节的课程
    const firstCourseWithChapters = courseChapterMap.value.find(c => c.chapters.length > 0)
    if (firstCourseWithChapters) {
      startChapterPractice(firstCourseWithChapters.courseId, firstCourseWithChapters.chapters[0])
    } else {
      uni.showToast({ title: '暂无练习记录', icon: 'none' })
    }
    return
  }
  if (currentCourseId.value > 0) {
    try {
      const session = await continuePractice({ courseId: currentCourseId.value, practiceMode: 1 })
      const params = { courseId: currentCourseId.value, chapterId: session.chapterId, questionId: session.questionId, practiceMode: session.practiceMode }
      const qs = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&')
      uni.navigateTo({ url: `/pages/practice/question?${qs}` }).catch(() => {})
    } catch {
      if (displayChapters.value.length > 0) {
        startChapterPractice(currentCourseId.value, displayChapters.value[0])
      } else {
        uni.showToast({ title: '暂无练习记录', icon: 'none' })
      }
    }
  }
}

function onQuickAction(key: string) {
  if (currentCourseId.value === 0) {
    uni.showToast({ title: '请先选择课程', icon: 'none' })
    return
  }
  const map: Record<string, string> = {
    wrong: '/pages/practice/wrong',
    highFreq: '/pages/practice/high-freq-wrong',
  }
  const path = map[key]
  if (path) uni.navigateTo({ url: `${path}?courseId=${currentCourseId.value}` }).catch(() => {})
}
</script>

<style scoped lang="scss">
.practice-page {
  min-height: 100vh;
  background: $bg-page;
  padding-bottom: 24px;
}

/* Top nav */
.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: $bg-card;
}
.back, .nav-home, .nav-center {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav-center {
  flex: 1;
  gap: 6px;
}
.nav-title {
  font-size: 16px;
  font-weight: 600;
  color: $text-1;
}

/* Course tabs */
.course-tabs {
  background: $bg-card;
  white-space: nowrap;
  border-bottom: 1px solid $border;
}
.tabs-inner {
  display: inline-flex;
  padding: 10px 14px;
  gap: 12px;
}
.tab-item {
  padding: 6px 16px;
  border-radius: 16px;
  background: #f5f7fa;
  flex-shrink: 0;
}
.tab-item.active {
  background: $primary;
}
.tab-text {
  font-size: 13px;
  color: $text-2;
}
.tab-item.active .tab-text {
  color: #fff;
}

/* Progress */
.progress-area {
  background: $bg-card;
  display: flex;
  justify-content: center;
  padding: 10px 0 24px;
}

/* Stats */
.stats-row {
  background: $bg-card;
  display: flex;
  justify-content: space-around;
  padding: 0 20px 20px;
}
.stat-box {
  text-align: left;
}
.stat-label {
  font-size: 14px;
  color: $text-1;
}
.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: $text-1;
}
.stat-value.green {
  color: #10b981;
}

/* Quick card */
.quick-card {
  background: $bg-card;
  margin: 12px 14px 0;
  border-radius: $radius-card;
  padding: 18px 8px;
  display: flex;
  justify-content: space-around;
  box-shadow: $shadow-card;
}
.quick-item {
  text-align: center;
}
.qi-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  margin: 0 auto 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qi-name {
  font-size: 12px;
  color: $text-2;
}

/* Chapter card */
.chapter-card {
  background: $bg-card;
  margin: 12px 14px 0;
  border-radius: $radius-card;
  padding: 16px;
  box-shadow: $shadow-card;
}
.chapter-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.ch-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 700;
  color: $text-1;
}
.ch-btns {
  display: flex;
  gap: 8px;
}
.btn-all {
  font-size: 12px;
  color: #fff;
  background: $primary;
  padding: 6px 12px;
  border-radius: 16px;
}
.btn-go {
  font-size: 12px;
  color: #fff;
  background: #67c23a;
  padding: 6px 12px;
  border-radius: 16px;
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 30px 0;
}

.chapter-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* 课程分组 */
.course-group {
  margin-bottom: 8px;
}
.course-group-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: $primary;
  padding-bottom: 8px;
  border-bottom: 1px solid $border;
  margin-bottom: 10px;
}

.chapter-row {
  display: flex;
  align-items: center;
  padding: 4px 0;
}
.ch-ring {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}
.ch-name {
  flex: 1;
  margin-left: 12px;
  font-size: 14px;
  color: $text-1;
}
.ch-tag {
  font-size: 12px;
  color: $primary;
  border: 1px solid $primary;
  padding: 2px 8px;
  border-radius: 8px;
}
</style>
