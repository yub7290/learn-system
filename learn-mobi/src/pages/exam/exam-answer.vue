<template>
  <view class="page">
    <!-- ===== 答题模式 ===== -->
    <template v-if="!submitted">
      <!-- 顶部导航 -->
      <view class="navbar">
        <view class="back" @click="goBack">
          <u-icon name="arrow-left" color="#333" size="20"></u-icon>
        </view>
        <text class="nav-title ellipsis">{{ examTitle }}</text>
        <text class="timer" :class="{ urgent: remainMin < 5 }">{{ timeStr }}</text>
      </view>

      <!-- 题型信息栏 -->
      <view v-if="currentQuestion" class="type-bar">
        <text class="type-tag" :style="{ background: typeColorBg(currentQuestion.questionType), color: typeColors[currentQuestion.questionType] || '#999' }">
          {{ typeLabels[currentQuestion.questionType] || '未知' }}
        </text>
        <text class="type-progress">已做 {{ answeredCount }}/{{ total }}</text>
        <text class="type-score">{{ currentQuestion.score }}分</text>
      </view>

      <!-- Swiper 题目滑动区域 -->
      <swiper class="swiper-area" :current="current" @change="onSwiperChange">
        <swiper-item v-for="(q, i) in questions" :key="q.questionId">
          <scroll-view scroll-y class="q-scroll">
            <view class="q-card">
              <view class="q-header">
                <text class="q-num">{{ i + 1 }}.</text>
                <text class="q-score">{{ q.score }}分</text>
              </view>
              <rich-text class="q-content" :nodes="q.content"></rich-text>

              <!-- 单选题：点击选中后自动下一题 -->
              <view v-if="q.questionType === 0" class="options">
                <view v-for="opt in q.options" :key="opt.label"
                  class="option"
                  :class="{ active: getAnswer(q.questionId) === opt.label }"
                  @click="answerRadio(q.questionId, opt.label)">
                  <view class="radio-outer">
                    <view v-if="getAnswer(q.questionId) === opt.label" class="radio-inner"></view>
                  </view>
                  <text class="opt-text">{{ opt.label }}. {{ opt.content }}</text>
                </view>
              </view>

              <!-- 多选题：多选 + 确定作答按钮 -->
              <view v-if="q.questionType === 1" class="options">
                <view v-for="opt in q.options" :key="opt.label"
                  class="option"
                  :class="{ active: multiTemp.includes(opt.label) }"
                  @click="toggleMulti(opt.label)">
                  <view class="checkbox">
                    <text v-if="multiTemp.includes(opt.label)" class="check-mark">&#10003;</text>
                  </view>
                  <text class="opt-text">{{ opt.label }}. {{ opt.content }}</text>
                </view>
                <view class="confirm-btn" @click="confirmMulti(q.questionId)">
                  <text>确定作答</text>
                </view>
              </view>

              <!-- 判断题：点击后自动下一题 -->
              <view v-if="q.questionType === 2" class="judge-row">
                <view class="judge-btn"
                  :class="{ active: getAnswer(q.questionId) === '正确' }"
                  @click="answerJudge(q.questionId, '正确')">正确</view>
                <view class="judge-btn"
                  :class="{ active: getAnswer(q.questionId) === '错误' }"
                  @click="answerJudge(q.questionId, '错误')">错误</view>
              </view>

              <!-- 填空题 / 简答题：textarea + 确定作答 -->
              <view v-if="q.questionType >= 3">
                <textarea v-model="textTemp" class="text-area" placeholder="请输入答案..." />
                <view class="confirm-btn" @click="confirmText(q.questionId)">
                  <text>{{ textTemp.trim() ? '确定作答' : '跳过' }}</text>
                </view>
              </view>
            </view>
          </scroll-view>
        </swiper-item>
      </swiper>

      <!-- 底部操作栏 -->
      <view class="bottom-bar">
        <text class="done-info">已完成 {{ answeredCount }}/{{ total }} 题</text>
        <view class="submit-btn" @click="handleSubmit">交卷</view>
      </view>
    </template>

    <!-- ===== 结果模式 ===== -->
    <template v-else-if="result">
      <scroll-view class="result-scroll" scroll-y>
        <!-- 得分卡片 -->
        <view class="score-card">
          <view class="score-circle" :class="result.isPass ? 'pass' : 'fail'">
            <text class="score-num">{{ result.score }}</text>
            <text class="score-unit">分</text>
          </view>
          <text class="pass-text" :class="result.isPass ? 'pass' : 'fail'">
            {{ result.isPass ? '恭喜通过' : '未通过' }}
          </text>
          <text class="pass-hint" v-if="result.isPass">达到 {{ result.passScore }} 分即可通过</text>
          <text class="pass-hint" v-else>还差 {{ result.passScore - result.score }} 分通过</text>
        </view>

        <!-- 统计 -->
        <view class="stats-row">
          <view class="stat-item">
            <text class="stat-num correct">{{ result.correctCount }}</text>
            <text class="stat-label">答对</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-num wrong">{{ safeWrongCount }}</text>
            <text class="stat-label">答错</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-num unanswered">{{ safeUnansweredCount }}</text>
            <text class="stat-label">未答</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-num time">{{ durationText }}</text>
            <text class="stat-label">用时</text>
          </view>
        </view>

        <!-- 全部答对庆祝 -->
        <view v-if="safeWrongCount === 0 && safeUnansweredCount === 0" class="celebration">
          <u-empty text="全部答对，太棒了！" mode="list" margin-top="24"></u-empty>
        </view>

        <!-- 错题解析 -->
        <template v-else-if="wrongQuestions.length > 0">
          <view class="analysis-title">错题解析</view>
          <view v-for="(qItem, qi) in wrongQuestions" :key="qItem.questionId" class="analysis-card">
            <view class="analysis-header">
              <text class="aq-index">第 {{ qi + 1 }} 题</text>
              <text class="aq-type" :style="{ background: typeColorBg(qItem.questionType), color: typeColors[qItem.questionType] || '#999' }">
                {{ typeLabels[qItem.questionType] || '未知' }}
              </text>
            </view>
            <rich-text class="aq-content" :nodes="qItem.content"></rich-text>
            <view class="aq-row">
              <text class="aq-label">你的答案：</text>
              <text class="aq-value wrong-text">{{ qItem.userAnswer || '未作答' }}</text>
            </view>
            <view class="aq-row">
              <text class="aq-label">正确答案：</text>
              <text class="aq-value correct-text">{{ qItem.correctAnswer }}</text>
            </view>
            <view v-if="qItem.knowledgePoint" class="aq-row">
              <text class="aq-label">知识点：</text>
              <text class="aq-value">{{ qItem.knowledgePoint }}</text>
            </view>
            <view v-if="qItem.analysis" class="aq-row">
              <text class="aq-label">解析：</text>
              <text class="aq-value">{{ qItem.analysis }}</text>
            </view>
          </view>
        </template>

        <!-- 底部按钮 -->
        <view class="result-action">
          <view class="back-btn" @click="goToList">{{ isFinal ? '返回考试详情' : '返回测试列表' }}</view>
          <view v-if="isFinal && result && !result.isPass" class="retry-btn" @click="goRetry">重新考试</view>
        </view>
      </scroll-view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { getExamDetail, getExamQuestions, submitExam, heartbeat, getExamResult } from '../../api/exam'
