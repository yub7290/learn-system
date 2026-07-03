import { http } from './request'
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
  TaskStatusVO,
} from '../types/student'
import { isLoggedIn } from '../utils/auth'

const emptyWeekStats = { duration: 0, questions: 0, knowledge: 0 }

const emptyOverview: StudentOverviewVO = {
  studentId: 0,
  studentName: '',
  avatarUrl: '',
  totalStudyDays: 0,
  totalStudyMinutes: 0,
  completedCourseCount: 0,
  averageExamScore: 0,
  abilityDimensions: [],
  recentStudyRecords: [],
}

const emptyWeekPlanDetail: WeekPlanDetailVO = {
  planId: 0,
  weekName: '',
  statusText: '',
  weakPoints: '',
  weekTotal: emptyWeekStats,
  dailyPlanList: [],
  recommendCourses: [],
  advantageSummary: '',
  weakSummary: '',
  studySuggestion: '',
}

export function getStudentOverviewIndex(): Promise<StudentOverviewIndexVO> {
  if (!isLoggedIn()) {
    return Promise.resolve({
      overview: emptyOverview,
      currentWeeklyPlan: { id: 0, weekStartDate: '', weekEndDate: '', tasks: [] },
      knowledgeGraphRoot: { id: 0, name: '', masteryPercent: 0, children: [] },
    })
  }
  return Promise.all([getStudentOverview(), getWeeklyPlan(), getKnowledgeGraph()]).then(([overview, currentWeeklyPlan, knowledgeGraphRoot]) => ({
    overview,
    currentWeeklyPlan,
    knowledgeGraphRoot,
  }))
}

export function getStudentOverview(): Promise<StudentOverviewVO> {
  if (!isLoggedIn()) return Promise.resolve(emptyOverview)
  return http.get<StudentOverviewVO>('/student/growth/overview')
}

export function getWeeklyPlan(weekStartDate?: string): Promise<WeeklyPlanVO> {
  if (!isLoggedIn()) return Promise.resolve({ id: 0, weekStartDate: weekStartDate || '', weekEndDate: '', tasks: [] })
  return http.get<WeeklyPlanVO>('/student/growth/weekly-plan', { weekStartDate })
}

export function updateWeeklyTaskStatus(taskId: number, completed: boolean): Promise<TaskStatusVO> {
  return http.put<TaskStatusVO>(`/student/growth/task/${taskId}/status`, { completed })
}

export function getAbilityDimensions(): Promise<AbilityDimensionVO[]> {
  if (!isLoggedIn()) return Promise.resolve([])
  return getStudentOverview().then((data) => data.abilityDimensions || [])
}

export function getKnowledgeGraph(): Promise<KnowledgeGraphNodeVO> {
  if (!isLoggedIn()) return Promise.resolve({ id: 0, name: '', masteryPercent: 0, children: [] })
  return http.get<KnowledgeGraphNodeVO>('/student/growth/knowledge-graph')
}

export function getStudentHomeData(): Promise<StudentHomeDataVO> {
  if (!isLoggedIn()) {
    return Promise.resolve({
      studentName: '',
      growthValue: 0,
      todayStats: { duration: 0, streak: 0, knowledge: 0 },
      weekTotal: emptyWeekStats,
      weekDone: emptyWeekStats,
      todayTasks: [],
      badgeList: [],
      highlightTip: '',
    })
  }
  return http.get<StudentHomeDataVO>('/student/growth/home')
}

export function getWeekReportList(): Promise<WeekReportVO[]> {
  if (!isLoggedIn()) return Promise.resolve([])
  return http.get<WeekReportVO[]>('/student/growth/week-reports')
}

export function getSubjectList(): Promise<SubjectItemVO[]> {
  if (!isLoggedIn()) return Promise.resolve([])
  return http.get<SubjectItemVO[]>('/student/growth/subjects')
}

export function getSubjectGraph(subject: string): Promise<SubjectGraphVO> {
  if (!isLoggedIn()) {
    return Promise.resolve({
      preNodes: [],
      coreNode: { id: 0, name: '', mastery: 0, type: 'core', questionTypes: [] },
      nextNodes: [],
      goodChain: '',
      weakChain: '',
    })
  }
  return http.get<SubjectGraphVO>('/student/growth/subject-graph', { subject })
}

export function getWeekPlanDetail(weekIndex?: number): Promise<WeekPlanDetailVO> {
  if (!isLoggedIn()) return Promise.resolve(emptyWeekPlanDetail)
  return http.get<WeekPlanDetailVO>('/student/growth/week-plan', { weekIndex })
}

export function regenerateWeekPlan(weekIndex?: number): Promise<WeekPlanDetailVO> {
  if (!isLoggedIn()) return Promise.resolve(emptyWeekPlanDetail)
  return http.post<WeekPlanDetailVO>('/student/growth/week-plan/regenerate', { weekIndex })
}

export function getWeekPlanDetailList(): Promise<WeekPlanDetailVO[]> {
  if (!isLoggedIn()) return Promise.resolve([])
  return http.get<WeekPlanDetailVO[]>('/student/growth/week-plan/list')
}
