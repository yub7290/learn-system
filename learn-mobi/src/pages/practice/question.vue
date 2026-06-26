<template>
  <view class="review-page">
    <!-- ====== 顶部导航栏 ====== -->
    <view class="page-header">
      <view class="header-left">
        <view class="back-btn" @click="goBack">
          <u-icon name="arrow-left" color="#333" size="20"></u-icon>
        </view>
        <text class="page-title">{{ pageTitle }}</text>
      </view>
      <view class="header-right">
        <text class="progress-text">{{ currentIndex + 1 }}/{{ questions.length }}</text>
        <view class="card-btn" @click="showCardModal = true">
          <u-icon name="grid" color="#fff" size="12"></u-icon>
          <text>答题卡</text>
        </view>
      </view>
    </view>

    <!-- ====== 模式切换 ====== -->
    <view class="mode-tabs">
      <view
        class="mode-tab"
        :class="{ active: mode === 'answer' }"
        @click="switchMode('answer')"
      >
        <text>答题模式</text>
      </view>
      <view
        class="mode-tab"
        :class="{ active: mode === 'recite' }"
        @click="switchMode('recite')"
      >
        <text>背题模式</text>
      </view>
    </view>

    <!-- ====== 题目内容区域 ====== -->
    <scroll-view scroll-y class="page-scroll" v-if="currentQuestion">
      <view class="question-card">
        <!-- 题目头：类型标签 + 收藏 -->
        <view class="question-header">
          <view class="question-type" :style="{ background: getTypeBg(currentQuestion.questionType), color: getTypeColor(currentQuestion.questionType) }">
            <text>{{ typeLabel }}</text>
          </view>
          <view class="collect-btn" :class="{ collected: currentQuestion.favorited }" @click="toggleCollect">
            <u-icon :name="currentQuestion.favorited ? 'star-fill' : 'star'" :color="currentQuestion.favorited ? '#ff9800' : '#ccc'" size="16"></u-icon>
            <text>{{ currentQuestion.favorited ? '已收藏' : '收藏' }}</text>
          </view>
        </view>

        <!-- 题目正文 -->
        <view class="question-stem">
          <rich-text :nodes="stemNodes"></rich-text>
        </view>

        <!-- ====== 单选题 ====== -->
        <view v-if="currentQuestion.questionType === 0" class="option-list">
          <view
            class="option-item"
            :class="getOptionClass(opt.label)"
            v-for="opt in currentQuestion.options"
            :key="opt.id"
            @click="selectOption(opt.label)"
          >
            <view class="option-key">
              <text>{{ opt.label }}</text>
            </view>
            <text class="option-content">{{ opt.content }}</text>
            <view class="option-icon" v-if="showResult">
              <u-icon v-if="opt.isCorrect" name="checkmark-circle" color="#07c160" size="16"></u-icon>
              <u-icon v-else-if="opt.label === userAnswer && !opt.isCorrect" name="close-circle" color="#f56c6c" size="16"></u-icon>
            </view>
          </view>
        </view>

        <!-- ====== 多选题 ====== -->
        <view v-if="currentQuestion.questionType === 1" class="option-list">
          <view
            class="option-item"
            :class="multiOptionClass(opt.label)"
            v-for="opt in currentQuestion.options"
            :key="opt.id"
            @click="toggleMultiOption(opt.label)"
          >
            <view class="option-key multi-key">
              <text v-if="multiSelected.includes(opt.label)">&#10003;</text>
            </view>
            <text class="option-content">{{ opt.content }}</text>
            <view class="option-icon" v-if="showResult">
              <u-icon v-if="opt.isCorrect" name="checkmark-circle" color="#07c160" size="16"></u-icon>
              <u-icon v-else-if="multiSelected.includes(opt.label) && !opt.isCorrect" name="close-circle" color="#f56c6c" size="16"></u-icon>
            </view>
          </view>
          <view v-if="currentQuestion.questionType === 1 && !showResult && multiSelected.length > 0" class="confirm-btn" @click="confirmMultiAnswer">
            <text>确定作答</text>
          </view>
        </view>

        <!-- ====== 判断题 ====== -->
        <view v-if="currentQuestion.questionType === 2" class="judge-row">
          <view
            class="judge-btn"
            :class="getJudgeClass('正确')"
            @click="selectOption('正确')"
          >
            <u-icon name="checkmark-circle" :color="getJudgeIconColor('正确')" size="18"></u-icon>
            <text>正确</text>
          </view>
          <view
            class="judge-btn"
            :class="getJudgeClass('错误')"
            @click="selectOption('错误')"
          >
            <u-icon name="close-circle" :color="getJudgeIconColor('错误')" size="18"></u-icon>
            <text>错误</text>
          </view>
        </view>

        <!-- ====== 主观题（填空/简答） ====== -->
        <view v-if="currentQuestion.questionType >= 3">
          <textarea
            v-model="textAnswer"
            class="text-area"
            placeholder="请输入答案..."
            :disabled="showResult"
          />
          <view v-if="!showResult && textAnswer.trim()" class="confirm-btn" @click="submitTextAnswer">
            <text>确定作答</text>
          </view>
        </view>

        <!-- ====== 答案解析区（仅作答后/背题模式显示） ====== -->
        <view class="analysis-box" v-if="showResult">
          <!-- 对错反馈 -->
          <view class="feedback-row" :class="isAnswerCorrect ? 'correct' : 'wrong'">
            <u-icon :name="isAnswerCorrect ? 'checkmark-circle' : 'close-circle'" :color="isAnswerCorrect ? '#07c160' : '#f56c6c'" size="18"></u-icon>
            <text>{{ isAnswerCorrect ? '回答正确' : '回答错误' }}</text>
          </view>

          <!-- 正确答案 -->
          <view class="analysis-row" v-if="correctAnswerText">
            <text class="analysis-label">正确答案：</text>
            <text class="analysis-answer">{{ correctAnswerText }}</text>
          </view>

          <!-- 解析 -->
          <view class="analysis-row" v-if="currentQuestion.analysis">
            <text class="analysis-label">解析：</text>
            <text class="analysis-text">{{ currentQuestion.analysis }}</text>
          </view>

          <!-- 我的笔记 -->
          <view class="note-section" v-if="localNote">
            <view class="note-header">
              <text class="note-title">
                <u-icon name="edit-pen" color="#f59e0b" size="12"></u-icon>
                <text> 我的笔记</text>
              </text>
              <text class="note-edit" @click.stop="openNote">编辑</text>
            </view>
            <text class="note-content">{{ localNote }}</text>
          </view>
          <view class="add-note-btn" v-else @click="openNote">
            <u-icon name="edit-pen" color="#07c160" size="12"></u-icon>
            <text> 添加笔记</text>
          </view>
        </view>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 加载/空状态 -->
    <view class="center-status" v-if="loading">
      <u-loading-icon mode="circle" size="36"></u-loading-icon>
    </view>
    <u-empty v-else-if="!questions.length" text="暂无题目" mode="list" margin-top="60"></u-empty>

    <!-- ====== 底部操作栏 ====== -->
    <view class="bottom-bar" v-if="questions.length">
      <view class="bar-btn" :class="{ disabled: currentIndex === 0 }" @click="prevQuestion">
        <u-icon name="arrow-left" :color="currentIndex === 0 ? '#ccc' : '#666'" size="14"></u-icon>
        <text>上一题</text>
      </view>

      <view class="bar-btn primary" @click="handleFinish">
        <text>完成</text>
      </view>

      <view class="bar-btn" :class="{ disabled: currentIndex >= questions.length - 1 }" @click="nextQuestion">
        <text>下一题</text>
        <u-icon name="arrow-right" :color="currentIndex >= questions.length - 1 ? '#ccc' : '#666'" size="14"></u-icon>
      </view>
    </view>

    <!-- ====== 笔记弹窗 ====== -->
    <view class="modal-mask" v-if="showNoteModal" @click="showNoteModal = false">
      <view class="note-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">笔记</text>
          <view class="modal-close" @click="showNoteModal = false">
            <u-icon name="close" color="#999" size="14"></u-icon>
          </view>
        </view>
        <textarea
          class="note-input"
          v-model="draftNote"
          placeholder="记录你的解题思路、易错点、知识点总结..."
          maxlength="500"
          auto-height
        />
        <view class="modal-footer">
          <view class="modal-btn cancel" @click="showNoteModal = false">
            <text>取消</text>
          </view>
          <view class="modal-btn confirm" @click="saveNote">
            <text>保存笔记</text>
          </view>
        </view>
      </view>
    </view>

    <!-- ====== 答题卡弹窗 ====== -->
    <view class="modal-mask" v-if="showCardModal" @click="showCardModal = false">
      <view class="card-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">答题卡</text>
          <view class="modal-close" @click="showCardModal = false">
            <u-icon name="close" color="#999" size="14"></u-icon>
          </view>
        </view>
        <view class="card-stats">
          <text>共 {{ questions.length }} 道题</text>
          <text>已做 {{ answeredCount }} 道</text>
        </view>
        <view class="card-grid">
          <view
            class="card-num"
            :class="getCardClass(index)"
            v-for="(item, index) in questions"
            :key="item.id"
            @click="jumpToQuestion(index)"
          >
            <text>{{ index + 1 }}</text>
          </view>
        </view>
        <view class="card-legend">
          <view class="legend-item">
            <view class="legend-dot correct"></view>
            <text>答对</text>
          </view>
          <view class="legend-item">
            <view class="legend-dot wrong"></view>
            <text>答错</text>
          </view>
          <view class="legend-item">
            <view class="legend-dot undone"></view>
            <text>未做</text>
          </view>
          <view class="legend-item">
            <view class="legend-dot collected"></view>
            <text>已收藏</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getPracticeQuestions, submitAnswer, toggleFavorite, createNote } from '../../api/practice'
