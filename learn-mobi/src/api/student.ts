import type {
  StudentOverviewIndexVO,
  StudentOverviewVO,
  WeeklyPlanVO,
  AbilityDimensionVO,
  KnowledgeGraphNodeVO,
  StudentHomeDataVO,
  WeekReportVO,
  SubjectGraphVO,
  SubjectItemVO,
  WeekPlanDetailVO,
} from '../types/student'

/**
 * 获取成长档案首页汇总数据
 */
export function getStudentOverviewIndex(): Promise<StudentOverviewIndexVO> {
  return Promise.resolve({
    overview: {
      studentId: 1,
      studentName: '小明',
      avatarUrl: '',
      totalStudyDays: 86,
      totalStudyMinutes: 4320,
      completedCourseCount: 12,
      averageExamScore: 85,
      abilityDimensions: [
        { id: 1, name: '专注力', score: 82, fullScore: 100 },
        { id: 2, name: '理解归纳', score: 78, fullScore: 100 },
        { id: 3, name: '逻辑解题', score: 71, fullScore: 100 },
        { id: 4, name: '纠错复盘', score: 65, fullScore: 100 },
        { id: 5, name: '自主规划', score: 72, fullScore: 100 },
      ],
      recentStudyRecords: [
        { id: 1, courseName: '分数乘除基础', durationMinutes: 25, studyTime: '2026-06-25 09:30' },
        { id: 2, courseName: '百分数计算进阶', durationMinutes: 30, studyTime: '2026-06-24 14:00' },
      ],
    },
    currentWeeklyPlan: {
      id: 1,
      weekStartDate: '2026-06-22',
      weekEndDate: '2026-06-28',
      tasks: [
        { id: 1, title: '百分数计算', taskType: 1, plannedMinutes: 30, completedMinutes: 30, completed: true },
        { id: 2, title: '分数应用题', taskType: 2, plannedMinutes: 45, completedMinutes: 20, completed: false },
        { id: 3, title: '比与比例', taskType: 1, plannedMinutes: 30, completedMinutes: 0, completed: false },
      ],
    },
    knowledgeGraphRoot: {
      id: 0,
      name: '小学数学',
      masteryPercent: 0,
      children: [
        {
          id: 1,
          name: '数的认识',
          masteryPercent: 96,
          children: [
            { id: 11, name: '整数', masteryPercent: 98 },
            { id: 12, name: '小数', masteryPercent: 94 },
            { id: 13, name: '分数', masteryPercent: 90 },
          ],
        },
        {
          id: 2,
          name: '数与运算',
          masteryPercent: 75,
          children: [
            { id: 21, name: '分数加减', masteryPercent: 82 },
            { id: 22, name: '分数乘除', masteryPercent: 68 },
            { id: 23, name: '百分数', masteryPercent: 55 },
          ],
        },
        {
          id: 3,
          name: '比与比例',
          masteryPercent: 52,
        },
      ],
    },
  })
}

/**
 * 获取成长总览
 */
export function getStudentOverview(): Promise<StudentOverviewVO> {
  return getStudentOverviewIndex().then((data) => data.overview)
}

/**
 * 获取周计划
 */
export function getWeeklyPlan(weekStartDate?: string): Promise<WeeklyPlanVO> {
  return Promise.resolve({
    id: 1,
    weekStartDate: weekStartDate || '2026-06-22',
    weekEndDate: '2026-06-28',
    tasks: [
      { id: 1, title: '百分数计算进阶', taskType: 1, plannedMinutes: 30, completedMinutes: 30, completed: true },
      { id: 2, title: '分数应用题训练', taskType: 2, plannedMinutes: 45, completedMinutes: 20, completed: false },
      { id: 3, title: '比与比例学习', taskType: 1, plannedMinutes: 30, completedMinutes: 0, completed: false },
    ],
  })
}

/**
 * 更新周计划任务完成状态
 */
export function updateWeeklyTaskStatus(
  taskId: number,
  completed: boolean
): Promise<{ taskId: number; completed: boolean }> {
  return Promise.resolve({ taskId, completed })
}

