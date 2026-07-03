<template>
  <view class="practice-page">
    <!-- Top navigation -->
    <view class="top-nav">
      <view class="back" @click="goBack">
        <u-icon name="arrow-left" color="#333" size="20"></u-icon>
      </view>
      <view class="nav-center">
        <u-icon name="file-text" color="#0195ff" size="22"></u-icon>
      </view>
      <view class="nav-home" @click="goHome">
        <u-icon name="home" color="#ff7847" size="22"></u-icon>
      </view>
    </view>

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

      <view v-else-if="chapterList.length" class="chapter-list">
        <view
          v-for="ch in displayChapters"
          :key="ch.chapterId"
          class="chapter-row"
          @click="startChapterPractice(ch)"
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

      <u-empty v-else-if="!loading" text="暂无章节数据" mode="list" margin-top="30"></u-empty>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import RingProgress from '../../components/RingProgress.vue'
import { getPracticeOverview, continuePractice } from '../../api/practice'
import type { PracticeOverviewVO, ChapterPracticeProgressVO } from '../../types/practice'

interface QuickItem {
  key: string
  name: string
  icon: string
  bg: string
  color: string
}

const quickItems: QuickItem[] = [
  { key: 'wrong',    name: '错题回顾', icon: 'file-text',  bg: '#fff3ec', color: '#ff7847' },
  { key: 'highFreq', name: '高频错题', icon: 'grid',       bg: '#fef0f0', color: '#f56c6c' },
]

const courseId = ref(0)
const loading = ref(true)
const showAll = ref(false)
const overviewData = ref<PracticeOverviewVO>({
  totalQuestionCount: 0,
  practicedCount: 0,
  passRate: 0,
  chapterProgressList: [],
})
const chapterList = ref<ChapterPracticeProgressVO[]>([])

const displayChapters = computed(() => {
  if (showAll.value) {
    const flat: ChapterPracticeProgressVO[] = []
    chapterList.value.forEach(ch => {
      flat.push(ch)
      if (ch.children?.length) flat.push(...ch.children)
    })
    return flat
  }
  return chapterList.value
})

onLoad((query: any) => {
  courseId.value = Number(query.courseId) || 0
  if (courseId.value) loadData()
  else {
    loading.value = false
    overviewData.value = getMockOverview()
    chapterList.value = overviewData.value.chapterProgressList || []
  }
})

async function loadData() {
  loading.value = true
  try {
    const data = await getPracticeOverview(courseId.value)
    overviewData.value = data
    chapterList.value = data.chapterProgressList || []
    if (!data.chapterProgressList || data.chapterProgressList.length === 0) {
      overviewData.value = getMockOverview()
      chapterList.value = overviewData.value.chapterProgressList || []
    }
  } catch {
    overviewData.value = getMockOverview()
    chapterList.value = overviewData.value.chapterProgressList || []
  } finally {
    loading.value = false
  }
}

function getMockOverview(): PracticeOverviewVO {
  return {
    totalQuestionCount: 120,
    practicedCount: 45,
    passRate: 57,
    chapterProgressList: [
      { chapterId: 1, chapterName: '几何图形', practicedQuestionCount: 15, totalQuestionCount: 20, accuracyRate: 67 },
      { chapterId: 2, chapterName: '正数和负数', practicedQuestionCount: 12, totalQuestionCount: 18, accuracyRate: 58 },
      { chapterId: 3, chapterName: '有理数的加减法', practicedQuestionCount: 10, totalQuestionCount: 25, accuracyRate: 45 },
      { chapterId: 4, chapterName: '整式的加减', practicedQuestionCount: 8, totalQuestionCount: 22, accuracyRate: 50 },
      { chapterId: 5, chapterName: '一元一次方程', practicedQuestionCount: 0, totalQuestionCount: 15, accuracyRate: 0 },
      { chapterId: 6, chapterName: '二元一次方程组', practicedQuestionCount: 0, totalQuestionCount: 20, accuracyRate: 0 },
    ],
  }
}

function goBack() {
  uni.navigateBack().catch(() => uni.reLaunch({ url: '/pages/course/course' }))
}
function goHome() {
  uni.reLaunch({ url: '/pages/index/index' })
}

function startChapterPractice(ch: ChapterPracticeProgressVO) {
  uni.navigateTo({
    url: `/pages/practice/question?courseId=${courseId.value}&chapterId=${ch.chapterId}`,
  }).catch(() => {})
}

async function onContinue() {
  if (!courseId.value) return
  try {
    const session = await continuePractice({ courseId: courseId.value, practiceMode: 1 })
    const params = { courseId: courseId.value, chapterId: session.chapterId, questionId: session.questionId, practiceMode: session.practiceMode }
    const qs = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&')
    uni.navigateTo({ url: `/pages/practice/question?${qs}` }).catch(() => {})
  } catch {
    if (chapterList.value.length > 0) {
      startChapterPractice(chapterList.value[0])
    } else {
      uni.showToast({ title: '暂无练习记录', icon: 'none' })
    }
  }
}

function onQuickAction(key: string) {
  const map: Record<string, string> = {
    wrong: '/pages/practice/wrong',
    favorite: '/pages/practice/favorite',
    note: '/pages/practice/note',
    highFreq: '/pages/practice/high-freq-wrong',
  }
  const path = map[key]
  if (path) uni.navigateTo({ url: `${path}?courseId=${courseId.value}` }).catch(() => {})
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
