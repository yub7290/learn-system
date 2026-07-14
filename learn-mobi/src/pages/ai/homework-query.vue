<template>
  <view class="query-page">
    <!-- 顶部导航 -->
    <view class="top-nav">
      <view class="back" @click="goBack">
        <u-icon name="arrow-left" color="#333" size="20"></u-icon>
      </view>
      <view class="nav-center">
        <u-icon name="search" color="#0195ff" size="20"></u-icon>
        <text class="nav-title">批改记录查询</text>
      </view>
      <view class="nav-reset" @click="resetFilter" v-if="hasFilter">
        <text>重置</text>
      </view>
      <view class="nav-placeholder" v-else></view>
    </view>

    <!-- 筛选区（吸顶） -->
    <view class="filter-bar">
      <!-- 课程选择 -->
      <view class="course-picker" @click="showCourse = true">
        <u-icon name="bookmark" color="#0195ff" size="15"></u-icon>
        <text class="course-picker-text">{{ selectedCourseName }}</text>
        <u-icon name="arrow-down" color="#999" size="13"></u-icon>
      </view>

      <!-- 状态筛选 -->
      <scroll-view scroll-x class="status-scroll" show-scrollbar="false">
        <view class="status-chips">
          <view
            class="status-chip"
            v-for="s in statusOptions"
            :key="s.value"
            :class="{ active: statusFilter === s.value }"
            @click="onStatusChange(s.value)"
          >
            <text>{{ s.label }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 汇总统计 -->
    <view class="stat-strip" v-if="!loading && list.length">
      <view class="stat-card">
        <text class="stat-num">{{ list.length }}</text>
        <text class="stat-label">记录数</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-card">
        <text class="stat-num">{{ avgScore }}</text>
        <text class="stat-label">平均分</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-card">
        <text class="stat-num">{{ doneRate }}<text class="stat-unit">%</text></text>
        <text class="stat-label">完成率</text>
      </view>
    </view>

    <!-- 列表 -->
    <scroll-view
      scroll-y
      class="list-scroll"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
      show-scrollbar="false"
    >
      <view class="list-content" v-if="list.length">
        <view
          class="hw-card"
          v-for="(item, index) in list"
          :key="item.id"
          :style="{ animationDelay: index * 0.05 + 's' }"
          @click="goDetail(item)"
        >
          <view class="card-header">
            <text class="course-name">{{ item.courseName }}</text>
            <view class="status-badge" :class="statusClass(item.status)">{{ statusText(item.status) }}</view>
          </view>
          <view class="card-body">
            <view class="score-area">
              <text class="score-value">{{ item.score }}</text>
              <text class="score-label">分</text>
            </view>
            <view class="stat-area">
              <text class="stat-text">正确 {{ item.correctCount }}/{{ item.totalQuestions }} 题</text>
              <view class="rate-bar">
                <view class="rate-fill" :style="{ width: correctRate(item) + '%' }"></view>
              </view>
            </view>
          </view>
          <view class="card-footer">
            <u-icon name="clock" color="#c0c4cc" size="12"></u-icon>
            <text class="time-text">{{ item.createTime }}</text>
          </view>
          <view class="card-arrow">
            <u-icon name="arrow-right" color="#d0d5dd" size="14"></u-icon>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-wrap" v-if="!loading && !list.length">
        <u-empty text="没有符合条件的批改记录" mode="data" margin-top="60"></u-empty>
      </view>

      <!-- 加载状态 -->
      <view class="loading-wrap" v-if="loading">
        <u-loading-icon mode="circle" size="36"></u-loading-icon>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 课程选择弹层 -->
    <view class="sheet-mask" v-if="showCourse" @click="showCourse = false">
      <view class="sheet-panel" @click.stop>
        <view class="sheet-header">
          <text class="sheet-title">选择课程</text>
          <view class="sheet-close" @click="showCourse = false">
            <u-icon name="close" color="#999" size="16"></u-icon>
          </view>
        </view>
        <scroll-view scroll-y class="sheet-scroll">
          <view
            class="sheet-item"
            v-for="c in courseOptions"
            :key="c.id ?? 'all'"
            :class="{ active: selectedCourseId === c.id }"
            @click="onCoursePick(c)"
          >
            <text class="sheet-item-text">{{ c.name }}</text>
            <u-icon v-if="selectedCourseId === c.id" name="checkmark" color="#0195ff" size="16"></u-icon>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 详情弹窗 -->
    <view class="detail-mask" v-if="showDetail" @click="showDetail = false">
      <view class="detail-panel" @click.stop>
        <view class="detail-header">
          <text class="detail-title">批改详情</text>
          <view class="detail-close" @click="showDetail = false">
            <u-icon name="close" color="#999" size="16"></u-icon>
          </view>
        </view>
        <scroll-view scroll-y class="detail-scroll">
          <view v-if="detailData" class="detail-body">
            <view class="detail-summary">
              <text class="ds-label">课程：{{ detailData.courseName }}</text>
              <text class="ds-label">得分：{{ detailData.score }} 分（正确 {{ detailData.correctCount }}/{{ detailData.totalQuestions }}）</text>
            </view>
            <view class="question-item" v-for="q in detailData.questions" :key="q.id">
              <view class="qi-header">
                <text class="qi-no">第 {{ q.questionNo }} 题</text>
                <view class="qi-result" :class="q.isCorrect === 1 ? 'correct' : q.isCorrect === 0 ? 'wrong' : 'unknown'">
                  {{ q.isCorrect === 1 ? '正确' : q.isCorrect === 0 ? '错误' : '待判' }}
                </view>
              </view>
              <text class="qi-content">{{ q.questionContent }}</text>
              <view class="qi-answers">
                <text class="qi-answer" v-if="q.studentAnswer">我的答案：{{ q.studentAnswer }}</text>
                <text class="qi-answer correct-answer" v-if="q.displayAnswer || q.correctAnswer">正确答案：{{ q.displayAnswer || q.correctAnswer }}</text>
              </view>
              <view class="qi-analysis" v-if="q.displayAnalysis || q.analysis">
                <text class="qa-label">解析：</text>
                <text class="qa-text">{{ q.displayAnalysis || q.analysis }}</text>
              </view>
            </view>
            <u-empty v-if="!detailData.questions?.length" text="暂无题目详情" mode="data" margin-top="20"></u-empty>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getHomeworkList, getHomeworkDetail } from '../../api/ai'