/**
 * 获取能力维度列表
 */
export function getAbilityDimensions(): Promise<AbilityDimensionVO[]> {
  return Promise.resolve([
    { id: 1, name: '专注力', score: 82, fullScore: 100 },
    { id: 2, name: '理解归纳', score: 78, fullScore: 100 },
    { id: 3, name: '逻辑解题', score: 71, fullScore: 100 },
    { id: 4, name: '纠错复盘', score: 65, fullScore: 100 },
    { id: 5, name: '自主规划', score: 72, fullScore: 100 },
  ])
}

/**
 * 获取知识图谱
 */
export function getKnowledgeGraph(): Promise<KnowledgeGraphNodeVO> {
  return Promise.resolve({
    id: 0,
    name: '小学数学',
    masteryPercent: 0,
    children: [
      {
        id: 1,
        name: '数的认识',
        masteryPercent: 96,
        children: [
          { id: 11, name: '整数', masteryPercent: 98 },
          { id: 12, name: '小数', masteryPercent: 94 },
          { id: 13, name: '分数', masteryPercent: 90 },
        ],
      },
      {
        id: 2,
        name: '数与运算',
        masteryPercent: 75,
        children: [
          { id: 21, name: '分数加减', masteryPercent: 82 },
          { id: 22, name: '分数乘除', masteryPercent: 68 },
          { id: 23, name: '百分数', masteryPercent: 55 },
        ],
      },
    ],
  })
}

/**
 * 获取首页数据
 */
export function getStudentHomeData(): Promise<StudentHomeDataVO> {
  return Promise.resolve({
    studentName: '小明',
    growthValue: 1280,
    todayStats: { duration: 45, streak: 12, knowledge: 86 },
    weekTotal: { duration: 630, questions: 180, knowledge: 12 },
    weekDone: { duration: 190, questions: 55, knowledge: 4 },
    todayTasks: [
      { id: 1, name: '百分数计算进阶', knowledge: '百分数基础', desc: '25分钟课程学习', type: 'course', typeText: '课程', done: false },
      { id: 2, name: '百分数专项练习', knowledge: '百分数基础', desc: '28道专项习题', type: 'practice', typeText: '练习', done: false },
      { id: 3, name: '比的认识与性质', knowledge: '比与比例', desc: '25分钟课程学习', type: 'course', typeText: '课程', done: false },
      { id: 4, name: '当日知识点梳理', knowledge: '当日全部内容', desc: '10分钟总结', type: 'summary', typeText: '总结', done: false },
    ],
    badgeList: [
      { id: 1, name: '连续打卡', iconClass: 'icon-xuexiao', color: 'linear-gradient(135deg, #FF7D00, #FFB74D)' },
      { id: 2, name: '专注达人', iconClass: 'icon-ai64', color: 'linear-gradient(135deg, #409EFF, #64B5F6)' },
      { id: 3, name: '进步之星', iconClass: 'icon-ai64', color: 'linear-gradient(135deg, #67C23A, #81C784)' },
      { id: 4, name: '习题能手', iconClass: 'icon-shijuan', color: 'linear-gradient(135deg, #E6A23C, #FFD54F)' },
    ],
    highlightTip: '本周「专注力」提升8分，超过了班级72%的同学，继续保持！',
  })
}

/**
 * 获取周报告列表
 */
