<template>
  <view class="hw-page">
    <!-- 顶部导航 -->
    <view class="top-nav">
      <view class="back" @click="goBack">
        <u-icon name="arrow-left" color="#333" size="20"></u-icon>
      </view>
      <view class="nav-center">
        <u-icon name="checkmark-circle" color="#0195ff" size="22"></u-icon>
        <text class="nav-title">批改记录</text>
      </view>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 列表 -->
    <scroll-view
      scroll-y
      class="list-scroll"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
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
        <u-empty text="暂无批改记录" mode="data" margin-top="60"></u-empty>
      </view>

      <!-- 加载状态 -->
      <view class="loading-wrap" v-if="loading">
        <u-loading-icon mode="circle" size="36"></u-loading-icon>
      </view>

      <view v-if="!loading && list.length && !hasMore" class="no-more">
        <text>没有更多了</text>
      </view>
      <view class="bottom-space"></view>
    </scroll-view>

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
            <view
              class="question-item"
              v-for="q in detailData.questions"
              :key="q.id"
            >
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
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getHomeworkList, getHomeworkDetail } from '../../api/ai'
import type { HomeworkPageVO, HomeworkCorrectionVO } from '../../types/ai'

const list = ref<HomeworkPageVO[]>([])
const loading = ref(true)
const isRefreshing = ref(false)
const pageNum = ref(1)
const hasMore = ref(true)
const courseId = ref<number | undefined>(undefined)
const showDetail = ref(false)
const detailData = ref<HomeworkCorrectionVO | null>(null)

onLoad((options: any) => {
  if (options?.courseId) {
    courseId.value = Number(options.courseId)
  }
  loadList()
})

async function loadList(isRefresh = false) {
  if (loading.value && !isRefresh) return
  loading.value = true
  try {
    const data = await getHomeworkList(courseId.value, pageNum.value, 10)
    if (isRefresh) {
      list.value = data.records
    } else {
      list.value.push(...data.records)
    }
    hasMore.value = data.records.length >= 10
  } catch {
    if (pageNum.value === 1) {
      list.value = getMockList()
    }
  } finally {
    loading.value = false
    isRefreshing.value = false
  }
}

function onRefresh() {
  isRefreshing.value = true
  pageNum.value = 1
  hasMore.value = true
  loadList(true)
}

function loadMore() {
  if (!hasMore.value || loading.value) return
  pageNum.value++
  loadList()
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

function getMockList(): HomeworkPageVO[] {
  return [
    { id: 1, courseId: 1, courseName: '数学基础', totalQuestions: 10, correctCount: 8, score: 85, status: 2, createTime: '2026-07-05 14:30' },
    { id: 2, courseId: 2, courseName: '语文阅读', totalQuestions: 5, correctCount: 3, score: 60, status: 2, createTime: '2026-07-03 10:00' },
  ]
}

function goBack() { uni.navigateBack().catch(() => uni.reLaunch({ url: '/pages/index/index' })) }
</script>

<style scoped lang="scss">
.hw-page {
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

/* 列表滚动区 */
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
  font-size: 13px;
  color: $text-2;
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

/* 空状态 / 加载 */
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
.no-more {
  text-align: center;
  padding: 16px 0;
  font-size: 12px;
  color: $text-3;
}
.bottom-space { height: 20px; }

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

/* 题目项 */
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
