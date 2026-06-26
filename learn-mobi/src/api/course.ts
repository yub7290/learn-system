import { http } from './request'
import type { CategoryNode, CourseListItem, CourseDetailVO, ChapterDetailVO, ChapterListItem } from '../types/course'
import type { KnowledgeItemVO, KnowledgeDetailVO, KnowledgeCategoryVO } from '../types/knowledge'

/* ===== Mock Data ===== */

const mockCategory: CategoryNode[] = [
  {
    id: 1, name: '编程开发',
    children: [
      { id: 11, name: '前端开发' }, { id: 12, name: '后端开发' },
      { id: 13, name: '移动开发' }, { id: 14, name: '人工智能' },
    ],
  },
  {
    id: 2, name: '设计创意',
    children: [
      { id: 21, name: 'UI/UX设计' }, { id: 22, name: '平面设计' },
      { id: 23, name: '视频剪辑' }, { id: 24, name: '3D建模' },
    ],
  },
  {
    id: 3, name: '职场技能',
    children: [
      { id: 31, name: '办公软件' }, { id: 32, name: '沟通表达' },
      { id: 33, name: '项目管理' }, { id: 34, name: '数据分析' },
    ],
  },
  {
    id: 4, name: '语言学习',
    children: [
      { id: 41, name: '英语' }, { id: 42, name: '日语' },
      { id: 43, name: '韩语' }, { id: 44, name: '法语' },
    ],
  },
]

const mockCourseList: CourseListItem[] = [
  { id: 1, imageUrl: 'https://picsum.photos/seed/c1/400/240', name: 'Vue3 实战项目开发', courseType: 1, teacherName: '张老师', feeType: '免费' },
  { id: 2, imageUrl: 'https://picsum.photos/seed/c2/400/240', name: 'Spring Boot 微服务架构', courseType: 1, teacherName: '李老师', feeType: '限免' },
  { id: 3, imageUrl: 'https://picsum.photos/seed/c3/400/240', name: 'TypeScript 从入门到精通', courseType: 1, teacherName: '王老师', feeType: '免费' },
  { id: 4, imageUrl: 'https://picsum.photos/seed/c4/400/240', name: 'UI 设计基础与实践', courseType: 2, teacherName: '赵老师' },
  { id: 5, imageUrl: 'https://picsum.photos/seed/c5/400/240', name: 'Python 数据分析', courseType: 1, teacherName: '陈老师', feeType: '试学' },
  { id: 6, imageUrl: 'https://picsum.photos/seed/c6/400/240', name: 'React 18 新特性解析', courseType: 1, teacherName: '刘老师', feeType: '免费' },
  { id: 7, imageUrl: 'https://picsum.photos/seed/c7/400/240', name: 'Flutter 跨平台开发', courseType: 1, teacherName: '周老师' },
  { id: 8, imageUrl: 'https://picsum.photos/seed/c8/400/240', name: 'MySQL 数据库优化', courseType: 1, teacherName: '吴老师', feeType: '限免' },
]

const mockCourseDetail: CourseDetailVO = {
  course: {
    title: 'Vue3 实战项目开发',
    bannerImg: 'https://picsum.photos/seed/detail/800/400',
    viewNum: 1286,
    freeFlag: true,
    desc: '本课程从零开始，带领学员掌握 Vue3 核心特性与 Composition API，通过企业级实战项目掌握组件化开发、状态管理、路由守卫、权限控制等核心技术栈，最终独立完成完整的前端项目开发。',
    target: '1. 掌握 Vue3 Composition API 与 setup 语法糖\n2. 熟练运用 Pinia 状态管理与 Vue Router\n3. 具备独立开发企业级前端项目能力\n4. 理解前后端分离架构与接口联调',
  },
  chapter: [
    { id: 101, name: '课程概述与环境搭建' },
    { id: 102, name: 'Composition API 核心' },
    { id: 103, name: '组件化开发实战' },
    { id: 104, name: '状态管理 Pinia' },
    { id: 105, name: '路由与权限控制' },
    { id: 106, name: '项目实战与部署' },
  ],
  teacher: { avatar: 'https://picsum.photos/seed/teacher/200/200', name: '张老师', intro: '资深前端工程师，8年一线开发经验，曾就职于多家互联网大厂，擅长 Vue/React 技术栈，授课风格深入浅出。' },
}

/* ===== API Functions ===== */