export function getWeekReportList(): Promise<WeekReportVO[]> {
  return Promise.resolve([
    {
      weekName: '第25周', totalScore: 76, totalDiff: 5, totalDuration: 8.5, studyDays: 6, masteryOffset: 0,
      abilityList: [
        { name: '专注力', current: 82, lastWeek: 74, diff: 8 },
        { name: '理解归纳', current: 78, lastWeek: 75, diff: 3 },
        { name: '逻辑解题', current: 71, lastWeek: 70, diff: 1 },
        { name: '纠错复盘', current: 65, lastWeek: 68, diff: -3 },
        { name: '自主规划', current: 72, lastWeek: 70, diff: 2 },
      ],
      durationList: [
        { day: '周一', minutes: 85 }, { day: '周二', minutes: 120 },
        { day: '周三', minutes: 90 }, { day: '周四', minutes: 110 },
        { day: '周五', minutes: 75 }, { day: '周六', minutes: 130 },
        { day: '周日', minutes: 90 },
      ],
    },
    {
      weekName: '第24周', totalScore: 71, totalDiff: 2, totalDuration: 7.8, studyDays: 5, masteryOffset: -5,
      abilityList: [
        { name: '专注力', current: 74, lastWeek: 72, diff: 2 },
        { name: '理解归纳', current: 75, lastWeek: 73, diff: 2 },
        { name: '逻辑解题', current: 70, lastWeek: 68, diff: 2 },
        { name: '纠错复盘', current: 68, lastWeek: 65, diff: 3 },
        { name: '自主规划', current: 70, lastWeek: 67, diff: 3 },
      ],
      durationList: [
        { day: '周一', minutes: 70 }, { day: '周二', minutes: 100 },
        { day: '周三', minutes: 80 }, { day: '周四', minutes: 95 },
        { day: '周五', minutes: 0 }, { day: '周六', minutes: 125 },
        { day: '周日', minutes: 98 },
      ],
    },
    {
      weekName: '第23周', totalScore: 69, totalDiff: -1, totalDuration: 7.2, studyDays: 5, masteryOffset: -8,
      abilityList: [
        { name: '专注力', current: 72, lastWeek: 75, diff: -3 },
        { name: '理解归纳', current: 73, lastWeek: 74, diff: -1 },
        { name: '逻辑解题', current: 68, lastWeek: 69, diff: -1 },
        { name: '纠错复盘', current: 65, lastWeek: 66, diff: -1 },
        { name: '自主规划', current: 67, lastWeek: 69, diff: -2 },
      ],
      durationList: [
        { day: '周一', minutes: 65 }, { day: '周二', minutes: 90 },
        { day: '周三', minutes: 75 }, { day: '周四', minutes: 88 },
        { day: '周五', minutes: 60 }, { day: '周六', minutes: 110 },
        { day: '周日', minutes: 0 },
      ],
    },
  ])
}

/**
 * 获取学科列表
 */
export function getSubjectList(): Promise<SubjectItemVO[]> {
  return Promise.resolve([
    { key: 'math', name: '数学', color: '#FF7D00' },
    { key: 'chinese', name: '语文', color: '#409EFF' },
    { key: 'english', name: '英语', color: '#67C23A' },
    { key: 'physics', name: '物理', color: '#E6A23C' },
    { key: 'chemistry', name: '化学', color: '#F56C6C' },
    { key: 'history', name: '历史', color: '#909399' },
  ])
}

/**
 * 获取学科图谱
 */