import { getMyCourseList } from '../../api/mine'
import type { HomeworkPageVO, HomeworkCorrectionVO } from '../../types/ai'

const rawList = ref<HomeworkPageVO[]>([])
const loading = ref(false)
const isRefreshing = ref(false)
const selectedCourseId = ref<number | undefined>(undefined)
const statusFilter = ref<number>(-1)
const showCourse = ref(false)
const showDetail = ref(false)
const detailData = ref<HomeworkCorrectionVO | null>(null)

interface CourseOpt { id: number; name: string }
const courseOptions = ref<CourseOpt[]>([])
const selectedCourseName = computed(() => {
  const hit = courseOptions.value.find((c) => c.id === selectedCourseId.value)
  return hit ? hit.name : '请选择课程'
})

const statusOptions = [
  { value: -1, label: '全部' },
  { value: 0, label: '待批改' },
  { value: 1, label: '批改中' },
  { value: 2, label: '已完成' },
  { value: 3, label: '批改失败' },
]

const hasFilter = computed(() => selectedCourseId.value !== undefined || statusFilter.value !== -1)

const list = computed(() => {
  if (statusFilter.value === -1) return rawList.value
  return rawList.value.filter((i) => i.status === statusFilter.value)
})

const avgScore = computed(() => {
  const arr = list.value.filter((i) => typeof i.score === 'number' && i.score > 0)
  if (!arr.length) return 0
  const sum = arr.reduce((a, b) => a + (b.score || 0), 0)
  return Math.round(sum / arr.length)
})

const doneRate = computed(() => {
  if (!list.value.length) return 0
  const done = list.value.filter((i) => i.status === 2).length
  return Math.round((done / list.value.length) * 100)
})

