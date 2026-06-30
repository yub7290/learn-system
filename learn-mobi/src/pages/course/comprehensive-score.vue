<template>
  <view class="page">
    <!-- 顶部导航 -->
    <view class="navbar">
      <view class="back" @click="goBack">
        <u-icon name="arrow-left" color="#333" size="20"></u-icon>
      </view>
      <text class="nav-title">综合成绩</text>
      <view class="nav-right"></view>
    </view>

    <scroll-view class="scroll-area" scroll-y>
      <view v-if="loading" class="center-wrap">
        <u-loading-icon mode="circle" size="36"></u-loading-icon>
      </view>

      <view v-else-if="scoreData" class="content-wrap">
        <!-- 课程信息 -->
        <view class="course-header">
          <image v-if="scoreData.courseImage" :src="scoreData.courseImage" mode="aspectFill" class="course-img"></image>
          <view class="course-info">
            <text class="course-name">{{ scoreData.courseName }}</text>
          </view>
        </view>

        <!-- 统计卡片网格 -->
        <view class="stats-grid">
          <view class="stat-card">
            <view class="stat-value" :style="{ color: '#0195ff' }">{{ scoreData.examAvgScore }}</view>
            <text class="stat-label">考试平均分</text>
          </view>
          <view class="stat-card">
            <view class="stat-value" :style="{ color: '#10b981' }">{{ scoreData.examMaxScore }}</view>
            <text class="stat-label">考试最高分</text>
          </view>
          <view class="stat-card">
            <view class="stat-value" :style="{ color: '#f59e0b' }">{{ scoreData.examPassRate }}%</view>
            <text class="stat-label">考试及格率</text>
          </view>
          <view class="stat-card">
            <view class="stat-value" :style="{ color: '#8b5cf6' }">{{ scoreData.practiceAccuracyRate }}%</view>
            <text class="stat-label">练习正确率</text>
          </view>
        </view>

        <!-- 详细信息 -->
        <view class="section-card">
          <view class="section-title">
            <u-icon name="grid" color="#0195ff" size="18"></u-icon>
            <text class="section-title-text">考试统计</text>
          </view>
          <view class="detail-list">
            <view class="detail-item">
              <text class="detail-label">考试总次数</text>
              <text class="detail-value">{{ scoreData.examTotalCount }} 次</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">考试及格次数</text>
              <text class="detail-value">{{ scoreData.examPassCount }} 次</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">考试最高分</text>
              <text class="detail-value">{{ scoreData.examMaxScore }} 分</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">考试平均分</text>
              <text class="detail-value">{{ scoreData.examAvgScore }} 分</text>
            </view>
          </view>
        </view>

        <view class="section-card">
          <view class="section-title">
            <u-icon name="edit-pen" color="#10b981" size="18"></u-icon>
            <text class="section-title-text">练习统计</text>
          </view>
          <view class="detail-list">
            <view class="detail-item">
              <text class="detail-label">练习总题数</text>
              <text class="detail-value">{{ scoreData.practiceTotalCount }} 题</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">正确题数</text>
              <text class="detail-value">{{ scoreData.practiceCorrectCount }} 题</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">正确率</text>
              <text class="detail-value">{{ scoreData.practiceAccuracyRate }}%</text>
            </view>
          </view>
        </view>

        <view class="section-card">
          <view class="section-title">
            <u-icon name="bookmark" color="#f59e0b" size="18"></u-icon>
            <text class="section-title-text">学习进度</text>
          </view>
          <view class="progress-section">
            <view class="progress-row">
              <text class="progress-label">章节学习进度</text>
              <text class="progress-value">{{ scoreData.chapterStudiedCount }} / {{ scoreData.chapterTotalCount }} 章</text>
            </view>
            <view class="progress-bar-bg">
              <view class="progress-bar-fill" :style="{ width: scoreData.chapterProgressRate + '%' }"></view>
            </view>
            <text class="progress-percent">{{ scoreData.chapterProgressRate }}%</text>
          </view>
        </view>

        <!-- 考试历史记录 -->
        <view class="section-card" v-if="scoreData.examHistoryList && scoreData.examHistoryList.length > 0">
          <view class="section-title">
            <u-icon name="clock" color="#8b5cf6" size="18"></u-icon>
            <text class="section-title-text">考试历史</text>
          </view>
          <view class="history-list">
            <view
              class="history-item"
              v-for="(h, i) in scoreData.examHistoryList"
              :key="h.recordId"
              @click="viewExamResult(h.recordId)"
            >
              <view class="history-left">
                <view class="history-index">{{ i + 1 }}</view>
                <view class="history-info">
                  <text class="history-exam-name">{{ h.examName || '考试' }}</text>
                  <text class="history-time">{{ formatTime(h.submitTime) }}</text>
                </view>
              </view>
              <view class="history-right">
                <text class="history-score" :style="{ color: h.isPass ? '#10b981' : '#ef4444' }">
                  {{ h.score }}分
                </text>
                <text class="history-pass" :style="{ color: h.isPass ? '#10b981' : '#ef4444' }">
                  {{ h.isPass ? '及格' : '不及格' }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <view v-else-if="scoreData.examHistoryList && scoreData.examHistoryList.length === 0" class="section-card">
          <view class="empty-wrap">
            <u-empty text="暂无考试记录" mode="list" margin-top="20"></u-empty>
          </view>
        </view>

        <!-- 底部留白 -->
        <view style="height: 30px;"></view>
      </view>

      <view v-else class="center-wrap">
        <u-empty text="暂无综合成绩数据" mode="data" margin-top="30"></u-empty>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCourseScore } from '../../api/course'