export function getSubjectGraph(subject: string): Promise<SubjectGraphVO> {
  const graphs: Record<string, SubjectGraphVO> = {
    math: {
      preNodes: [
        { id: 1, name: '数的认识', mastery: 96, type: 'pre', questionTypes: [{ name: '选择题', mastery: 98 }, { name: '填空题', mastery: 94 }] },
        { id: 2, name: '整数四则运算', mastery: 93, type: 'pre', questionTypes: [{ name: '计算题', mastery: 95 }, { name: '填空题', mastery: 90 }] },
        { id: 3, name: '小数的认识', mastery: 90, type: 'pre', questionTypes: [{ name: '选择题', mastery: 92 }, { name: '计算题', mastery: 88 }] },
        { id: 4, name: '分数概念', mastery: 88, type: 'pre', questionTypes: [{ name: '选择题', mastery: 90 }, { name: '填空题', mastery: 85 }] },
      ],
      coreNode: { id: 5, name: '分数加减运算', mastery: 75, type: 'core', questionTypes: [{ name: '计算题', mastery: 82 }, { name: '应用题', mastery: 58 }] },
      nextNodes: [
        { id: 6, name: '分数乘除', mastery: 68, type: 'next', questionTypes: [{ name: '计算题', mastery: 72 }, { name: '应用题', mastery: 55 }] },
        { id: 7, name: '分数应用题', mastery: 58, type: 'next', questionTypes: [{ name: '应用题', mastery: 52 }] },
        { id: 8, name: '百分数基础', mastery: 55, type: 'next', questionTypes: [{ name: '选择题', mastery: 60 }] },
        { id: 9, name: '比与比例', mastery: 52, type: 'next', questionTypes: [{ name: '填空题', mastery: 55 }] },
      ],
      goodChain: '数的认识 > 整数运算 > 分数概念 > 分数加减计算',
      weakChain: '应用题题型薄弱 > 分数乘除 > 比例应用受影响',
    },
    chinese: {
      preNodes: [
        { id: 11, name: '拼音基础', mastery: 96, type: 'pre', questionTypes: [{ name: '看拼音写词', mastery: 97 }, { name: '选择辨析', mastery: 94 }] },
        { id: 12, name: '汉字认读', mastery: 93, type: 'pre', questionTypes: [{ name: '选字填空', mastery: 95 }, { name: '改错别字', mastery: 90 }] },
        { id: 13, name: '词语积累', mastery: 90, type: 'pre', questionTypes: [{ name: '选词填空', mastery: 92 }, { name: '近义词', mastery: 88 }] },
        { id: 14, name: '句子基础', mastery: 87, type: 'pre', questionTypes: [{ name: '造句', mastery: 89 }, { name: '标点运用', mastery: 85 }] },
      ],
      coreNode: { id: 15, name: '词语理解与运用', mastery: 78, type: 'core', questionTypes: [{ name: '选词填空', mastery: 82 }, { name: '成语辨析', mastery: 65 }] },
      nextNodes: [
        { id: 16, name: '句子仿写', mastery: 70, type: 'next', questionTypes: [{ name: '仿写句子', mastery: 73 }] },
        { id: 17, name: '修辞手法', mastery: 62, type: 'next', questionTypes: [{ name: '判断辨析', mastery: 68 }] },
        { id: 18, name: '阅读理解', mastery: 58, type: 'next', questionTypes: [{ name: '信息提取', mastery: 68 }] },
        { id: 19, name: '习作表达', mastery: 55, type: 'next', questionTypes: [{ name: '片段写作', mastery: 60 }] },
      ],
      goodChain: '拼音 > 汉字 > 词语积累 > 基础运用',
      weakChain: '主旨概括题型薄弱 > 阅读理解 > 习作表达失分',
    },
    english: {
      preNodes: [
        { id: 21, name: '26个字母', mastery: 98, type: 'pre', questionTypes: [{ name: '字母排序', mastery: 99 }] },
        { id: 22, name: '音标入门', mastery: 92, type: 'pre', questionTypes: [{ name: '辨音题', mastery: 94 }] },
        { id: 23, name: '基础词汇', mastery: 88, type: 'pre', questionTypes: [{ name: '单词拼写', mastery: 90 }] },
        { id: 24, name: '单词分类', mastery: 85, type: 'pre', questionTypes: [{ name: '分类题', mastery: 88 }] },
      ],
      coreNode: { id: 25, name: '核心单词积累', mastery: 72, type: 'core', questionTypes: [{ name: '单词拼写', mastery: 78 }, { name: '单项选择', mastery: 68 }] },
      nextNodes: [
        { id: 26, name: '基本句型', mastery: 65, type: 'next', questionTypes: [{ name: '连词成句', mastery: 70 }] },
        { id: 27, name: '时态基础', mastery: 58, type: 'next', questionTypes: [{ name: '填空题', mastery: 62 }] },
        { id: 28, name: '情景对话', mastery: 55, type: 'next', questionTypes: [{ name: '情景匹配', mastery: 62 }] },
        { id: 29, name: '短文阅读', mastery: 52, type: 'next', questionTypes: [{ name: '选择题', mastery: 45 }] },
      ],
      goodChain: '字母 > 音标 > 单词认读 > 核心词汇拼写',
      weakChain: '句型转换薄弱 > 时态运用 > 情景对话失分明显',
    },
  }
  return Promise.resolve(graphs[subject] || graphs.math)
}

/**
 * 获取周计划详情
 */
