import { http } from './request'
import type {
  CourseKnowledgeRespVO,
  KnowledgeDetailVO,
} from '../types/knowledge'

/**
 * 获取课程知识库（按章节分组 + 未分组知识点）
 * @param courseId 课程ID
 */
export function getCourseKnowledgeList(courseId: number): Promise<CourseKnowledgeRespVO> {
  return http.get<CourseKnowledgeRespVO>(`/student/course/${courseId}/knowledge`)
}

/**
 * 获取知识点详情
 * @param id 知识点ID
 */
export function getKnowledgeDetail(id: number): Promise<KnowledgeDetailVO> {
  return http.get<KnowledgeDetailVO>(`/student/knowledge/${id}`)
}