import type { PracticeQuestionVO } from '../../types/practice'

/* ====== 类型/颜色映射 ====== */
const typeLabels: Record<number, string> = { 0: '单选题', 1: '多选题', 2: '判断题', 3: '填空题', 4: '简答题' }
const typeColors: Record<number, string> = { 0: '#0195ff', 1: '#f59e0b', 2: '#10b981', 3: '#8b5cf6', 4: '#ec4899' }
const pageTitles: Record<number, string> = { 1: '试题练习', 2: '错题回顾', 3: '我的收藏', 4: '高频错题' }

function getTypeBg(t: number) { return (typeColors[t] || '#999') + '18' }
function getTypeColor(t: number) { return typeColors[t] ?? '#999' }

/* ====== 页面参数 ====== */
const courseId = ref(0)
const chapterId = ref(0)
const practiceMode = ref(1) // 1=章节练习 2=错题 3=收藏 4=高频错题
const questions = ref<PracticeQuestionVO[]>([])
const currentIndex = ref(0)
const loading = ref(true)
const mode = ref<'answer' | 'recite'>('answer')
const showCardModal = ref(false)
const showNoteModal = ref(false)
const draftNote = ref('')

/* ====== 答案状态（本地跟踪） ====== */
interface AnswerState {
  answer: string
  correct: boolean
  submitted: boolean
}
const answerMap = ref<Record<number, AnswerState>>({})