export function getWeekPlanDetail(weekIndex?: number): Promise<WeekPlanDetailVO> {
  return Promise.resolve({
    weekName: '第25周',
    statusText: '进行中',
    weakPoints: '分数应用题、比与比例、百分数综合',
    weekTotal: { duration: 630, questions: 180, knowledge: 12 },
    dailyPlanList: [
      {
        weekday: '周一', date: '06/23',
        durationTarget: 90, durationDone: 90,
        questionTarget: 25, questionDone: 25,
        knowledgeTarget: 2, knowledgeDone: 2,
        tasks: [
          { taskId: 101, type: 'learn', jumpType: 'course', title: '分数乘除基础巩固', knowledge: '分数乘除运算', duration: 25, questionCount: 0, done: true },
          { taskId: 102, type: 'practice', jumpType: 'question', title: '分数乘除专项练习', knowledge: '分数乘除运算', duration: 25, questionCount: 25, done: true },
          { taskId: 103, type: 'review', jumpType: 'question', title: '上周错题复盘', knowledge: '分数应用题', duration: 25, questionCount: 15, done: true },
          { taskId: 104, type: 'summary', jumpType: 'result', title: '当日知识点梳理', knowledge: '当日全部内容', duration: 10, questionCount: 0, done: true },
        ],
      },
      {
        weekday: '周二', date: '06/24',
        durationTarget: 100, durationDone: 100,
        questionTarget: 30, questionDone: 30,
        knowledgeTarget: 2, knowledgeDone: 2,
        tasks: [
          { taskId: 201, type: 'learn', jumpType: 'course', title: '分数应用题进阶', knowledge: '分数应用题', duration: 30, questionCount: 0, done: true },
          { taskId: 202, type: 'practice', jumpType: 'question', title: '分数应用题专项训练', knowledge: '分数应用题', duration: 30, questionCount: 30, done: true },
          { taskId: 203, type: 'learn', jumpType: 'course', title: '百分数基础入门', knowledge: '百分数基础', duration: 20, questionCount: 0, done: true },
          { taskId: 204, type: 'summary', jumpType: 'result', title: '当日知识点梳理', knowledge: '当日全部内容', duration: 10, questionCount: 0, done: true },
        ],
      },
      {
        weekday: '周三', date: '06/25',
        durationTarget: 95, durationDone: 0,
        questionTarget: 28, questionDone: 0,
        knowledgeTarget: 2, knowledgeDone: 0,
        tasks: [
          { taskId: 301, type: 'learn', jumpType: 'course', title: '百分数计算进阶', knowledge: '百分数基础', duration: 25, questionCount: 0, done: false },
          { taskId: 302, type: 'practice', jumpType: 'question', title: '百分数专项练习', knowledge: '百分数基础', duration: 30, questionCount: 28, done: false },
          { taskId: 303, type: 'learn', jumpType: 'course', title: '比的认识与性质', knowledge: '比与比例', duration: 25, questionCount: 0, done: false },
          { taskId: 304, type: 'summary', jumpType: 'result', title: '当日知识点梳理', knowledge: '当日全部内容', duration: 10, questionCount: 0, done: false },
        ],
      },
      {
        weekday: '周四', date: '06/26',
        durationTarget: 105, durationDone: 0,
        questionTarget: 32, questionDone: 0,
        knowledgeTarget: 2, knowledgeDone: 0,
        tasks: [
          { taskId: 401, type: 'learn', jumpType: 'course', title: '比例的意义与基本性质', knowledge: '比与比例', duration: 30, questionCount: 0, done: false },
          { taskId: 402, type: 'practice', jumpType: 'question', title: '比与比例综合练习', knowledge: '比与比例', duration: 35, questionCount: 32, done: false },
          { taskId: 403, type: 'review', jumpType: 'question', title: '本周前半段错题复盘', knowledge: '分数+百分数', duration: 25, questionCount: 20, done: false },
          { taskId: 404, type: 'summary', jumpType: 'result', title: '当日知识点梳理', knowledge: '当日全部内容', duration: 10, questionCount: 0, done: false },
        ],
      },
      {
        weekday: '周五', date: '06/27',
        durationTarget: 90, durationDone: 0,
        questionTarget: 25, questionDone: 0,
        knowledgeTarget: 2, knowledgeDone: 0,
        tasks: [
          { taskId: 501, type: 'learn', jumpType: 'course', title: '比例应用题入门', knowledge: '比与比例', duration: 25, questionCount: 0, done: false },
          { taskId: 502, type: 'practice', jumpType: 'question', title: '比例应用题基础练习', knowledge: '比与比例', duration: 25, questionCount: 25, done: false },
          { taskId: 503, type: 'practice', jumpType: 'question', title: '本周知识点混合练习', knowledge: '全周知识点', duration: 25, questionCount: 20, done: false },
          { taskId: 504, type: 'summary', jumpType: 'result', title: '当日知识点梳理', knowledge: '当日全部内容', duration: 10, questionCount: 0, done: false },
        ],
      },
      {
        weekday: '周六', date: '06/28',
        durationTarget: 120, durationDone: 0,
        questionTarget: 40, questionDone: 0,
        knowledgeTarget: 1, knowledgeDone: 0,
        tasks: [
          { taskId: 601, type: 'review', jumpType: 'course', title: '本周知识点系统回顾', knowledge: '全周知识点', duration: 35, questionCount: 0, done: false },
          { taskId: 602, type: 'practice', jumpType: 'paper', title: '周综合测评卷', knowledge: '全周知识点', duration: 40, questionCount: 40, done: false },
          { taskId: 603, type: 'review', jumpType: 'question', title: '测评卷错题精讲', knowledge: '错题对应知识点', duration: 30, questionCount: 15, done: false },
          { taskId: 604, type: 'summary', jumpType: 'result', title: '本周学习总结', knowledge: '全周内容', duration: 10, questionCount: 0, done: false },
        ],
      },
      {
        weekday: '周日', date: '06/29',
        durationTarget: 30, durationDone: 0,
        questionTarget: 0, questionDone: 0,
        knowledgeTarget: 1, knowledgeDone: 0,
        tasks: [
          { taskId: 701, type: 'preview', jumpType: 'course', title: '下周知识点预习', knowledge: '圆的认识', duration: 20, questionCount: 0, done: false },
          { taskId: 702, type: 'summary', jumpType: 'result', title: '下周学习规划', knowledge: '下周内容', duration: 10, questionCount: 0, done: false },
        ],
      },
    ],
    recommendCourses: [
      { id: 1, title: '分数应用题专项突破', knowledge: '分数应用题', duration: 120, lessonCount: 6, difficulty: '进阶', coverColor: 'linear-gradient(135deg, #FF7D00, #FFB74D)' },
      { id: 2, title: '比与比例系统精讲', knowledge: '比与比例', duration: 90, lessonCount: 5, difficulty: '基础', coverColor: 'linear-gradient(135deg, #409EFF, #64B5F6)' },
      { id: 3, title: '百分数综合应用提升', knowledge: '百分数基础', duration: 75, lessonCount: 4, difficulty: '进阶', coverColor: 'linear-gradient(135deg, #67C23A, #81C784)' },
    ],
  })
}

/**
 * 获取历史周计划详情列表
 */
export function getWeekPlanDetailList(): Promise<WeekPlanDetailVO[]> {
  return Promise.resolve([
    {
      weekName: '第25周', statusText: '进行中', weakPoints: '分数应用题、比与比例、百分数综合',
      weekTotal: { duration: 630, questions: 180, knowledge: 12 },
      dailyPlanList: [], // detailed data omitted in list view
      recommendCourses: [],
    },
    {
      weekName: '第24周', statusText: '已完成', weakPoints: '分数加减混合、分数应用题',
      weekTotal: { duration: 580, questions: 165, knowledge: 10 },
      dailyPlanList: [],
      recommendCourses: [],
    },
    {
      weekName: '第23周', statusText: '已完成', weakPoints: '异分母分数加减',
      weekTotal: { duration: 520, questions: 150, knowledge: 9 },
      dailyPlanList: [],
      recommendCourses: [],
    },
  ])
}
