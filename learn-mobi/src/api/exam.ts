import { http } from './request'
import type {
  ExamVO,
  ExamDetailVO,
  ExamQuestionVO,
  ExamResultVO,
  ExamSubmitDTO,
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
  return http.get<{ list: ExamVO[]; total: number }>('/student/exam/list', params)
}

/**
 * 获取考试详情
 * @param id 考试ID
 */
export function getExamDetail(id: number): Promise<ExamDetailVO> {
  return http.get<ExamDetailVO>('/student/exam/info/' + id)
}

/**
 * 获取考试题目
 * @param examId 考试ID
 */
export function getExamQuestions(examId: number): Promise<ExamQuestionVO[]> {
  return http.get<ExamQuestionVO[]>('/student/exam/questions', { examId })
}

/**
 * 提交考试
 * @param data 提交参数
 */
export function submitExam(data: ExamSubmitDTO): Promise<ExamResultVO> {
  return http.post<ExamResultVO>('/student/exam/submit', data)
}

/**
 * 清空考试历史成绩
 * @param examId 考试ID
 */
export function clearExamHistory(examId: number): Promise<void> {
  return http.delete<void>('/student/exam/history/' + examId)
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
