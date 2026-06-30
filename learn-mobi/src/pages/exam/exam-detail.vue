<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="navbar">
      <view class="back" @click="goBack">
        <u-icon name="arrow-left" color="#333" size="20"></u-icon>
      </view>
      <text class="nav-title">{{ isFinal ? '结课考试' : '在线测试' }}</text>
      <view class="nav-right"></view>
    </view>

    <scroll-view class="scroll-area" scroll-y>
      <view v-if="loading" class="center-wrap">
        <u-loading-icon mode="circle" size="36"></u-loading-icon>
      </view>

      <template v-else-if="detail || finalInfo">
        <!-- ===== 结课考试模式 ===== -->
        <template v-if="isFinal && finalInfo">
          <!-- 考试信息卡片 -->
          <view class="info-card">
            <view class="info-header">
              <view class="icon-wrap">
                <view class="icon-doc"></view>
              </view>
              <view class="info-title-area">
                <text class="exam-title">{{ finalInfo.examName }}</text>
                <text class="exam-desc">结课考试</text>
              </view>
            </view>

            <!-- 可考状态 -->
            <view class="status-bar" :class="finalInfo.canTake ? 'can' : 'cannot'">
              <text class="status-text">{{ finalInfo.canTake ? '可以参加考试' : (finalInfo.cannotTakeReason || '暂不可考') }}</text>
            </view>

            <!-- 考试参数 -->
            <view class="info-list">
              <view class="info-item">
                <text class="info-label">总分及格：</text>
                <text class="info-value">{{ finalInfo.totalScore }}分 / {{ finalInfo.passScore }}分及格</text>
              </view>
              <view class="info-item">
                <text class="info-label">限时：</text>
                <text class="info-value">{{ finalInfo.duration }}分钟</text>
              </view>
              <view class="info-item">
                <text class="info-label">最大参考次数：</text>
                <text class="info-value">{{ finalInfo.maxAttempts }}次</text>
              </view>
              <view class="info-item">
                <text class="info-label">章节完成率要求：</text>
                <text class="info-value">{{ finalInfo.chapterCompletionRate }}%</text>
              </view>
            </view>
          </view>

          <!-- 进度与成绩卡片 -->
          <view class="history-card">
            <view class="history-header">
              <view class="history-title-row">
                <u-icon name="clock" color="#f59e0b" size="18"></u-icon>
                <text class="history-title">考试进度</text>
              </view>
            </view>

            <view class="progress-list">
              <view class="progress-item">
                <text class="p-label">已考次数</text>
                <text class="p-value">{{ finalInfo.attemptedCount }} / {{ finalInfo.maxAttempts }}</text>
              </view>
              <view class="progress-item">
                <text class="p-label">历史最高分</text>
                <text class="p-value" :style="{ color: finalInfo.highestScore >= finalInfo.passScore ? '#10b981' : '#f59e0b' }">
                  {{ finalInfo.highestScore }}分
                </text>
              </view>
              <view class="progress-item">
                <text class="p-label">章节完成率</text>
                <text class="p-value" :style="{ color: finalInfo.currentCompletionRate >= finalInfo.chapterCompletionRate ? '#10b981' : '#f59e0b' }">
                  {{ finalInfo.currentCompletionRate }}%
                </text>
              </view>
            </view>

            <!-- 开始考试按钮 -->
            <view class="exam-btn" :class="{ disabled: !finalInfo.canTake }" @click="startFinalExam">
              <text>开始考试</text>
              <u-icon name="arrow-right" color="#fff" size="14"></u-icon>
            </view>
          </view>
        </template>

        <!-- ===== 普通测试模式 ===== -->
        <template v-else>
          <view class="info-card">
            <view class="info-header">
              <view class="icon-wrap">
                <view class="icon-doc"></view>
              </view>
              <view class="info-title-area">
                <text class="exam-title">{{ detail.name }}</text>
                <text class="exam-desc">{{ detail.introduction }}</text>
              </view>
            </view>
            <view class="exam-btn" @click="startNormalExam">
              <text>参加测试</text>
              <u-icon name="arrow-right" color="#fff" size="14"></u-icon>
            </view>
            <view class="divider"></view>
            <view class="info-list">
              <view class="info-item">
                <text class="info-label">总分及格：</text>
                <text class="info-value">{{ detail.totalScore }}分 / {{ detail.passScore }}分及格</text>
              </view>
              <view class="info-item">
                <text class="info-label">限时：</text>
                <text class="info-value">{{ detail.duration }}分钟</text>
              </view>
              <view class="info-item">
                <text class="info-label">课程：</text>
                <text class="info-value">{{ detail.courseName }}</text>
              </view>
            </View>
          </View>

          <!-- 历史成绩卡片 -->
          <view class="history-card">
            <view class="history-header">
              <view class="history-title-row">
                <u-icon name="clock" color="#f59e0b" size="18"></u-icon>
                <text class="history-title">历史成绩</text>
              </view>
              <view v-if="historyList.length > 0" class="clear-btn" @click="handleClearHistory">清空成绩</view>
            </view>

            <view v-if="historyList.length === 0" class="empty-wrap">
              <u-empty text="暂无历史成绩" mode="list" margin-top="20"></u-empty>
            </view>

            <view v-else class="history-list">
              <view v-for="(h, i) in historyList" :key="h.recordId" class="history-item">
                <text class="h-index">{{ i + 1 }}</text>
                <view class="h-icon-wrap">
                  <text class="h-icon">试</text>
                </view>
                <view class="h-info">
                  <text class="h-score">{{ h.score }}分</text>
                  <text class="h-pass" :class="h.isPass === 1 ? 'pass' : 'fail'">
                    {{ h.isPass === 1 ? '及格' : '不及格' }}
                  </text>
                </view>
                <view class="h-right">
                  <text class="h-name">{{ h.totalScore }}分满分</text>
                  <text class="h-time">{{ h.submitTime }}</text>
                </view>
              </view>
              <text class="no-more">没有更多了</text>
            </view>
          </view>
        </template>
      </template>

      <u-empty v-else text="考试不存在" mode="list" margin-top="60"></u-empty>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getExamDetail, clearExamHistory, getCourseFinalExam, startExam } from '../../api/exam'