const selAnswer = ref('')
const multiSelected = ref<string[]>([])
const textAnswer = ref('')
const localNote = ref('')

/* ====== 计算属性 ====== */
const currentQuestion = computed(() => questions.value[currentIndex.value] || null)
const pageTitle = computed(() => pageTitles[practiceMode.value] || '答题')
const typeLabel = computed(() => {
  const q = currentQuestion.value
  return q ? (typeLabels[q.questionType] || '未知') : ''
})

const showResult = computed(() => {
  if (mode.value === 'recite') return true
  const q = currentQuestion.value
  return !!q && answerMap.value[q.id]?.submitted
})

const userAnswer = computed(() => {
  const q = currentQuestion.value
  if (!q) return ''
  return answerMap.value[q.id]?.answer || ''
})

const isAnswerCorrect = computed(() => {
  const q = currentQuestion.value
  return !!q && answerMap.value[q.id]?.correct === true
})

const correctAnswerText = computed(() => {
  const q = currentQuestion.value
  if (!q) return ''
  const correctOpts = q.options.filter(o => o.isCorrect)
  if (q.questionType === 0) return correctOpts.map(o => o.label).join('、')
  if (q.questionType === 1) return correctOpts.map(o => o.label).join('、')
  if (q.questionType === 2) return correctOpts[0]?.content || ''
  return correctOpts.map(o => `${o.label}. ${o.content}`).join('；')
})

const answeredCount = computed(() => {
  return Object.values(answerMap.value).filter(s => s.submitted).length
})

const stemNodes = computed(() => {
  const q = currentQuestion.value
  return q?.content || ''
})

/* ====== 生命周期 ====== */
onLoad((query: any) => {
  courseId.value = Number(query.courseId) || 0
  chapterId.value = Number(query.chapterId) || 0
  practiceMode.value = Number(query.practiceMode) || 1
  if (courseId.value) loadQuestions()
  else {
    loading.value = false
    uni.showToast({ title: '参数错误', icon: 'none' })
  }
})

async function loadQuestions() {
  loading.value = true
  try {
    const data = await getPracticeQuestions(courseId.value, chapterId.value || undefined, practiceMode.value)
    questions.value = data
    if (!data || data.length === 0) {
      questions.value = getMockQuestions()
    }
    if (questions.value.length) {
      nextTick(restoreQuestionState)
    }
  } catch {
    questions.value = getMockQuestions()
    if (questions.value.length) {
      nextTick(restoreQuestionState)
    }
  } finally {
    loading.value = false
  }
}