import type { CourseScoreVO } from '../../types/course'

const cid = ref(0)
const loading = ref(true)
const scoreData = ref<CourseScoreVO | null>(null)

onLoad((q: any) => {
  cid.value = Number(q.courseId) || 0
  if (cid.value) loadScore()
  else {
    loading.value = false
    uni.showToast({ title: '参数错误', icon: 'none' })
  }
})

async function loadScore() {
  try {
    scoreData.value = await getCourseScore(cid.value)
  } catch (e: any) {
    uni.showToast({ title: e?.message || '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function goBack() {
  uni.navigateBack().catch(() => uni.reLaunch({ url: '/pages/course/course' }))
}

function viewExamResult(recordId: number) {
  uni.navigateTo({ url: `/pages/exam/exam-answer?recordId=${recordId}` }).catch(() => {})
}

function formatTime(time: string): string {
  if (!time) return ''
  try {
    const d = new Date(time)
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch {
    return time
  }
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: #f5f7fa;
}

/* 导航栏 */
.navbar {
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 12px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}
.back {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}
.nav-right {
  width: 30px;
}

.scroll-area {
  height: calc(100vh - 44px);
}
.center-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 100px;
}

.content-wrap {
  padding: 12px;
}

/* 课程头图 */
.course-header {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,.06);
}
.course-img {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  margin-right: 12px;
  background: #e8edf3;
}
.course-info {
  flex: 1;
}
.course-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  line-height: 1.4;
}

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
}
.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,.06);
}
.stat-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}
.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 6px;
  display: block;
}

/* 通用区块卡片 */
.section-card {
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,.06);
}
.section-title {
  display: flex;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 12px;
}
.section-title-text {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-left: 6px;
}

/* 详情列表 */
.detail-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.detail-label {
  font-size: 13px;
  color: #666;
}
.detail-value {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

/* 进度条 */
.progress-section {
  padding: 4px 0;
}
.progress-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.progress-label {
  font-size: 13px;
  color: #666;
}
.progress-value {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}
.progress-bar-bg {
  height: 8px;
  background: #e8edf3;
  border-radius: 4px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #f97316);
  border-radius: 4px;
  transition: width 0.3s;
}
.progress-percent {
  display: block;
  text-align: right;
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

/* 考试历史 */
.history-list {
  display: flex;
  flex-direction: column;
}
.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}
.history-item:last-child {
  border-bottom: none;
}
.history-left {
  display: flex;
  align-items: center;
  flex: 1;
}
.history-index {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ebf5ff;
  color: #0195ff;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  flex-shrink: 0;
}
.history-info {
  display: flex;
  flex-direction: column;
}
.history-exam-name {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}
.history-time {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}
.history-right {
  text-align: right;
}
.history-score {
  font-size: 16px;
  font-weight: 700;
  display: block;
}
.history-pass {
  font-size: 11px;
  display: block;
  margin-top: 2px;
}
.empty-wrap {
  padding: 20px 0;
}
</style>