import { setExamStartData } from '../../utils/exam-cache'
import type { ExamDetailVO, ExamHistoryVO, FinalExamVO } from '../../types/exam'

const examId = ref(0)
const courseId = ref(0)
const isFinal = ref(false)
const loading = ref(true)
const detail = ref<ExamDetailVO | null>(null)
const finalInfo = ref<FinalExamVO | null>(null)
const historyList = ref<ExamHistoryVO[]>([])

onLoad((q: any) => {
  courseId.value = Number(q.courseId) || 0
  isFinal.value = q.final === '1'
  if (isFinal.value && courseId.value) {
    loadFinalExam()
  } else {
    examId.value = Number(q.id) || Number(q.eid) || 0
    if (examId.value) loadDetail()
    else loading.value = false
  }
})

// 从答题页返回时刷新数据
onShow(() => {
  if (isFinal.value && courseId.value && examId.value) {
    loading.value = true
    loadFinalExam()
  }
})

async function loadFinalExam() {
  try {
    const data = await getCourseFinalExam(courseId.value)
    if (data && data.examId) {
      finalInfo.value = data
      examId.value = data.examId
    } else {
      uni.showToast({ title: '暂无结课考试', icon: 'none' })
    }
  } catch {
    uni.showToast({ title: '数据加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

async function loadDetail() {
  try {
    const data = await getExamDetail(examId.value)
    detail.value = data
    historyList.value = data?.historyList || []
  } catch {
    uni.showToast({ title: '数据加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

async function startFinalExam() {
  if (!finalInfo.value?.canTake || !examId.value) return
  try {
    uni.showLoading({ title: '正在准备考试...', mask: true })
    const data = await startExam(examId.value)
    setExamStartData(data)
    uni.hideLoading()
    uni.navigateTo({ url: `/pages/exam/exam-answer?recordId=${data.recordId}&examId=${examId.value}&duration=${data.duration}&final=1` })
  } catch {
    uni.hideLoading()
    uni.showToast({ title: '开考失败', icon: 'none' })
  }
}

function startNormalExam() {
  uni.navigateTo({ url: `/pages/exam/exam-answer?id=${examId.value}` })
}

async function handleClearHistory() {
  uni.showModal({
    title: '提示',
    content: '确定清空所有历史成绩？此操作不可恢复。',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '处理中...', mask: true })
          await clearExamHistory(examId.value)
          historyList.value = []
          uni.hideLoading()
          uni.showToast({ title: '已清空', icon: 'success' })
        } catch {
          uni.hideLoading()
          uni.showToast({ title: '操作失败', icon: 'none' })
        }
      }
    },
  })
}

function goBack() {
  uni.navigateBack().catch(() => uni.reLaunch({ url: '/pages/index/index' }))
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $bg-page;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: $bg-card;
  padding: 12px 14px;
  padding-top: calc(12px + constant(safe-area-inset-top));
  padding-top: calc(12px + env(safe-area-inset-top));
  display: flex;
  align-items: center;
}

.back {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  flex-shrink: 0;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  color: $text-1;
  flex: 1;
}

.nav-right {
  width: 38px;
  flex-shrink: 0;
}

.center-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 100px;
}

.scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 12px 14px 30px;
}

/* 考试信息卡片 */
.info-card {
  background: $bg-card;
  border-radius: 12px;
  padding: 18px;
  margin-bottom: 12px;
  box-shadow: $shadow-card;
}

.info-header {
  display: flex;
  align-items: center;
}

.icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: $primary-bg;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.icon-doc {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  background: $gradient-primary;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    right: 4px;
    bottom: 4px;
    background: #fff;
    border-radius: 1px;
  }

  &::after {
    content: '';
    position: absolute;
    top: 9px;
    left: 8px;
    right: 8px;
    height: 1px;
    background: $border;
    box-shadow: 0 4px 0 $border, 0 8px 0 $border;
  }
}

