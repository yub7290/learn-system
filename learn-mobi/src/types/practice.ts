/**
 * 试题练习 - TypeScript 类型定义
 */

/** 练习概览 */
export interface PracticeOverviewVO {
  totalQuestionCount: number
  practicedCount: number
  totalAttempts: number
  passRate: number
  chapterProgressList: ChapterPracticeProgressVO[]
}

/** 章节练习进度 */
export interface ChapterPracticeProgressVO {
  chapterId: number
  chapterName: string
  practicedQuestionCount: number
  totalQuestionCount: number
  accuracyRate: number
  children?: ChapterPracticeProgressVO[]
}

/** 章节树节点 */
export interface ChapterTreeNodeVO {
  id: number
  name: string
  parentId: number
  sort: number
  hasChildren: boolean
}

/** 练习题目 */
export interface PracticeQuestionVO {
  id: number
  questionType: number
  content: string
  difficulty: number
  knowledgePoints: string
  options: QuestionOptionVO[]
  favorited: boolean
  currentIndex: number
  totalCount: number
  practiceMode: number
  courseId: number
  chapterId: number
  analysis?: string
}

/** 题目选项 */
export interface QuestionOptionVO {
  id: number
  questionId: number
  label: string
  content: string
  isCorrect: number
  sort: number
}

/** 题目简略信息（列表页用） */
export interface PracticeQuestionSimpleVO {
  id: number
  questionType: number
  content: string
  difficulty: number
  courseId?: number
  wrongCount?: number
  chapterName?: string
  relatedTime?: string
}

/** 笔记 */
export interface NoteVO {
  id: number
  questionId: number
  courseId: number
  noteContent: string
  questionType: number
  questionContent: string
  createTime: string
}

/** 收藏切换结果 */
export interface FavoriteToggleVO {
  favorited: boolean
}

/** 练习会话 */
export interface PracticeSessionVO {
  questionId: number
  chapterId: number
  practiceMode: number
  currentIndex: number
  totalCount: number
}

/** 答题卡项 */
export interface AnswerSheetItemVO {
  /** 题目ID */
  questionId: number
  /** 题号 */
  questionNumber: number
  /** 是否已作答 */
  answered: boolean
  /** 是否标记 */
  marked: boolean
  /** 题目类型 */
  questionType: number
}

/** 背题模式配置 */
export interface ReciteModeConfigVO {
  /** 是否自动显示答案 */
  autoShowAnswer: boolean
  /** 是否自动播放解析 */
  autoPlayAnalysis: boolean
}

/** 单个课程的练习概览（含课程信息） */
export interface CoursePracticeOverviewVO {
  /** 课程ID */
  courseId: number
  /** 课程名称 */
  courseName: string
  /** 练习概览 */
  overview: PracticeOverviewVO
}