import { getExamStartData, clearExamStartData } from '../../utils/exam-cache'
import type { ExamQuestionVO, ExamResultVO } from '../../types/exam'

/* ---------- 题型映射 ---------- */
const typeLabels: Record<number, string> = { 0: '单选题', 1: '多选题', 2: '判断题', 3: '简答题', 4: '填空题' }
const typeColors: Record<number, string> = { 0: '#0195ff', 1: '#f59e0b', 2: '#10b981', 3: '#8b5cf6', 4: '#ec4899' }
function typeColorBg(t: number) { return (typeColors[t] || '#999') + '18' }

/* ---------- 状态 ---------- */
const examId = ref(0)
const recordId = ref(0)
const courseId = ref(0)
const isFinal = ref(false)
const examTitle = ref('在线答题')
const examDurationMin = ref(90)
const questions = ref<ExamQuestionVO[]>([])
const current = ref(0)
const loading = ref(true)
const submitted = ref(false)
const submitting = ref(false)
const result = ref<ExamResultVO | null>(null)

/* 答案存储 */
const answers = ref<Record<number, string>>({})
const multiTemp = ref<string[]>([])
const textTemp = ref('')

/* 自动推进标志 - 防止 programmatic advance 触发 onSwiperChange 中的重复保存 */
const isAutoAdvancing = ref(false)

