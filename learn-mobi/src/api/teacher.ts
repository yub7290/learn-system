import { http } from './request'
import type { TeacherListItem, TeacherInfoVO, TeacherCourseVO } from '../types/teacher'

export function getTeacherDetail(tid: number): Promise<{ info: TeacherInfoVO; course: TeacherCourseVO[] }> {
  return http.get('/student/home/teacher/info', { tid })
}

/**
 * 获取学生端教师列表（所有启用教师）
 */
export function getTeacherList(): Promise<{ list: TeacherListItem[] }> {
  return http.get<{ list: TeacherListItem[] }>('/student/home/teacher/list')
}