/* ====== 模式切换 ====== */
function switchMode(type: 'answer' | 'recite') {
  mode.value = type
}

/* ====== 选项交互 ====== */
function selectOption(label: string) {
  if (mode.value === 'recite') return
  const q = currentQuestion.value
  if (!q || answerMap.value[q.id]?.submitted) return

  selAnswer.value = label
  submitCurrentAnswer(label)
}

function toggleMultiOption(label: string) {
  if (mode.value === 'recite') return
  const q = currentQuestion.value
  if (!q || answerMap.value[q.id]?.submitted) return

  const idx = multiSelected.value.indexOf(label)
  if (idx >= 0) multiSelected.value.splice(idx, 1)
  else multiSelected.value.push(label)
}

function confirmMultiAnswer() {
  if (multiSelected.value.length === 0) return
  const q = currentQuestion.value
  if (!q) return
  const ans = [...multiSelected.value].sort().join(',')
  submitCurrentAnswer(ans)
}

function submitTextAnswer() {
  if (!textAnswer.value.trim()) return
  submitCurrentAnswer(textAnswer.value)
}

/* ====== 提交答案 ====== */
async function submitCurrentAnswer(answer: string) {
  const q = currentQuestion.value
  if (!q) return

  let isCorrect = false
  if (q.questionType === 0) {
    const correctOpt = q.options.find(o => o.isCorrect)
    isCorrect = correctOpt ? answer === correctOpt.label : false
  } else if (q.questionType === 1) {
    const correctLabels = q.options.filter(o => o.isCorrect).map(o => o.label).sort()
    const userLabels = answer.split(',').filter(Boolean).sort()
    isCorrect = correctLabels.length === userLabels.length && correctLabels.every((v, i) => v === userLabels[i])
  } else if (q.questionType === 2) {
    const correctOpt = q.options.find(o => o.isCorrect)
    isCorrect = correctOpt ? answer === correctOpt.content : false
  }

  answerMap.value[q.id] = { answer, correct: isCorrect, submitted: true }

  try {
    await submitAnswer({
      courseId: courseId.value,
      chapterId: q.chapterId || chapterId.value,
      questionId: q.id,
      userAnswer: answer,
      isCorrect: isCorrect ? 1 : 0,
      answerDuration: 0,
      practiceMode: practiceMode.value,
    })
  } catch {
    // 静默
  }
}

