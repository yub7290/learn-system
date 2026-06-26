import type {
  KnowledgeItemVO,
  KnowledgeDetailVO,
  KnowledgeCategoryVO
} from '../types/knowledge'

const mockCategoryList: KnowledgeCategoryVO[] = [
  {
    id: 1, name: '基础概念',
    children: [
      { id: 11, name: '核心术语' },
      { id: 12, name: '基础原理' },
      { id: 13, name: '发展历程' },
    ],
  },
  {
    id: 2, name: '进阶技巧',
    children: [
      { id: 21, name: '性能优化' },
      { id: 22, name: '最佳实践' },
      { id: 23, name: '设计模式' },
    ],
  },
  {
    id: 3, name: '常见问题',
    children: [
      { id: 31, name: '错误处理' },
      { id: 32, name: '兼容性' },
    ],
  },
]

const mockKnowledgeList: KnowledgeItemVO[] = [
  { id: 101, name: '响应式原理', courseId: 1, courseName: 'Vue3 实战项目开发', masteryPercent: 60, questionCount: 12, difficulty: 3 },
  { id: 102, name: 'Composition API', courseId: 1, courseName: 'Vue3 实战项目开发', masteryPercent: 45, questionCount: 8, difficulty: 4 },
  { id: 103, name: '组件通信方式', courseId: 1, courseName: 'Vue3 实战项目开发', masteryPercent: 80, questionCount: 15, difficulty: 2 },
  { id: 104, name: '路由守卫', courseId: 1, courseName: 'Vue3 实战项目开发', masteryPercent: 35, questionCount: 6, difficulty: 3 },
  { id: 105, name: 'Pinia 状态管理', courseId: 1, courseName: 'Vue3 实战项目开发', masteryPercent: 30, questionCount: 10, difficulty: 4 },
  { id: 201, name: '依赖注入', courseId: 2, courseName: 'Spring Boot 微服务架构', masteryPercent: 50, questionCount: 7, difficulty: 3 },
  { id: 202, name: 'AOP 面向切面', courseId: 2, courseName: 'Spring Boot 微服务架构', masteryPercent: 40, questionCount: 5, difficulty: 4 },
  { id: 203, name: '数据库事务', courseId: 2, courseName: 'Spring Boot 微服务架构', masteryPercent: 70, questionCount: 9, difficulty: 2 },
]

const mockDetailMap: Record<number, KnowledgeDetailVO> = {
  101: {
    id: 101, name: '响应式原理', important: true,
    content: '## 一、什么是响应式\n\nVue3 使用 Proxy 替代 Vue2 的 Object.defineProperty 实现响应式，解决了无法侦测数组/对象新增属性的问题。\n\n### 核心 API\n- reactive：将对象转换为响应式\n- ref：将基本类型转换为响应式\n- computed：创建计算属性\n- watch：侦听数据变化\n\n### 实现原理\n1. 通过 Proxy 代理对象操作\n2. 依赖收集（track）\n3. 触发更新（trigger）',
    questionIds: [1001, 1002, 1003],
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    masteryPercent: 60,
  },
  102: {
    id: 102, name: 'Composition API', important: true,
    content: '## 二、Composition API\n\nVue3 引入了 Composition API，提供了更灵活的逻辑复用方式。\n\n### setup 函数\nsetup 是 Composition API 的入口，在组件创建之前执行。\n\n### 生命周期\n- onMounted\n- onUpdated\n- onUnmounted\n- onBeforeMount\n\n### 逻辑复用\n通过组合函数（Composables）实现跨组件的逻辑复用。',
    questionIds: [1004, 1005],
    masteryPercent: 45,
  },
  103: {
    id: 103, name: '组件通信方式', important: false,
    content: '## 三、组件通信\n\nVue3 支持多种组件通信方式。\n\n### 父子通信\n- props / emit\n- v-model\n- provide / inject\n\n### 跨级通信\n- provide / inject\n- Event Bus\n- Pinia 状态管理',
    questionIds: [1006, 1007, 1008],
    masteryPercent: 80,
  },
}

/**
 * 获取知识库分类列表
 */
export function getKnowledgeCategoryList(courseId?: number): Promise<KnowledgeCategoryVO[]> {
  return Promise.resolve(mockCategoryList)
}

/**
 * 获取知识点列表
 */
export function getKnowledgeList(params: {
  courseId?: number
  categoryId?: number
  keyword?: string
  page: number
  pageSize: number
}): Promise<{ list: KnowledgeItemVO[]; total: number }> {
  let list = mockKnowledgeList
  if (params.courseId) {
    list = list.filter((item) => item.courseId === params.courseId)
  }
  if (params.keyword) {
    list = list.filter((item) => item.name.includes(params.keyword!))
  }
  const start = (params.page - 1) * params.pageSize
  return Promise.resolve({
    list: list.slice(start, start + params.pageSize),
    total: list.length,
  })
}

/**
 * 获取知识点详情
 */
export function getKnowledgeDetail(knowledgeId: number): Promise<KnowledgeDetailVO> {
  const detail = mockDetailMap[knowledgeId]
  if (detail) return Promise.resolve(detail)
  // Default fallback
  return Promise.resolve({
    id: knowledgeId,
    name: '知识点详情',
    content: '暂无内容',
    important: false,
    questionIds: [],
    masteryPercent: 0,
  })
}
