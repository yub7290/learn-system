import { http } from './request'
import type { AnnouncementVO } from '../types/course'

/**
 * 获取课程已启用的公告列表
 *
 * @param courseId 课程ID
 * @returns 公告列表
 */
export function getAnnouncementList(courseId: number): Promise<AnnouncementVO[]> {
  return http.get<AnnouncementVO[]>(`/student/course/${courseId}/announcement/list`)
}

/**
 * 获取公告详情
 *
 * @param id 公告ID
 * @returns 公告详情
 */
export function getAnnouncementDetail(id: number): Promise<AnnouncementVO> {
  return http.get<AnnouncementVO>(`/student/course/announcement/${id}`)
}
