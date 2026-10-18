import { http } from './request'
import type { CategoryNode, CourseListItem, CourseDetailVO, ChapterDetailVO, ChapterListItem, CourseScoreVO } from '../types/course'
import { isLoggedIn } from '../utils/auth'

export function getCourseCategory(): Promise<{ list: CategoryNode[] }> {
  return http.get<{ list: CategoryNode[] }>('/student/course/category')
}
export function getCourseList(params: { cateId: number; tabType: number; page: number; pageSize: number }): Promise<{ list: CourseListItem[]; total: number }> {
  return http.get('/student/course/list', params)
}
export function searchCourse(params: { keyword?: string; cateId?: number; tabType?: number }): Promise<{ list: CourseListItem[] }> {
  return http.get('/student/course/search', params)
}
export function getCourseDetail(cid: number): Promise<CourseDetailVO> {
  return http.get<CourseDetailVO>('/student/course/detail', { cid })
}
export function getChapterList(cid: number): Promise<{ list: ChapterListItem[] }> {
  return http.get<{ list: ChapterListItem[] }>('/student/chapter/list', { cid }, undefined, { showError: false })
}
export function getChapterDetail(chId: number, cid: number): Promise<ChapterDetailVO> {
  if (!isLoggedIn()) return Promise.reject(new Error('unauthorized'))
  // 学习页禁止网络失败时回退到 mock，否则切换章节会展示错误课程内容。
  return http.get<ChapterDetailVO>('/student/chapter/detail', { chId, cid }, undefined, { showError: false })
}

/** 获取课程综合成绩（不使用mock，直接请求后端） */
export function getCourseScore(courseId: number): Promise<CourseScoreVO | null> {
  if (!isLoggedIn()) return Promise.resolve(null)
  return http.get<CourseScoreVO | null>(`/student/course/${courseId}/score`, undefined, undefined, { requireAuth: true })
}
