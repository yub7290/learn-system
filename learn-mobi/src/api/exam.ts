import { http } from './request'
import { isLoggedIn } from '../utils/auth'
import type {
  ExamVO,
  ExamDetailVO,
  ExamQuestionVO,
  ExamResultVO,
  ExamSubmitDTO,
  FinalExamVO,
  StartExamVO,
  MonitorBehaviorVO,
  MonitorBehaviorDTO,
} from '../types/exam'

/**
 * 获取考试列表
 * @param params.courseId 课程ID
 * @param params.keyword 搜索关键词
 * @param params.pageNum 页码
 * @param params.pageSize 每页条数
 */
export function getExamList(params?: {
  courseId?: number
  keyword?: string
  pageNum?: number
  pageSize?: number
}): Promise<{ list: ExamVO[]; total: number }> {
  if (!isLoggedIn()) return Promise.resolve({ list: [], total: 0 })
  return http.get<{ list: ExamVO[]; total: number }>('/student/exam/list', params)
}

/**
 * 获取考试详情
 * @param id 考试ID
 */
export function getExamDetail(id: number): Promise<ExamDetailVO> {
  if (!isLoggedIn()) return Promise.reject(new Error('unauthorized'))
  return http.get<ExamDetailVO>('/student/exam/info/' + id)
}

/**
 * 获取考试题目
 * @param examId 考试ID
 */
export function getExamQuestions(examId: number): Promise<ExamQuestionVO[]> {
  return http.get<ExamQuestionVO[]>('/student/exam/questions', { examId }, undefined, { requireAuth: true })
}

/**
 * 提交考试
 * @param data 提交参数
 */
export function submitExam(data: ExamSubmitDTO): Promise<ExamResultVO> {
  return http.post<ExamResultVO>('/student/exam/submit', data, undefined, { requireAuth: true })
}

/**
 * 清空考试历史成绩
 * @param examId 考试ID
 */
export function clearExamHistory(examId: number): Promise<void> {
  return http.delete<void>('/student/exam/history/' + examId, undefined, undefined, { requireAuth: true })
}

/**
 * 查询课程结课考试
 * @param courseId 课程ID
 */
export function getCourseFinalExam(courseId: number): Promise<FinalExamVO | null> {
  if (!isLoggedIn()) return Promise.resolve(null)
  return http.get<FinalExamVO | null>('/student/course/' + courseId + '/final-exam')
}

/**
 * 开考
 * @param examId 考试ID
 */
export function startExam(examId: number): Promise<StartExamVO> {
  return http.post<StartExamVO>('/student/exam/' + examId + '/start', undefined, undefined, { requireAuth: true })
}

/**
 * 心跳
 * @param recordId 考试记录ID
 */
export function heartbeat(recordId: number): Promise<void> {
  return http.put<void>('/student/exam/record/' + recordId + '/heartbeat', undefined, undefined, { requireAuth: true, showError: false })
}

/**
 * 查询考试结果
 * @param recordId 考试记录ID
 */
export function getExamResult(recordId: number): Promise<ExamResultVO> {
  return http.get<ExamResultVO>('/student/exam/record/' + recordId + '/result', undefined, undefined, { requireAuth: true })
}

/** Mock 监考行为记录 */
const mockMonitorBehaviors: Record<number, MonitorBehaviorVO[]> = {}

/**
 * 上报监考行为（Mock 实现）
 * @param data 行为数据
 * @returns 上报结果
 */
export function reportMonitorBehavior(data: MonitorBehaviorDTO): Promise<{ success: boolean }> {
  return new Promise(resolve => {
    setTimeout(() => {
      const list = mockMonitorBehaviors[data.examId] || []
      list.push({
        behaviorType: data.behaviorType,
        description: data.description,
        happenTime: data.happenTime,
      })
      mockMonitorBehaviors[data.examId] = list
      resolve({ success: true })
    }, 100)
  })
}

/**
 * 获取监考行为记录列表（Mock 实现）
 * @param examId 考试ID
 * @returns 行为记录列表
 */
export function getMonitorBehaviorList(examId: number): Promise<MonitorBehaviorVO[]> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockMonitorBehaviors[examId] || [])
    }, 200)
  })
}