onLoad(async () => {
  await loadCourses()
  await loadList()
})

async function loadCourses() {
  try {
    const res = await getMyCourseList({ page: 1, pageSize: 200 })
    const mine = (res.list || []).map((c: any) => ({ id: c.id, name: c.name })) as CourseOpt[]
    courseOptions.value = mine
    if (selectedCourseId.value === undefined && mine.length) {
      selectedCourseId.value = mine[0].id
    }
  } catch {
    /* 保留默认空列表 */
  }
}

async function loadList() {
  if (loading.value && !isRefreshing.value) return
  if (selectedCourseId.value === undefined) {
    rawList.value = []
    loading.value = false
    isRefreshing.value = false
    return
  }
  loading.value = true
  try {
    const data = await getHomeworkList(selectedCourseId.value, 1, 200)
    rawList.value = data.records || []
  } catch {
    // 接口异常时保持空列表，由空状态组件提示
  } finally {
    loading.value = false
    isRefreshing.value = false
  }
}

function onRefresh() {
  isRefreshing.value = true
  loadList()
}

function onStatusChange(v: number) {
  statusFilter.value = v
}

function onCoursePick(c: CourseOpt) {
  selectedCourseId.value = c.id
  showCourse.value = false
  loadList()
}

function resetFilter() {
  selectedCourseId.value = courseOptions.value[0]?.id
  statusFilter.value = -1
  loadList()
}

function correctRate(item: HomeworkPageVO) {
  if (!item.totalQuestions) return 0
  return Math.round((item.correctCount / item.totalQuestions) * 100)
}

function statusText(s: number) {
  const map: Record<number, string> = { 0: '待批改', 1: '批改中', 2: '已完成', 3: '批改失败' }
  return map[s] ?? '未知'
}

function statusClass(s: number) {
  const map: Record<number, string> = { 0: 'pending', 1: 'processing', 2: 'done', 3: 'failed' }
  return map[s] ?? ''
}

async function goDetail(item: HomeworkPageVO) {
  showDetail.value = true
  detailData.value = null
  try {
    detailData.value = await getHomeworkDetail(item.id)
  } catch {
    uni.showToast({ title: '加载详情失败', icon: 'none' })
    showDetail.value = false
  }
}

function goBack() { uni.navigateBack().catch(() => uni.reLaunch({ url: '/pages/index/index' })) }
</script>