export function getCourseCategory(): Promise<{ list: CategoryNode[] }> {
  return http.get<{ list: CategoryNode[] }>('/student/course/category').catch(() =>
    Promise.resolve({ list: mockCategory })
  )
}
export function getCourseList(params: { cateId: number; tabType: number; page: number; pageSize: number }): Promise<{ list: CourseListItem[]; total: number }> {
  return http.get('/student/course/list', params).catch(() =>
    Promise.resolve({
      list: mockCourseList.slice((params.page - 1) * params.pageSize, params.page * params.pageSize),
      total: mockCourseList.length,
    })
  )
}
export function searchCourse(params: { keyword?: string; cateId?: number; tabType?: number }): Promise<{ list: CourseListItem[] }> {
  return http.get('/student/course/search', params).catch(() =>
    Promise.resolve({
      list: mockCourseList.filter((c) => !params.keyword || c.name.includes(params.keyword)),
    })
  )
}
export function getCourseDetail(cid: number): Promise<CourseDetailVO> {
  return http.get<CourseDetailVO>('/student/course/detail', { cid }).catch(() =>
    Promise.resolve(mockCourseDetail)
  )
}
export function getChapterList(cid: number): Promise<{ list: ChapterListItem[] }> {
  return http.get<{ list: ChapterListItem[] }>('/student/chapter/list', { cid }).catch(() =>
    Promise.resolve({
      list: mockCourseDetail.chapter.map((ch, i) => ({ id: ch.id, chapterName: `第${i + 1}章 ${ch.name}` })),
    })
  )
}
export function getChapterDetail(chId: number, cid: number): Promise<ChapterDetailVO> {
  return http.get<ChapterDetailVO>('/student/chapter/detail', { chId, cid }).catch(() => {
    const mockChapterDetail: ChapterDetailVO = {
      id: chId,
      mediaSrc: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
      mediaType: 'video',
      article: '## 本章导读\n\n本章主要介绍课程的整体架构、学习目标与前置知识要求。\n\n### 学习要点\n1. 理解课程定位与学习路径\n2. 掌握基础概念与核心原理\n3. 完成环境搭建与工具配置\n\n学习完成后请完成课后习题巩固知识点。',
      attachList: [
        { id: 1, fileName: '第1章学习大纲.pdf', fileSize: '2.3MB' },
        { id: 2, fileName: '配套练习题库.docx', fileSize: '1.1MB' },
      ],
    }
    return mockChapterDetail
  })
}

/**
 * 获取课程知识库分类列表（Mock 实现）
 */
export function getCourseKnowledgeCategoryList(cid: number): Promise<KnowledgeCategoryVO[]> {
  return http.get<KnowledgeCategoryVO[]>('/student/course/knowledge/category', { cid }).catch(() =>
    Promise.resolve([
      { id: 1, name: '基础概念', children: [{ id: 11, name: '核心术语' }, { id: 12, name: '基础原理' }] },
      { id: 2, name: '进阶技巧', children: [{ id: 21, name: '性能优化' }, { id: 22, name: '最佳实践' }] },
      { id: 3, name: '常见问题' },
    ])
  )
}

/**
 * 获取课程知识点列表（Mock 实现）
 */
export function getCourseKnowledgeList(cid: number): Promise<KnowledgeItemVO[]> {
  return http.get<KnowledgeItemVO[]>('/student/course/knowledge/list', { cid }).catch(() =>
    Promise.resolve([
      { id: 101, name: 'Vue3 响应式原理', courseId: cid, courseName: 'Vue3 实战项目开发', masteryPercent: 60, questionCount: 12, difficulty: 3 },
      { id: 102, name: 'Composition API 详解', courseId: cid, courseName: 'Vue3 实战项目开发', masteryPercent: 45, questionCount: 8, difficulty: 4 },
      { id: 103, name: '组件通信方式', courseId: cid, courseName: 'Vue3 实战项目开发', masteryPercent: 80, questionCount: 15, difficulty: 2 },
      { id: 104, name: 'Pinia 状态管理', courseId: cid, courseName: 'Vue3 实战项目开发', masteryPercent: 30, questionCount: 10, difficulty: 4 },
    ])
  )
}

/**
 * 获取课程知识点详情（Mock 实现）
 */
export function getCourseKnowledgeDetail(cid: number, knowledgeId: number): Promise<KnowledgeDetailVO> {
  return http.get<KnowledgeDetailVO>('/student/course/knowledge/detail', { cid, knowledgeId }).catch(() =>
    Promise.resolve({
      id: knowledgeId,
      name: 'Vue3 响应式原理',
      content: 'Vue3 使用 Proxy 替代 Vue2 的 Object.defineProperty 实现响应式，解决了无法侦测数组/对象新增属性的问题。核心包括 reactive、ref、computed 等 API。',
      important: true,
      questionIds: [1001, 1002, 1003],
      videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
      masteryPercent: 60,
    })
  )
}
