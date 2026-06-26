/**
 * 在线测试 - TypeScript 类型定义
 */

/** 考试信息（列表） */
export interface ExamVO {
  id: number
  title: string
  subtitle?: string
  courseId?: number
  courseName?: string
  totalScore: number
  passScore: number
  duration: number
  difficulty?: number
  isFinalExam?: number
}

/** 考试详情 */
export interface ExamDetailVO {
  id: number
  name: string
  subtitle?: string
  courseId?: number
  courseName?: string
  duration: number
  totalScore: number
  passScore: number
  introduction?: string
  notes?: string
  examiner?: string
  startTime?: string
  endTime?: string
  historyList: ExamHistoryVO[]
}

/** 考试历史成绩 */
export interface ExamHistoryVO {
  recordId: number
  score: number
  totalScore: number
  passScore: number
  isPass: number
  submitTime: string
}

/** 考试题目选项（不包含正确答案，仅在作答时返回） */
export interface ExamQuestionOptionVO {
  label: string
  content: string
  sort: number
}

/** 考试题目 */
export interface ExamQuestionVO {
  questionId: number
  questionType: number
  content: string
  options: ExamQuestionOptionVO[]
  score: number
  sort: number
}

/** 考试结果 */
export interface ExamResultVO {
  recordId: number
  score: number
  totalScore: number
  passScore: number
  isPass: number
  correctCount: number
  wrongCount: number
  unansweredCount: number
  totalCount: number
  duration: number
  questionResults: ExamQuestionResultVO[]
}

/** 单题作答结果 */
export interface ExamQuestionResultVO {
  questionId: number
  questionType: number
  content: string
  options: ExamQuestionOptionVO[]
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  score: number
  knowledgePoint?: string
  analysis?: string
}

/** 提交考试请求 */
export interface ExamSubmitDTO {
  examId: number
  answers: ExamAnswerDTO[]
  duration: number
}

/** 单题答案 */
export interface ExamAnswerDTO {
  questionId: number
  userAnswer: string
}

/** 监考行为记录 */
export interface MonitorBehaviorVO {
  /** 行为类型: 1 切屏, 2 离开页面, 3 复制, 4 粘贴, 5 其他异常 */
  behaviorType: number
  /** 行为描述 */
  description: string
  /** 发生时间 */
  happenTime: string
}

/** 监考行为上报请求 */
export interface MonitorBehaviorDTO {
  examId: number
  behaviorType: number
  description: string
  happenTime: string
}