.info-title-area {
  flex: 1;
}

.exam-title {
  font-size: 16px;
  font-weight: 600;
  color: $text-1;
  display: block;
}

.exam-desc {
  font-size: 12px;
  color: $text-3;
  margin-top: 2px;
  display: block;
}

/* 可考状态条 */
.status-bar {
  margin-top: 14px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
}
.status-bar.can {
  background: #ecfdf5;
  color: #10b981;
}
.status-bar.cannot {
  background: #fef2f2;
  color: $danger;
}
.status-text {
  font-size: 13px;
}

/* 考试按钮 */
.exam-btn {
  margin-top: 14px;
  background: #07c160;
  border-radius: 21px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
  gap: 4px;

  text {
    color: #fff;
    font-size: 15px;
    font-weight: 600;
  }
}
.exam-btn.disabled {
  background: #d0d5dd;
  pointer-events: none;
}

.divider {
  height: 1px;
  background: $border;
  margin: 16px 0;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 13px;
}

.info-label {
  color: $text-3;
  width: 100px;
  flex-shrink: 0;
}

.info-value {
  color: $text-2;
  flex: 1;
}

/* 进度卡片(结课) */
.history-card {
  background: $bg-card;
  border-radius: 12px;
  padding: 18px;
  box-shadow: $shadow-card;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.history-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.history-title {
  font-size: 15px;
  font-weight: 600;
  color: $text-1;
}

.progress-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.p-label {
  font-size: 13px;
  color: $text-3;
}

.p-value {
  font-size: 14px;
  font-weight: 600;
  color: $text-1;
}

.clear-btn {
  font-size: 12px;
  color: #fff;
  background: #ff9966;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 500;
}

.empty-wrap {
  padding: 10px 0;
}

.history-list {
  display: flex;
  flex-direction: column;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid $border;
  gap: 10px;

  &:last-child {
    border-bottom: none;
  }
}

.h-index {
  font-size: 12px;
  color: $text-3;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.h-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #0195ff, #00c6ff);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.h-icon {
  font-size: 14px;
  color: #fff;
  font-weight: 700;
}

.h-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 2px;
}

.h-score {
  font-size: 16px;
  font-weight: 700;
  color: $text-1;
}

.h-pass {
  font-size: 12px;
  font-weight: 500;

  &.pass {
    color: #10b981;
  }

  &.fail {
    color: $danger;
  }
}

.h-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
}

.h-name {
  font-size: 12px;
  color: $text-2;
}

.h-time {
  font-size: 11px;
  color: $text-3;
}

.no-more {
  text-align: center;
  font-size: 12px;
  color: $text-3;
  padding: 16px 0 4px;
}
</style>
