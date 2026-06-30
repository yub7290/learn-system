/**
 * 知识库/知识点 - 类型定义
 *
 * 对接后端返回的真实字段，无任何 mock 字段。
 */

/** 知识库知识点列表项 */
export interface KnowledgeItemVO {
  id: number
  title: string
  categoryName?: string
}

/** 按章节分组的知识库组 */
export interface CourseKnowledgeGroupVO {
  chapterId: number
  chapterName: string
  knowledgeList: KnowledgeItemVO[]
}

/** 课程知识库响应 */
export interface CourseKnowledgeRespVO {
  courseId: number
  courseName: string
  groups: CourseKnowledgeGroupVO[]
  unassigned: KnowledgeItemVO[]
}

/** 知识点详情 */
export interface KnowledgeDetailVO {
  id: number
  title: string
  content: string
  categoryName?: string
}