/* ====== 收藏 ====== */
async function toggleCollect() {
  const q = currentQuestion.value
  if (!q) return
  try {
    const r = await toggleFavorite({ courseId: courseId.value, questionId: q.id })
    q.favorited = r.favorited
    uni.showToast({ title: q.favorited ? '已收藏' : '已取消收藏', icon: 'none' })
  } catch {
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

/* ====== 笔记 ====== */
function openNote() {
  if (mode.value === 'answer' && !showResult.value) {
    uni.showToast({ title: '作答后可添加笔记', icon: 'none' })
    return
  }
  draftNote.value = localNote.value
  showNoteModal.value = true
}

async function saveNote() {
  const q = currentQuestion.value
  if (!q) return
  localNote.value = draftNote.value
  showNoteModal.value = false
  uni.showToast({ title: '笔记已保存', icon: 'success' })
  try {
    await createNote({ courseId: courseId.value, questionId: q.id, noteContent: draftNote.value })
  } catch {
    // 本地保存
  }
}

/* ====== 导航 ====== */
function prevQuestion() {
  if (currentIndex.value === 0) return
  currentIndex.value--
  nextTick(restoreQuestionState)
}

function nextQuestion() {
  if (currentIndex.value >= questions.value.length - 1) return
  currentIndex.value++
  nextTick(restoreQuestionState)
}

function jumpToQuestion(index: number) {
  currentIndex.value = index
  showCardModal.value = false
  nextTick(restoreQuestionState)
}

function handleFinish() {
  uni.showModal({
    title: '练习结束',
    content: `已完成 ${answeredCount.value}/${questions.value.length} 题，确定结束吗？`,
    success: (res) => { if (res.confirm) goBack() },
  })
}

function goBack() {
  uni.navigateBack().catch(() => uni.reLaunch({ url: '/pages/index/index' }))
}

function restoreQuestionState() {
  const q = currentQuestion.value
  if (!q) return
  const ans = answerMap.value[q.id]
  localNote.value = ''

  if (ans?.submitted) {
    if (q.questionType === 1) multiSelected.value = ans.answer.split(',').filter(Boolean)
    else if (q.questionType >= 3) textAnswer.value = ans.answer
    else selAnswer.value = ans.answer
  } else {
    selAnswer.value = ''
    multiSelected.value = []
    textAnswer.value = ''
  }
}

/* ====== 样式辅助方法 ====== */
function getOptionClass(label: string): string {
  const q = currentQuestion.value
  if (!q) return ''
  const classes: string[] = []
  if (mode.value === 'recite') {
    if (q.options.find(o => o.label === label && o.isCorrect)) classes.push('correct')
  } else if (showResult.value) {
    if (q.options.find(o => o.label === label && o.isCorrect)) classes.push('correct')
    else if (label === userAnswer.value) classes.push('wrong')
  } else {
    if (label === selAnswer.value) classes.push('active')
  }
  return classes.join(' ')
}

function multiOptionClass(label: string): string {
  const q = currentQuestion.value
  if (!q) return ''
  const classes: string[] = []
  if (mode.value === 'recite') {
    if (q.options.find(o => o.label === label && o.isCorrect)) classes.push('correct')
  } else if (showResult.value) {
    if (multiSelected.value.includes(label)) {
      const opt = q.options.find(o => o.label === label)
      if (opt?.isCorrect) classes.push('correct')
      else classes.push('wrong')
    } else if (q.options.find(o => o.label === label && o.isCorrect)) {
      classes.push('correct')
    }
  } else {
    if (multiSelected.value.includes(label)) classes.push('active')
  }
  return classes.join(' ')
}

function getJudgeClass(label: string): string {
  const q = currentQuestion.value; if (!q) return ''
  const correctOpt = q.options.find(o => o.isCorrect); const isCorrectLabel = correctOpt?.content === label
  const classes: string[] = []
  if (mode.value === 'recite' && isCorrectLabel) classes.push('correct')
  else if (showResult.value) {
    if (isCorrectLabel) classes.push('correct')
    else if (selAnswer.value === label) classes.push('wrong')
  } else if (selAnswer.value === label) classes.push('active')
  return classes.join(' ')
}

function getJudgeIconColor(label: string): string {
  const q = currentQuestion.value; if (!q) return '#666'
  const correctOpt = q.options.find(o => o.isCorrect); const isCorrectLabel = correctOpt?.content === label
  if (showResult.value || mode.value === 'recite') {
    if (isCorrectLabel) return '#07c160'
    if (selAnswer.value === label && !isCorrectLabel) return '#f56c6c'
  }
  if (selAnswer.value === label) return '#0195ff'
  return '#d0d5dd'
}

function getCardClass(index: number): string {
  const q = questions.value[index]; if (!q) return ''
  const classes: string[] = []
  if (index === currentIndex.value) classes.push('current')
  const ans = answerMap.value[q.id]
  if (!ans?.submitted) classes.push('undone')
  else if (ans.correct) classes.push('correct')
  else classes.push('wrong')
  if (q.favorited) classes.push('collected')
  return classes.join(' ')
}

/* ====== Mock 数据 ====== */
function getMockQuestions(): PracticeQuestionVO[] {
  const cid = courseId.value; const chid = chapterId.value || 1
  return [
    { id: 1, questionType: 0, difficulty: 3, favorited: true, content: '计算 1/2 + 1/3 的结果，正确的是？', knowledgePoints: '分数运算', currentIndex: 0, totalCount: 6, practiceMode: 1, courseId: cid, chapterId: chid, analysis: '异分母分数相加，先通分，找到分母2和3的最小公倍数6，转化为同分母分数：3/6 + 2/6 = 5/6。注意不能直接分子分母分别相加。', options: [{ id: 101, questionId: 1, label: 'A', content: '2/5', isCorrect: 0, sort: 1 }, { id: 102, questionId: 1, label: 'B', content: '5/6', isCorrect: 1, sort: 2 }, { id: 103, questionId: 1, label: 'C', content: '1/6', isCorrect: 0, sort: 3 }, { id: 104, questionId: 1, label: 'D', content: '2/3', isCorrect: 0, sort: 4 }] },
    { id: 2, questionType: 0, difficulty: 4, favorited: false, content: '一件商品原价100元，先涨价10%，再降价10%，现价是多少元？', knowledgePoints: '百分数', currentIndex: 1, totalCount: 6, practiceMode: 1, courseId: cid, chapterId: chid, analysis: '涨价10%后价格为 100×(1+10%)=110元；再降价10%，是在110元基础下降价：110×(1-10%)=99元。注意两次变化的单位"1"不同。', options: [{ id: 201, questionId: 2, label: 'A', content: '100元', isCorrect: 0, sort: 1 }, { id: 202, questionId: 2, label: 'B', content: '99元', isCorrect: 1, sort: 2 }, { id: 203, questionId: 2, label: 'C', content: '101元', isCorrect: 0, sort: 3 }, { id: 204, questionId: 2, label: 'D', content: '98元', isCorrect: 0, sort: 4 }] },
    { id: 3, questionType: 1, difficulty: 3, favorited: false, content: '以下哪些数是质数？', knowledgePoints: '质数与合数', currentIndex: 2, totalCount: 6, practiceMode: 1, courseId: cid, chapterId: chid, analysis: '质数是指大于1的自然数中，除了1和它本身以外不再有其他因数的数。2、3、5、7都是质数，4和6是合数。', options: [{ id: 301, questionId: 3, label: 'A', content: '2', isCorrect: 1, sort: 1 }, { id: 302, questionId: 3, label: 'B', content: '4', isCorrect: 0, sort: 2 }, { id: 303, questionId: 3, label: 'C', content: '5', isCorrect: 1, sort: 3 }, { id: 304, questionId: 3, label: 'D', content: '6', isCorrect: 0, sort: 4 }] },
    { id: 4, questionType: 2, difficulty: 2, favorited: false, content: '0既不是正数也不是负数。', knowledgePoints: '数的认识', currentIndex: 3, totalCount: 6, practiceMode: 1, courseId: cid, chapterId: chid, analysis: '0是正数和负数的分界点，它既不是正数也不是负数，是正确的。', options: [{ id: 401, questionId: 4, label: 'A', content: '正确', isCorrect: 1, sort: 1 }, { id: 402, questionId: 4, label: 'B', content: '错误', isCorrect: 0, sort: 2 }] },
    { id: 5, questionType: 0, difficulty: 5, favorited: false, content: '甲数的 3/4 等于乙数的 2/3（甲乙均不为0），则甲乙两数的大小关系是？', knowledgePoints: '分数比较', currentIndex: 4, totalCount: 6, practiceMode: 1, courseId: cid, chapterId: chid, analysis: '由题意得：甲×3/4 = 乙×2/3。乘积相等时，一个因数越大，另一个因数越小。比较3/4和2/3：3/4=9/12，2/3=8/12，3/4更大，所以甲更小。', options: [{ id: 501, questionId: 5, label: 'A', content: '甲 > 乙', isCorrect: 0, sort: 1 }, { id: 502, questionId: 5, label: 'B', content: '甲 < 乙', isCorrect: 1, sort: 2 }, { id: 503, questionId: 5, label: 'C', content: '甲 = 乙', isCorrect: 0, sort: 3 }, { id: 504, questionId: 5, label: 'D', content: '无法确定', isCorrect: 0, sort: 4 }] },
    { id: 6, questionType: 2, difficulty: 3, favorited: false, content: '一个三角形的内角和是360度。', knowledgePoints: '三角形', currentIndex: 5, totalCount: 6, practiceMode: 1, courseId: cid, chapterId: chid, analysis: '三角形的内角和恒为180度，360度是四边形的内角和。', options: [{ id: 601, questionId: 6, label: 'A', content: '正确', isCorrect: 0, sort: 1 }, { id: 602, questionId: 6, label: 'B', content: '错误', isCorrect: 1, sort: 2 }] },
  ]
}
</script>

<style scoped lang="scss">
.review-page {
  width: 100%; height: 100vh;
  display: flex; flex-direction: column;
  overflow: hidden; background: $bg-page;
}

/* ====== 顶部导航 ====== */
.page-header {
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 12rpx 30rpx;
  padding-top: calc(12rpx + constant(safe-area-inset-top));
  padding-top: calc(12rpx + env(safe-area-inset-top));
  background: $bg-card; border-bottom: 1rpx solid $border;
}
.header-left { display: flex; align-items: center; gap: 12rpx; }
.back-btn { width: 56rpx; height: 56rpx; border-radius: 50%; background: #f5f5f5; display: flex; align-items: center; justify-content: center; }
.page-title { font-size: 32rpx; font-weight: 600; color: $text-1; }
.header-right { display: flex; align-items: center; gap: 20rpx; }
.progress-text { font-size: 24rpx; color: $text-3; }
.card-btn { display: flex; align-items: center; gap: 4rpx; padding: 8rpx 20rpx; background: $gradient-primary; color: #fff; font-size: 22rpx; border-radius: 24rpx; }

/* ====== 模式切换 ====== */
.mode-tabs {
  flex-shrink: 0; display: flex; gap: 16rpx;
  padding: 16rpx 24rpx; background: $bg-card; border-bottom: 1rpx solid $border;
}
.mode-tab {
  flex: 1; height: 60rpx; display: flex; align-items: center; justify-content: center;
  border-radius: 8rpx; font-size: 26rpx; color: $text-3; background: $bg-page;
}
.mode-tab.active { background: $gradient-primary; color: #fff; font-weight: 500; }

/* ====== 题目滚动区 ====== */
.page-scroll { flex: 1; width: 100%; height: 0; padding: 20rpx; padding-bottom: 120rpx; box-sizing: border-box; }
.center-status { flex: 1; display: flex; align-items: center; justify-content: center; }

/* ====== 题目卡片 ====== */
.question-card { width: 100%; background: $bg-card; border-radius: 14rpx; padding: 28rpx 24rpx; box-sizing: border-box; box-shadow: $shadow-card; }
.question-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24rpx; }
.question-type { padding: 6rpx 16rpx; font-size: 22rpx; border-radius: 6rpx; font-weight: 500; }
.collect-btn { display: flex; align-items: center; gap: 4rpx; font-size: 24rpx; color: $text-3; }
.collect-btn.collected { color: #ff9800; }
.question-stem { font-size: 30rpx; color: $text-1; line-height: 1.7; margin-bottom: 32rpx; font-weight: 500; }

/* ====== 选项列表 ====== */
.option-list { display: flex; flex-direction: column; gap: 20rpx; margin-bottom: 32rpx; }
.option-item { display: flex; align-items: center; gap: 20rpx; padding: 22rpx 20rpx; background: $bg-page; border: 2rpx solid $border; border-radius: 12rpx; transition: all 0.2s; }
.option-item.active { background: $primary-bg; border-color: $primary; }
.option-item.correct { background: #f0fff0; border-color: #52c41a; }
.option-item.wrong { background: #fff0f0; border-color: $danger; }
.option-key { width: 48rpx; height: 48rpx; border-radius: 50%; background: $bg-card; border: 2rpx solid #d0d5dd; display: flex; align-items: center; justify-content: center; font-size: 26rpx; color: $text-3; flex-shrink: 0; }
.option-item.active .option-key { background: $primary; border-color: $primary; color: #fff; }
.option-item.correct .option-key { background: #52c41a; border-color: #52c41a; color: #fff; }
.option-item.wrong .option-key { background: $danger; border-color: $danger; color: #fff; }
.multi-key { border-radius: 6rpx; font-size: 22rpx; }
.option-content { flex: 1; font-size: 28rpx; color: $text-1; line-height: 1.5; }
.option-icon { width: 36rpx; height: 36rpx; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.confirm-btn { margin-top: 20rpx; background: $gradient-primary; border-radius: 21rpx; display: flex; align-items: center; justify-content: center; padding: 18rpx 0; text { color: #fff; font-size: 28rpx; font-weight: 600; } }

/* ====== 判断题 ====== */
.judge-row { display: flex; gap: 20rpx; margin-top: 24rpx; margin-bottom: 32rpx; }
.judge-btn { flex: 1; height: 120rpx; border-radius: 14rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8rpx; border: 2rpx solid $border; font-size: 28rpx; font-weight: 600; color: $text-1; }
.judge-btn.active { border-color: $primary; background: $primary-bg; color: $primary; }
.judge-btn.correct { background: #f0fff0; border-color: #52c41a; color: #52c41a; }
.judge-btn.wrong { background: #fff0f0; border-color: $danger; color: $danger; }

/* ====== 文本输入 ====== */
.text-area { width: 100%; min-height: 140rpx; border: 2rpx solid $border; border-radius: 12rpx; padding: 20rpx; font-size: 28rpx; color: $text-1; line-height: 1.6; margin-top: 20rpx; box-sizing: border-box; }

/* ====== 答案解析区域 ====== */
.analysis-box { padding: 24rpx; background: #f8f9fa; border-radius: 12rpx; border-left: 6rpx solid #52c41a; }
.feedback-row { display: flex; align-items: center; gap: 8rpx; padding: 14rpx 18rpx; border-radius: 8rpx; font-size: 26rpx; font-weight: 600; margin-bottom: 20rpx; }
.feedback-row.correct { background: #f0fff0; color: #52c41a; }
.feedback-row.wrong { background: #fff0f0; color: $danger; }
.analysis-row { display: flex; margin-bottom: 16rpx; line-height: 1.6; font-size: 26rpx; }
.analysis-label { color: $text-2; font-weight: 500; flex-shrink: 0; margin-right: 8rpx; }
.analysis-answer { color: #52c41a; font-weight: 600; }
.analysis-text { color: $text-2; flex: 1; }

/* ====== 笔记区域 ====== */
.note-section { margin-top: 20rpx; padding-top: 20rpx; border-top: 1rpx dashed #d0d5dd; }
.note-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12rpx; }
.note-title { font-size: 26rpx; font-weight: 500; color: $text-1; }
.note-edit { font-size: 24rpx; color: $primary; }
.note-content { font-size: 26rpx; color: $text-2; line-height: 1.6; background: #fffbe6; padding: 16rpx; border-radius: 8rpx; }
.add-note-btn { margin-top: 20rpx; padding-top: 20rpx; border-top: 1rpx dashed #d0d5dd; font-size: 26rpx; color: #07c160; text-align: center; }

/* ====== 底部操作栏 ====== */
.bottom-bar { position: fixed; left: 0; bottom: 0; width: 100%; height: 100rpx; padding-bottom: constant(safe-area-inset-bottom); padding-bottom: env(safe-area-inset-bottom); background: $bg-card; border-top: 1rpx solid $border; display: flex; align-items: center; box-sizing: border-box; z-index: 100; }
.bar-btn { flex: 1; height: 100%; display: flex; align-items: center; justify-content: center; gap: 6rpx; font-size: 28rpx; color: $text-2; }
.bar-btn.primary { color: $primary; font-weight: 600; font-size: 30rpx; border-left: 1rpx solid $border; border-right: 1rpx solid $border; }
.bar-btn.disabled { color: #ccc; }

/* ====== 弹窗通用 ====== */
.modal-mask { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 28rpx 32rpx; border-bottom: 1rpx solid $border; }
.modal-title { font-size: 30rpx; font-weight: 600; color: $text-1; }
.modal-close { width: 48rpx; height: 48rpx; display: flex; align-items: center; justify-content: center; }

/* ====== 笔记弹窗 ====== */
.note-modal { width: 85%; background: $bg-card; border-radius: 16rpx; display: flex; flex-direction: column; }
.note-input { width: 100%; min-height: 280rpx; padding: 24rpx 32rpx; font-size: 28rpx; color: $text-1; line-height: 1.6; box-sizing: border-box; }
.modal-footer { display: flex; border-top: 1rpx solid $border; }
.modal-btn { flex: 1; height: 88rpx; display: flex; align-items: center; justify-content: center; font-size: 28rpx; }
.modal-btn.cancel { color: $text-3; border-right: 1rpx solid $border; }
.modal-btn.confirm { color: $primary; font-weight: 500; }

/* ====== 答题卡弹窗 ====== */
.card-modal { position: absolute; bottom: 0; width: 100%; background: $bg-card; border-radius: 24rpx 24rpx 0 0; max-height: 80vh; display: flex; flex-direction: column; }
.card-stats { padding: 0 32rpx 20rpx; display: flex; gap: 32rpx; font-size: 24rpx; color: $text-3; }
.card-grid { flex: 1; padding: 0 32rpx 24rpx; display: flex; flex-wrap: wrap; gap: 16rpx; }
.card-num { width: 72rpx; height: 72rpx; border-radius: 8rpx; display: flex; align-items: center; justify-content: center; font-size: 26rpx; color: $text-2; background: $bg-page; border: 2rpx solid transparent; }
.card-num.current { border-color: $primary; font-weight: 500; }
.card-num.correct { background: #f0fff0; color: #52c41a; }
.card-num.wrong { background: #fff0f0; color: $danger; }
.card-num.collected { position: relative; }
.card-num.collected::after { content: '★'; position: absolute; top: -6rpx; right: -2rpx; font-size: 18rpx; color: #ff9800; }
.card-legend { padding: 20rpx 32rpx; padding-bottom: calc(20rpx + constant(safe-area-inset-bottom)); padding-bottom: calc(20rpx + env(safe-area-inset-bottom)); border-top: 1rpx solid $border; display: flex; justify-content: space-around; }
.legend-item { display: flex; align-items: center; gap: 8rpx; font-size: 22rpx; color: $text-3; }
.legend-dot { width: 20rpx; height: 20rpx; border-radius: 4rpx; }
.legend-dot.correct { background: #52c41a; }
.legend-dot.wrong { background: $danger; }
.legend-dot.undone { background: $bg-page; border: 1rpx solid #d0d5dd; }
.legend-dot.collected { background: #ff9800; }

.bottom-space { height: 40rpx; width: 100%; }
</style>
