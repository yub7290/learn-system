import { http } from './request'
import type { CategoryNode, CourseListItem, CourseDetailVO, ChapterDetailVO, ChapterListItem } from '../types/course'

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
  return http.get<{ list: ChapterListItem[] }>('/student/chapter/list', { cid })
}
export function getChapterDetail(chId: number, cid: number): Promise<ChapterDetailVO> {
  return http.get<ChapterDetailVO>('/student/chapter/detail', { chId, cid })
}
