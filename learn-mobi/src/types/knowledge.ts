/**
 * 知识库/知识点 - TypeScript 类型定义
 */

/** 知识点列表项 */
export interface KnowledgeItemVO {
  /** 知识点ID */
  id: number
  /** 知识点名称 */
  name: string
  /** 所属课程ID */
  courseId: number
  /** 所属课程名称 */
  courseName: string
  /** 掌握度: 0-100 */
  masteryPercent: number
  /** 相关题目数量 */
  questionCount: number
  /** 难度: 1-5 */
  difficulty: number
}

/** 知识点详情 */
export interface KnowledgeDetailVO {
  /** 知识点ID */
  id: number
  /** 知识点名称 */
  name: string
  /** 知识点内容 */
  content: string
  /** 重点标记 */
  important: boolean
  /** 相关题目ID列表 */
  questionIds: number[]
  /** 关联视频地址 */
  videoUrl?: string
  /** 掌握度: 0-100 */
  masteryPercent: number
}

/** 知识库分类 */
export interface KnowledgeCategoryVO {
  /** 分类ID */
  id: number
  /** 分类名称 */
  name: string
  /** 父分类ID */
  parentId?: number
  /** 子分类 */
  children?: KnowledgeCategoryVO[]
}
