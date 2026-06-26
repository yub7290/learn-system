<template>
  <view class="overview-page">
    <!-- 顶部导航栏 -->
    <view class="page-header">
      <view class="header-left">
        <view class="back-btn" @click="goBack">
          <text class="back-icon">&#x2039;</text>
        </view>
        <text class="page-title">学习能力总览</text>
      </view>

      <!-- 周次切换 -->
      <view class="week-switch">
        <view
          class="week-arrow-btn"
          :class="{ disabled: currentWeekIndex >= weekReportList.length - 1 }"
          @click="prevWeek"
        >
          <text>&#x2039;</text>
        </view>
        <view class="week-tag" @click="showWeekPicker = true">
          <text>{{ currentReport.weekName }}</text>
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
      <!-- 学情总览卡片 -->
      <view class="overview-card">
        <view class="overview-left">
          <text class="overview-label">综合能力评分</text>
          <view class="score-row">
            <text class="score-num">{{ currentReport.totalScore }}</text>
            <view class="diff-tag" :class="currentReport.totalDiff >= 0 ? 'up' : 'down'">
              <text>{{ currentReport.totalDiff >= 0 ? '&#x2191;' : '&#x2193;' }} {{ Math.abs(currentReport.totalDiff) }}分</text>
            </view>
          </view>
          <text class="level-text">评级：{{ levelText }}</text>
        </view>
        <view class="overview-right">
          <text class="time-label">本周学习时长</text>
          <text class="time-num">{{ currentReport.totalDuration }}h</text>
          <text class="time-sub">共 {{ currentReport.studyDays }} 天</text>
        </view>
      </view>

      <!-- 五维能力雷达 -->
      <view class="section-card">
        <view class="card-header">
          <text class="card-title">学习能力维度</text>
          <text class="card-sub">较上周对比</text>
        </view>
        <view class="radar-area">
          <RadarChart
            :data="radarData"
            :labels="['专注力', '理解归纳', '逻辑解题', '纠错复盘', '自主规划']"
            :size="260"
            fill-color="rgba(7,193,96,0.2)"
            stroke-color="#07c160"
          />
        </view>
        <view class="ability-list">
          <view class="ability-item" v-for="item in abilityList" :key="item.name">
            <text class="ability-name">{{ item.name }}</text>
            <view class="ability-bar">
              <view class="bar-fill" :style="{ width: item.current + '%' }"></view>
            </view>
            <text class="ability-value">{{ item.current }}</text>
            <view class="ability-diff" :class="item.diff >= 0 ? 'up' : 'down'">
              <text>{{ item.diff >= 0 ? '+' : '' }}{{ item.diff }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 周学习时长 -->
      <view class="section-card">
        <view class="card-header">
          <text class="card-title">周学习时长</text>
          <text class="card-sub">单位：分钟</text>
        </view>
        <view class="chart-wrap">
          <view class="bar-chart">
            <view class="bar-item" v-for="item in durationList" :key="item.day">
              <view class="bar-value">
                <view
                  class="bar-inner"
                  :style="{ height: (item.minutes / maxDuration) * 100 + '%' }"
                ></view>
              </view>
              <text class="bar-label">{{ item.day }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 知识图谱 -->
      <view class="section-card">
        <view class="card-header">
          <text class="card-title">知识关联拓扑图谱</text>
          <text class="card-sub">点击学科切换</text>
        </view>

        <scroll-view scroll-x class="tabs-scroll" show-scrollbar="false">
          <view class="subject-tabs">
            <view
              class="tab-item"
              :class="{ active: currentSubject === item.key }"
              v-for="item in subjectList"
              :key="item.key"
              @click="switchSubject(item.key)"
            >
              <text>{{ item.name }}</text>
            </view>
          </view>
        </scroll-view>

        <KnowledgeGraph
          :pre-nodes="graphPreNodes"
          :core-node="graphCoreNode"
          :next-nodes="graphNextNodes"
          :width="650"
          :height="320"
        />

        <view class="chain-box">
          <view class="chain-item good">
            <text class="chain-label">掌握良好链路</text>
            <text class="chain-text">{{ currentGraph.goodChain }}</text>
          </view>
          <view class="chain-item weak">
            <text class="chain-label">薄弱知识链路</text>
            <text class="chain-text">{{ currentGraph.weakChain }}</text>
          </view>
        </view>
      </view>

      <!-- 学情总结 -->
      <view class="section-card">
        <view class="card-header">
          <text class="card-title">学情总结与建议</text>
        </view>
        <view class="summary-section">
          <text class="summary-title">本周优势</text>
          <text class="summary-text">
            专注力与理解归纳能力提升明显，课堂专注度较上周提升8%，对基础概念的吸收效率较高；基础概念类知识点掌握扎实。
          </text>
        </view>
        <view class="summary-section">
          <text class="summary-title">薄弱环节</text>
          <text class="summary-text">
            纠错复盘能力有待加强，同类错题重复出现；进阶运算类知识点熟练度不足，综合应用题型失分较多，导致整体解题速度偏慢。
          </text>
        </view>
        <view class="summary-section">
          <text class="summary-title">学习建议</text>
          <text class="summary-text">
            1. 每日增加15分钟错题复盘，重点整理薄弱题型的错题；
            2. 优先补强当前核心基础知识点，针对性训练薄弱题型；
            3. 每周完成2套综合题型专项训练，强化知识点综合运用能力。
          </text>
        </view>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 周次选择弹窗 -->
    <view class="week-picker-mask" v-if="showWeekPicker" @click="showWeekPicker = false">
      <view class="week-picker-content" @click.stop>
        <view class="picker-header">
          <text class="picker-title">选择周次</text>
          <view class="picker-close" @click="showWeekPicker = false">
            <text>&#x2715;</text>
          </view>
        </view>
        <scroll-view scroll-y class="week-list">
          <view
            class="week-item"
            :class="{ active: currentWeekIndex === index }"
            v-for="(item, index) in weekReportList"
            :key="index"
            @click="selectWeek(index)"
          >
            <text class="week-name">{{ item.weekName }}</text>
            <view class="week-right">
              <text class="week-score">{{ item.totalScore }}分</text>
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
import RadarChart from '../../components/RadarChart.vue'
import KnowledgeGraph from '../../components/KnowledgeGraph.vue'
import { getWeekReportList, getSubjectList, getSubjectGraph } from '../../api/student'
import type { WeekReportVO, AbilityScoreVO, DurationItemVO, SubjectItemVO, SubjectGraphVO, GraphNodeVO } from '../../types/student'

const currentWeekIndex = ref(0)
const showWeekPicker = ref(false)
const currentSubject = ref('math')
const weekReportList = ref<WeekReportVO[]>([])
const subjectList = ref<SubjectItemVO[]>([])
const currentGraph = ref<SubjectGraphVO>({
  preNodes: [],
  coreNode: { id: 0, name: '核心', mastery: 75, type: 'core', questionTypes: [] },
  nextNodes: [],
  goodChain: '',
  weakChain: '',
})

const currentReport = computed<WeekReportVO>(() => {
  return weekReportList.value[currentWeekIndex.value] || weekReportList.value[0]
})

const abilityList = computed<AbilityScoreVO[]>(() => currentReport.value.abilityList || [])
const durationList = computed<DurationItemVO[]>(() => currentReport.value.durationList || [])
const radarData = computed(() => abilityList.value.map((a) => a.current))

const levelText = computed(() => {
  const score = currentReport.value.totalScore
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 70) return '中等'
  if (score >= 60) return '及格'
  return '待提升'
})

const maxDuration = computed(() => {
  let max = 0
  durationList.value.forEach((item) => {
    if (item.minutes > max) max = item.minutes
  })
  return max || 1
})

const graphPreNodes = computed<GraphNodeVO[]>(() => {
  return currentGraph.value.preNodes.map((n) => ({ id: n.id, name: n.name, mastery: n.mastery }))
})

const graphCoreNode = computed<GraphNodeVO>(() => {
  const core = currentGraph.value.coreNode
  return { id: core.id, name: core.name, mastery: core.mastery }
})

const graphNextNodes = computed<GraphNodeVO[]>(() => {
  return currentGraph.value.nextNodes.map((n) => ({ id: n.id, name: n.name, mastery: n.mastery }))
})

onShow(async () => {
  weekReportList.value = await getWeekReportList()
  subjectList.value = await getSubjectList()
  await loadGraph()
})

async function loadGraph(): Promise<void> {
  currentGraph.value = await getSubjectGraph(currentSubject.value)
}

function prevWeek(): void {
  if (currentWeekIndex.value >= weekReportList.value.length - 1) return
  currentWeekIndex.value++
}

function nextWeek(): void {
  if (currentWeekIndex.value === 0) return
  currentWeekIndex.value--
}

function selectWeek(index: number): void {
  currentWeekIndex.value = index
  showWeekPicker.value = false
}

async function switchSubject(key: string): Promise<void> {
  currentSubject.value = key
  await loadGraph()
}

function goBack(): void {
  uni.navigateBack()
}
</script>

<style scoped lang="scss">
.overview-page {
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

.overview-card {
  width: 100%;
  padding: 32rpx 24rpx;
  background: linear-gradient(135deg, #07c160 0%, #10b981 100%);
  border-radius: 12rpx;
  color: #fff;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 24rpx;
  box-sizing: border-box;
}
.overview-left,
.overview-right {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.overview-right {
  align-items: flex-end;
}
.overview-label {
  font-size: 24rpx;
  opacity: 0.9;
}
.score-row {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 16rpx;
}
.score-num {
  font-size: 56rpx;
  font-weight: 700;
}
.diff-tag {
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}
.diff-tag.up {
  background: rgba(255, 255, 255, 0.2);
}
.diff-tag.down {
  background: rgba(255, 200, 200, 0.3);
}
.level-text {
  font-size: 24rpx;
  opacity: 0.85;
}
.time-label {
  font-size: 24rpx;
  opacity: 0.9;
}
.time-num {
  font-size: 44rpx;
  font-weight: 700;
}
.time-sub {
  font-size: 22rpx;
  opacity: 0.85;
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

.radar-area {
  display: flex;
  justify-content: center;
  margin-bottom: 24rpx;
}

.ability-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.ability-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16rpx;
}
.ability-name {
  width: 120rpx;
  font-size: 26rpx;
  color: $text-1;
  flex-shrink: 0;
}
.ability-bar {
  flex: 1;
  height: 12rpx;
  background: #f0f0f0;
  border-radius: 6rpx;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #07c160, #10b981);
  border-radius: 6rpx;
  transition: width 0.3s;
}
.ability-value {
  width: 60rpx;
  text-align: right;
  font-size: 26rpx;
  color: $text-1;
  font-weight: 500;
  flex-shrink: 0;
}
.ability-diff {
  width: 60rpx;
  text-align: center;
  font-size: 22rpx;
  flex-shrink: 0;
}
.ability-diff.up {
  color: #07c160;
}
.ability-diff.down {
  color: #f56c6c;
}

.chart-wrap {
  width: 100%;
  padding: 20rpx 0;
}
.bar-chart {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-around;
  height: 300rpx;
  padding: 0 20rpx;
  border-bottom: 1rpx solid #eee;
}
.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  height: 100%;
  justify-content: flex-end;
}
.bar-value {
  width: 40rpx;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.bar-inner {
  width: 100%;
  background: linear-gradient(180deg, #07c160, #67c23a);
  border-radius: 8rpx 8rpx 0 0;
  min-height: 4rpx;
}
.bar-label {
  font-size: 22rpx;
  color: $text-2;
}

.tabs-scroll {
  width: 100%;
  height: 80rpx;
  white-space: nowrap;
  margin-bottom: 20rpx;
}
.subject-tabs {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  background: $bg-page;
  border-radius: 8rpx;
  padding: 6rpx;
  gap: 6rpx;
  width: 960rpx;
  height: 100%;
}
.tab-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 28rpx;
  height: 64rpx;
  border-radius: 6rpx;
  font-size: 26rpx;
  color: $text-2;
  white-space: nowrap;
  flex-shrink: 0;
}
.tab-item.active {
  background: $bg-card;
  color: #07c160;
  font-weight: 500;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.06);
}

.chain-box {
  margin-top: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.chain-item {
  padding: 20rpx;
  border-radius: 8rpx;
}
.chain-item.good {
  background: #f0f9eb;
}
.chain-item.weak {
  background: #fef0f0;
}
.chain-label {
  display: block;
  font-size: 26rpx;
  font-weight: 500;
  margin-bottom: 8rpx;
  color: $text-1;
}
.chain-text {
  font-size: 24rpx;
  color: $text-2;
  line-height: 1.5;
}

.summary-section {
  margin-bottom: 24rpx;
}
.summary-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: $text-1;
  margin-bottom: 12rpx;
}
.summary-text {
  font-size: 26rpx;
  color: $text-2;
  line-height: 1.7;
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
.week-score {
  font-size: 26rpx;
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