<style scoped lang="scss">
.query-page {
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
.nav-reset {
  width: 44px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 13px;
  color: $primary;
}
.nav-placeholder {
  width: 44px;
}

/* 筛选区 */
.filter-bar {
  flex-shrink: 0;
  background: $bg-card;
  padding: 12px 14px 10px;
  border-bottom: 1px solid $border;
  position: sticky;
  top: 0;
  z-index: 10;
}
.course-picker {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: $primary-bg;
  border-radius: $radius-btn;
  margin-bottom: 10px;
}
.course-picker-text {
  font-size: 14px;
  font-weight: 600;
  color: $primary;
  max-width: 180px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.status-scroll {
  width: 100%;
  white-space: nowrap;
}
.status-chips {
  display: inline-flex;
  gap: 8px;
  padding-bottom: 2px;
}
.status-chip {
  flex-shrink: 0;
  padding: 6px 16px;
  border-radius: 16px;
  background: #f5f7fa;
  font-size: 13px;
  color: $text-2;
  transition: all 0.2s ease;
}
.status-chip.active {
  background: $gradient-primary;
  color: #fff;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(1, 149, 255, 0.25);
}

/* 汇总统计 */
.stat-strip {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  margin: 12px 14px 0;
  padding: 16px 8px;
  background: $bg-card;
  border-radius: $radius-card;
  box-shadow: $shadow-card;
}
.stat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.stat-num {
  font-size: 22px;
  font-weight: 700;
  color: $primary;
  font-family: DINAlternate, 'Helvetica Neue', Arial, sans-serif;
}
.stat-unit {
  font-size: 13px;
  font-weight: 600;
}
.stat-label {
  font-size: 12px;
  color: $text-3;
}
.stat-divider {
  width: 1px;
  height: 28px;
  background: $border;
}

/* 列表 */
.list-scroll {
  flex: 1;
  width: 100%;
  height: 0;
}
.list-content {
  padding: 12px 14px;
}

/* 批改卡片 */
.hw-card {
  background: $bg-card;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: $shadow-card;
  position: relative;
  animation: fadeInUp 0.3s ease forwards;
  opacity: 0;
}
.hw-card:active {
  transform: scale(0.98);
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.course-name {
  font-size: 15px;
  font-weight: 600;
  color: $text-1;
}
.status-badge {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 8px;
  font-weight: 500;
}
.status-badge.pending { background: #fef3c7; color: #d97706; }
.status-badge.processing { background: #dbeafe; color: #2563eb; }
.status-badge.done { background: #d1fae5; color: #059669; }
.status-badge.failed { background: #fee2e2; color: #dc2626; }

.card-body {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 12px;
}
.score-area {
  display: flex;
  align-items: baseline;
  gap: 2px;
}
.score-value {
  font-size: 28px;
  font-weight: 700;
  color: $primary;
}
.score-label {
  font-size: 13px;
  color: $text-3;
}
.stat-area {
  flex: 1;
}
.stat-text {
  display: block;
  font-size: 13px;
  color: $text-2;
  margin-bottom: 6px;
}
.rate-bar {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #eef2f7;
  overflow: hidden;
}
.rate-fill {
  height: 100%;
  border-radius: 3px;
  background: $gradient-primary;
  transition: width 0.4s ease;
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 4px;
}
.time-text {
  font-size: 12px;
  color: $text-3;
}
.card-arrow {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
}

/* 空 / 加载 */
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 40px;
}
.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}
.bottom-space { height: 20px; }

/* 课程选择弹层 */
.sheet-mask {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9998;
  display: flex;
  align-items: flex-end;
}
.sheet-panel {
  width: 100%;
  max-height: 60vh;
  background: $bg-card;
  border-radius: 16px 16px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid $border;
}
.sheet-title {
  font-size: 16px;
  font-weight: 600;
  color: $text-1;
}
.sheet-close {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
}
.sheet-scroll {
  flex: 1;
  max-height: calc(60vh - 60px);
}
.sheet-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid $border;
}
.sheet-item.active .sheet-item-text {
  color: $primary;
  font-weight: 600;
}
.sheet-item-text {
  font-size: 14px;
  color: $text-1;
}

/* 详情弹窗 */
.detail-mask {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
}
.detail-panel {
  width: 100%;
  max-height: 80vh;
  background: $bg-card;
  border-radius: 16px 16px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid $border;
}
.detail-title {
  font-size: 16px;
  font-weight: 600;
  color: $text-1;
}
.detail-close {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
}
.detail-scroll {
  flex: 1;
  max-height: calc(80vh - 60px);
}
.detail-body {
  padding: 16px;
}
.detail-summary {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid $border;
}
.ds-label {
  display: block;
  font-size: 13px;
  color: $text-2;
  line-height: 1.8;
}
.question-item {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 10px;
  margin-bottom: 10px;
}
.qi-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.qi-no {
  font-size: 14px;
  font-weight: 600;
  color: $text-1;
}
.qi-result {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 500;
}
.qi-result.correct { background: #d1fae5; color: #059669; }
.qi-result.wrong { background: #fef2f2; color: #dc2626; }
.qi-result.unknown { background: #f3f4f6; color: #6b7280; }
.qi-content {
  font-size: 13px;
  color: $text-1;
  line-height: 1.6;
  margin-bottom: 8px;
}
.qi-answers {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}
.qi-answer {
  font-size: 12px;
  color: $text-2;
}
.qi-answer.correct-answer {
  color: #059669;
}
.qi-analysis {
  background: #fff;
  border-radius: 8px;
  padding: 8px;
}
.qa-label {
  font-size: 12px;
  color: $text-3;
  font-weight: 500;
}
.qa-text {
  font-size: 12px;
  color: $text-2;
  line-height: 1.6;
}
</style>
