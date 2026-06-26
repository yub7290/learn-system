/**
 * 成长档案 - TypeScript 类型定义
 */

/* ========== 基础类型（保留原定义兼容） ========== */

/** 成长总览 */
export interface StudentOverviewVO {
  /** 学生ID */
  studentId: number
  /** 学生姓名 */
  studentName: string
  /** 头像地址 */
  avatarUrl: string
  /** 累计学习天数 */
  totalStudyDays: number
  /** 累计学习时长(分钟) */
  totalStudyMinutes: number
  /** 完成课程数 */
  completedCourseCount: number
  /** 考试平均分 */
  averageExamScore: number
  /** 能力维度列表 */
  abilityDimensions: AbilityDimensionVO[]
  /** 最近学习记录 */
  recentStudyRecords: StudyRecordVO[]
}

/** 能力维度 */
export interface AbilityDimensionVO {
  /** 维度ID */
  id: number
  /** 维度名称 */
  name: string
  /** 维度得分 */
  score: number
  /** 满分 */
  fullScore: number
}

/** 学习记录 */
export interface StudyRecordVO {
  /** 记录ID */
  id: number
  /** 课程名称 */
  courseName: string
  /** 学习时长(分钟) */
  durationMinutes: number
  /** 学习时间 */
  studyTime: string
}

/** 周计划 */
export interface WeeklyPlanVO {
  /** 计划ID */
  id: number
  /** 周起始日期 */
  weekStartDate: string
  /** 周结束日期 */
  weekEndDate: string
  /** 计划任务列表 */
  tasks: WeeklyTaskVO[]
}

/** 周计划任务 */
export interface WeeklyTaskVO {
  /** 任务ID */
  id: number
  /** 任务标题 */
  title: string
  /** 任务类型: 1 学习, 2 练习, 3 考试 */
  taskType: number
  /** 计划时长(分钟) */
  plannedMinutes: number
  /** 已完成时长(分钟) */
  completedMinutes: number
  /** 是否完成 */
  completed: boolean
}

/** 知识图谱节点 */
export interface KnowledgeGraphNodeVO {
  /** 节点ID */
  id: number
  /** 节点名称 */
  name: string
  /** 掌握度: 0-100 */
  masteryPercent: number
  /** 父节点ID */
  parentId?: number
  /** 子节点 */
  children?: KnowledgeGraphNodeVO[]
}

/** 成长档案首页汇总 */
export interface StudentOverviewIndexVO {
  /** 总览数据 */
  overview: StudentOverviewVO
  /** 当前周计划 */
  currentWeeklyPlan: WeeklyPlanVO
  /** 知识图谱根节点 */
  knowledgeGraphRoot: KnowledgeGraphNodeVO
}

/* ========== 新增详细类型 ========== */

/** 今日统计 */
export interface TodayStatsVO {
  /** 今日学习时长（分钟） */
  duration: number
  /** 连续学习天数 */
  streak: number
  /** 已掌握知识点 */
  knowledge: number
}

/** 待办任务 */
export interface DailyTaskVO {
  id: number
  name: string
  knowledge: string
  desc: string
  type: 'course' | 'practice' | 'summary' | 'review' | 'learn' | 'preview'
  typeText: string
  done: boolean
}

/** 徽章 */
export interface BadgeVO {
  id: number
  name: string
  /** iconfont class 名，如 icon-huojian */
  iconClass: string
  color: string
}

/** 周进度统计 */
export interface WeekStatsVO {
  duration: number
  questions: number
  knowledge: number
}

/** 五维能力得分 */
export interface AbilityScoreVO {
  name: string
  current: number
  lastWeek: number
  diff: number
}

/** 每日时长 */
export interface DurationItemVO {
  day: string
  minutes: number
}

/** 周报告 */
export interface WeekReportVO {
  weekName: string
  totalScore: number
  totalDiff: number
  totalDuration: number
  studyDays: number
  masteryOffset: number
  abilityList: AbilityScoreVO[]
  durationList: DurationItemVO[]
}

/** 知识图谱中题型节点 */
export interface QuestionTypeVO {
  name: string
  mastery: number
}

/** 知识图谱中知识点节点 */
export interface KnowledgeNodeDetailVO {
  id: number
  name: string
  mastery: number
  type: 'pre' | 'core' | 'next' | 'knowledge'
  questionTypes: QuestionTypeVO[]
}

/** 学科科目 */
export interface SubjectItemVO {
  key: string
  name: string
  color: string
}

/** 学科图谱数据 */
export interface SubjectGraphVO {
  preNodes: KnowledgeNodeDetailVO[]
  coreNode: KnowledgeNodeDetailVO
  nextNodes: KnowledgeNodeDetailVO[]
  goodChain: string
  weakChain: string
}

/** 图谱节点位置 */
export interface GraphNodePosVO {
  id: number
  name: string
  mastery: number
  x: number
  y: number
  type: 'knowledge' | 'question'
}

/** 图谱连线 */
export interface GraphLineVO {
  x1: number
  y1: number
  x2: number
  y2: number
  color: string
  type: 'main' | 'question'
}

/** 日常任务项 */
export interface TaskItemVO {
  taskId: number
  type: 'learn' | 'practice' | 'review' | 'summary' | 'preview'
  jumpType: 'course' | 'question' | 'paper' | 'result'
  title: string
  knowledge: string
  duration: number
  questionCount: number
  done: boolean
}

/** 每日计划 */
export interface DailyPlanVO {
  weekday: string
  date: string
  durationTarget: number
  durationDone: number
  questionTarget: number
  questionDone: number
  knowledgeTarget: number
  knowledgeDone: number
  tasks: TaskItemVO[]
}

/** 周计划详情 */
export interface WeekPlanDetailVO {
  weekName: string
  statusText: string
  weakPoints: string
  weekTotal: WeekStatsVO
  dailyPlanList: DailyPlanVO[]
  recommendCourses: RecommendCourseVO[]
}

/** 推荐课程 */
export interface RecommendCourseVO {
  id: number
  title: string
  knowledge: string
  duration: number
  lessonCount: number
  difficulty: string
  coverColor: string
}

/** 首页数据聚合 */
export interface StudentHomeDataVO {
  studentName: string
  growthValue: number
  todayStats: TodayStatsVO
  weekTotal: WeekStatsVO
  weekDone: WeekStatsVO
  todayTasks: DailyTaskVO[]
  badgeList: BadgeVO[]
  highlightTip: string
}

/** 知识图谱节点（简化版，用于 KnowledgeGraph 组件） */
export interface GraphNodeVO {
  id: number
  name: string
  mastery: number
}
