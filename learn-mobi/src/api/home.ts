import { http } from './request'
import type { HomeBaseVO, TeacherItem, HomeCourseItem } from '../types/home'

export function getHomeBase(): Promise<HomeBaseVO> {
  return http.get<HomeBaseVO>('/student/home/base')
}
export function getHomeTeacher(): Promise<{ list: TeacherItem[] }> {
  return http.get<{ list: TeacherItem[] }>('/student/home/teacher')
}
export function getHomeCourse(): Promise<{ list: HomeCourseItem[] }> {
  return http.get<{ list: HomeCourseItem[] }>('/student/home/course')
}
export function searchHome(keyword: string): Promise<{ list: HomeCourseItem[] }> {
  return http.get<{ list: HomeCourseItem[] }>('/student/home/search', { keyword })
}