/* 计时器 */
const remainSec = ref(0)
let timerHandle: ReturnType<typeof setInterval> | null = null
let heartbeatHandle: ReturnType<typeof setInterval> | null = null
let autoAdvanceHandle: ReturnType<typeof setTimeout> | null = null

function clearAutoAdvance() {
  if (autoAdvanceHandle) {
    clearTimeout(autoAdvanceHandle)
    autoAdvanceHandle = null
  }
}

/* ---------- 计算属性 ---------- */
const total = computed(() => questions.value.length)
const currentQuestion = computed(() => questions.value[current.value] || null)
const answeredCount = computed(() => Object.keys(answers.value).length)
const remainMin = computed(() => Math.floor(remainSec.value / 60))
const timeStr = computed(() => {
  const m = Math.floor(remainSec.value / 60)
  const s = remainSec.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})
const durationText = computed(() => {
  const sec = result.value?.duration || 0
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m}分${s}秒` : `${s}秒`
})
const wrongQuestions = computed(() => {
  if (!result.value?.questionResults) return []
  return result.value.questionResults.filter(q => !q.isCorrect)
})

const safeWrongCount = computed(() =>
  result.value?.wrongCount ?? (result.value ? result.value.totalCount - result.value.correctCount : 0)
)
const safeUnansweredCount = computed(() =>
  result.value?.unansweredCount ?? 0
)

/* ---------- 生命周期 ---------- */
onLoad((q: any) => {
  recordId.value = Number(q.recordId) || 0
  examId.value = Number(q.id) || Number(q.examId) || 0
  courseId.value = Number(q.courseId) || 0
  isFinal.value = q.final === '1'

  if (recordId.value) {
    loadFromRecord()
  } else if (examId.value) {
    loadData()
  } else {
    loading.value = false
  }
})

onUnload(() => {
  if (timerHandle) { clearInterval(timerHandle); timerHandle = null }
  if (heartbeatHandle) { clearInterval(heartbeatHandle); heartbeatHandle = null }
  clearAutoAdvance()
})

async function loadData() {
  try {
    const [exam, qs] = await Promise.all([
      getExamDetail(examId.value),
      getExamQuestions(examId.value),
    ])
    if (exam) {
      examTitle.value = exam.name
      examDurationMin.value = exam.duration
    }
    questions.value = qs
    if (qs.length > 0) {
      startTimer(exam?.duration || 90)
      nextTick(restoreQuestionState)
    }
  } catch {
    uni.showToast({ title: '数据加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

/** 从启动缓存加载（结课考试） */
async function loadFromRecord() {
  try {
    // 先检查缓存中是否有 startExam 返回的数据
    const startData = getExamStartData()
    if (startData && startData.recordId === recordId.value) {
      examTitle.value = '结课考试'
      questions.value = startData.questions
      examDurationMin.value = startData.duration
      clearExamStartData()
      if (startData.questions.length > 0) {
        startTimerFromEndTime(startData.endTime)
        startHeartbeat(recordId.value)
        nextTick(restoreQuestionState)
      }
    } else {
      // 缓存不存在（如页面被重建），尝试加载结果
      const resultData = await getExamResult(recordId.value)
      if (resultData) {
        result.value = resultData
        submitted.value = true
      } else {
        uni.showToast({ title: '考试数据加载失败', icon: 'none' })
      }
    }
  } catch {
    uni.showToast({ title: '数据加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

/** 基于 endTime 倒计时 */
function startTimerFromEndTime(endTime: string) {
  const end = new Date(endTime).getTime()
  const now = Date.now()
  remainSec.value = Math.max(0, Math.floor((end - now) / 1000))
  timerHandle = setInterval(() => {
    remainSec.value--
    if (remainSec.value <= 0) {
      if (timerHandle) { clearInterval(timerHandle); timerHandle = null }
      uni.showToast({ title: '时间到，自动交卷', icon: 'none' })
      doSubmit()
    }
  }, 1000)
}

/** 心跳 */
function startHeartbeat(rid: number) {
  heartbeatHandle = setInterval(() => {
    heartbeat(rid).catch(() => {})
  }, 30000)
}

/* ---------- 计时器 ---------- */
function startTimer(minutes: number) {
  remainSec.value = minutes * 60
  timerHandle = setInterval(() => {
    remainSec.value--
    if (remainSec.value <= 0) {
      if (timerHandle) { clearInterval(timerHandle); timerHandle = null }
      uni.showToast({ title: '时间到，自动交卷', icon: 'none' })
      doSubmit()
    }
  }, 1000)
}

/* ---------- 答案管理 ---------- */
function getAnswer(qId: number): string {
  return answers.value[qId] || ''
}

function saveCurrentAnswer() {
  const q = currentQuestion.value
  if (!q) return
  if (q.questionType === 1) {
    if (multiTemp.value.length > 0) answers.value[q.questionId] = multiTemp.value.join(',')
    else delete answers.value[q.questionId]
  } else if (q.questionType >= 3) {
    if (textTemp.value.trim()) answers.value[q.questionId] = textTemp.value
    else delete answers.value[q.questionId]
  }
}

function restoreQuestionState() {
  const q = currentQuestion.value
  if (!q) return
  if (q.questionType === 1) {
    const saved = answers.value[q.questionId]
    multiTemp.value = saved ? saved.split(',').filter(Boolean) : []
  } else if (q.questionType >= 3) {
    textTemp.value = answers.value[q.questionId] || ''
  } else {
    multiTemp.value = []
    textTemp.value = ''
  }
}

function advanceNext() {
  autoAdvanceHandle = null
  if (current.value < total.value - 1) {
    isAutoAdvancing.value = true
    current.value++
    nextTick(() => {
      isAutoAdvancing.value = false
      restoreQuestionState()
    })
  }
}

/* ---------- 作答交互 ---------- */
function answerRadio(qId: number, label: string) {
  answers.value[qId] = label
  clearAutoAdvance()
  autoAdvanceHandle = setTimeout(() => advanceNext(), 350)
}

function toggleMulti(label: string) {
  const i = multiTemp.value.indexOf(label)
  if (i >= 0) multiTemp.value.splice(i, 1)
  else multiTemp.value.push(label)
}

function confirmMulti(qId: number) {
  if (multiTemp.value.length === 0) return
  answers.value[qId] = multiTemp.value.join(',')
  clearAutoAdvance()
  autoAdvanceHandle = setTimeout(() => advanceNext(), 350)
}

function answerJudge(qId: number, label: string) {
  answers.value[qId] = label
  clearAutoAdvance()
  autoAdvanceHandle = setTimeout(() => advanceNext(), 350)
}

function confirmText(qId: number) {
  if (textTemp.value.trim()) answers.value[qId] = textTemp.value
  clearAutoAdvance()
  autoAdvanceHandle = setTimeout(() => advanceNext(), 350)
}

/* ---------- Swiper 切换 ---------- */
function onSwiperChange(e: any) {
  clearAutoAdvance()
  if (!isAutoAdvancing.value) saveCurrentAnswer()
  current.value = e.detail.current
  nextTick(restoreQuestionState)
}

/* ---------- 提交 ---------- */
async function doSubmit() {
  if (submitted.value || submitting.value) return
  submitting.value = true
  clearAutoAdvance()
  saveCurrentAnswer()
  if (timerHandle) { clearInterval(timerHandle); timerHandle = null }
  if (heartbeatHandle) { clearInterval(heartbeatHandle); heartbeatHandle = null }
  uni.showLoading({ title: '正在判分...', mask: true })
  try {
    const answerList = Object.entries(answers.value).map(([qId, ans]) => ({
      questionId: Number(qId),
      userAnswer: ans,
    }))
    const elapsed = examDurationMin.value * 60 - remainSec.value
    const submitData: any = {
      answers: answerList,
      duration: Math.max(0, elapsed),
    }
    if (recordId.value) {
      submitData.recordId = recordId.value
    } else {
      submitData.examId = examId.value
    }
    result.value = await submitExam(submitData)
    submitted.value = true
  } catch {
    uni.showToast({ title: '提交失败', icon: 'none' })
  } finally {
    submitting.value = false
    uni.hideLoading()
  }
}

function handleSubmit() {
  saveCurrentAnswer()
  uni.showModal({
    title: '提示',
    content: `已完成 ${answeredCount.value}/${total.value} 题，确定交卷吗？`,
    success: (res) => {
      if (res.confirm) doSubmit()
    },
  })
}

/* ---------- 导航 ---------- */
function goBack() {
  if (!submitted.value) {
    uni.showModal({
      title: '提示',
      content: '确定离开答题？作答记录将丢失。',
      success: (res) => {
        if (res.confirm) {
          if (timerHandle) { clearInterval(timerHandle); timerHandle = null }
          if (heartbeatHandle) { clearInterval(heartbeatHandle); heartbeatHandle = null }
          uni.navigateBack()
        }
      },
    })
  } else {
    uni.navigateBack().catch(() => uni.reLaunch({ url: '/pages/index/index' }))
  }
}

function goRetry() {
  // 返回考试详情页重新考试
  uni.navigateBack({ delta: 1 }).catch(() => {
    uni.reLaunch({ url: '/pages/index/index' })
  })
}

function goToList() {
  if (isFinal.value) {
    // 结课考试：返回详情页可重新考试
    uni.navigateBack({ delta: 1 }).catch(() => {
      uni.reLaunch({ url: '/pages/index/index' })
    })
  } else {
    uni.navigateBack({ delta: 2 }).catch(() => {
      uni.reLaunch({ url: '/pages/exam/online-test' })
    })
  }
}
</script>

<style scoped lang="scss">
.page { display: flex; flex-direction: column; height: 100vh; background: $bg-page; overflow: hidden; }

/* ===== 顶部导航 ===== */
.navbar { display: flex; align-items: center; padding: 12px 14px; padding-top: calc(12px + constant(safe-area-inset-top)); padding-top: calc(12px + env(safe-area-inset-top)); background: $bg-card; border-bottom: 1px solid $border; flex-shrink: 0; }
.back { width: 30px; height: 30px; border-radius: 50%; background: #f5f5f5; display: flex; align-items: center; justify-content: center; margin-right: 8px; flex-shrink: 0; }
.nav-title { flex: 1; font-size: 16px; font-weight: 600; color: $text-1; margin-right: 8px; }
.ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.timer { font-size: 14px; font-weight: 700; color: $text-1; flex-shrink: 0; min-width: 52px; text-align: right; }
.timer.urgent { color: $danger; animation: pulse 1s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

/* ===== 题型信息栏 ===== */
.type-bar { display: flex; align-items: center; padding: 8px 14px; background: $bg-card; border-bottom: 1px solid $border; flex-shrink: 0; gap: 10px; }
.type-tag { font-size: 10px; padding: 2px 10px; border-radius: 8px; font-weight: 500; white-space: nowrap; }
.type-progress { font-size: 12px; color: $text-3; flex: 1; }
.type-score { font-size: 12px; color: $text-2; font-weight: 600; }

/* ===== Swiper 区域 ===== */
.swiper-area { flex: 1; overflow: hidden; }
.q-scroll { height: 100%; padding: 12px; box-sizing: border-box; }

/* ===== 题目卡片 ===== */
.q-card { background: $bg-card; border-radius: 12px; box-shadow: $shadow-card; padding: 18px; }
.q-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.q-num { font-size: 16px; font-weight: 700; color: $primary; }
.q-score { font-size: 12px; color: $accent; font-weight: 600; }
.q-content { font-size: 15px; color: $text-1; line-height: 1.7; }

/* ===== 选项 ===== */
.options { margin-top: 16px; }
.option { display: flex; align-items: center; padding: 12px 14px; border: 1.5px solid $border; border-radius: 10px; margin-bottom: 10px; transition: all .15s; &:last-child { margin-bottom: 0; } }
.option.active { border-color: $primary; background: $primary-bg; }
.radio-outer { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #d0d5dd; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.option.active .radio-outer { border-color: $primary; }
.radio-inner { width: 10px; height: 10px; border-radius: 50%; background: $primary; }
.opt-text { flex: 1; margin-left: 10px; font-size: 14px; color: $text-1; line-height: 1.5; }
.checkbox { width: 20px; height: 20px; border-radius: 4px; border: 2px solid #d0d5dd; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.option.active .checkbox { background: $primary; border-color: $primary; }
.check-mark { color: #fff; font-size: 13px; font-weight: 700; }

/* ===== 确认作答 ===== */
.confirm-btn { margin-top: 12px; background: $gradient-primary; border-radius: 21px; display: flex; align-items: center; justify-content: center; padding: 10px 0; }
.confirm-btn text { color: #fff; font-size: 14px; font-weight: 600; }

/* ===== 判断题 ===== */
.judge-row { display: flex; gap: 14px; margin-top: 20px; }
.judge-btn { flex: 1; height: 100px; border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 2px solid $border; font-size: 16px; font-weight: 600; color: $text-1; transition: all .2s; }
.judge-btn.active { border-color: $primary; background: $primary-bg; color: $primary; }

/* ===== 文本输入 ===== */
.text-area { width: 100%; min-height: 100px; border: 1.5px solid $border; border-radius: 10px; padding: 12px; font-size: 14px; color: $text-1; line-height: 1.6; margin-top: 16px; box-sizing: border-box; }

/* ===== 底部操作栏 ===== */
.bottom-bar { display: flex; align-items: center; justify-content: space-between; padding: 8px 14px; padding-bottom: calc(8px + constant(safe-area-inset-bottom)); padding-bottom: calc(8px + env(safe-area-inset-bottom)); background: $bg-card; border-top: 1px solid $border; flex-shrink: 0; }
.done-info { font-size: 13px; color: $text-3; }
.submit-btn { background: $gradient-primary; border-radius: 21px; padding: 8px 28px; color: #fff; font-size: 14px; font-weight: 600; text-align: center; }

/* ===== 结果页 ===== */
.result-scroll { flex: 1; padding: 16px 14px 40px; }
.score-card { background: $bg-card; border-radius: 14px; box-shadow: $shadow-card; padding: 28px 18px; display: flex; flex-direction: column; align-items: center; }
.score-circle { width: 100px; height: 100px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 12px; }
.score-circle.pass { background: linear-gradient(135deg, #10b981, #34d399); }
.score-circle.fail { background: linear-gradient(135deg, #f59e0b, #f97316); }
.score-num { font-size: 36px; font-weight: 800; color: #fff; line-height: 1; }
.score-unit { font-size: 14px; color: rgba(255,255,255,0.9); margin-top: 2px; }
.pass-text { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
.pass-text.pass { color: #10b981; }
.pass-text.fail { color: #f59e0b; }
.pass-hint { font-size: 12px; color: $text-3; }

/* ===== 统计行 ===== */
.stats-row { display: flex; align-items: center; background: $bg-card; border-radius: 12px; box-shadow: $shadow-card; padding: 16px 0; margin-top: 12px; }
.stat-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.stat-num { font-size: 22px; font-weight: 800; }
.stat-num.correct { color: #10b981; }
.stat-num.wrong { color: $danger; }
.stat-num.unanswered { color: $text-3; }
.stat-num.time { color: $primary; font-size: 16px; }
.stat-label { font-size: 12px; color: $text-3; }
.stat-divider { width: 1px; height: 30px; background: $border; flex-shrink: 0; }

/* ===== 庆祝 ===== */
.celebration { background: $bg-card; border-radius: 12px; box-shadow: $shadow-card; padding: 20px; margin-top: 12px; }

/* ===== 错题解析 ===== */
.analysis-title { font-size: 16px; font-weight: 700; color: $text-1; margin-top: 20px; margin-bottom: 12px; padding-left: 2px; }
.analysis-card { background: $bg-card; border-radius: 12px; box-shadow: $shadow-card; padding: 16px; margin-bottom: 12px; }
.analysis-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.aq-index { font-size: 14px; font-weight: 700; color: $text-1; }
.aq-type { font-size: 10px; padding: 2px 10px; border-radius: 8px; font-weight: 500; }
.aq-content { font-size: 14px; color: $text-1; line-height: 1.6; margin-bottom: 10px; }
.aq-row { display: flex; align-items: flex-start; margin-bottom: 6px; font-size: 13px; }
.aq-label { color: $text-3; width: 70px; flex-shrink: 0; }
.aq-value { color: $text-2; flex: 1; line-height: 1.5; }
.wrong-text { color: $danger; font-weight: 600; }
.correct-text { color: #10b981; font-weight: 600; }
.aq-analysis { padding: 10px 12px; background: #f8f9fa; border-radius: 8px; margin-top: 8px; }
.aq-analysis .aq-label { display: block; margin-bottom: 4px; }
.aq-analysis .aq-value { font-size: 13px; color: $text-2; line-height: 1.6; }

/* ===== 结果页底部按钮 ===== */
.result-action { padding: 20px 0 30px; display: flex; flex-direction: column; gap: 10px; }
.back-btn { background: $gradient-primary; border-radius: 21px; padding: 12px 0; text-align: center; color: #fff; font-size: 15px; font-weight: 600; }
.retry-btn { background: $accent; border-radius: 21px; padding: 12px 0; text-align: center; color: #fff; font-size: 15px; font-weight: 600; }
</style>
