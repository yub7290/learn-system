import { http } from './request'
import type { TeacherListItem } from '../types/teacher'

/**
 * 获取学生端教师列表（所有启用教师）
 */
export function getTeacherList(): Promise<{ list: TeacherListItem[] }> {
  return http.get<{ list: TeacherListItem[] }>('/student/home/teacher/list')
}
