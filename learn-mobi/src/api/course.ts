import { http } from './request'
import type { CategoryNode, CourseListItem, CourseDetailVO, ChapterDetailVO, ChapterListItem, CourseScoreVO } from '../types/course'
import { isLoggedIn } from '../utils/auth'
import { COURSE_NO_ACCESS_CODE } from '../utils/permission'

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
  return http.get<CourseDetailVO>('/student/course/detail', { cid }).catch((err: any) => {
    // 权限不足（200311）属业务拦截：降级为 mock 但明确标记不可学，
    // 避免详情页误显示「开始学习」（与 getChapterDetail 拦截语义一致，且不引发空白页/死循环）
    if (err && err.code === COURSE_NO_ACCESS_CODE) return { ...mockCourseDetail, accessible: false }
    return mockCourseDetail
  })
}
export function getChapterList(cid: number): Promise<{ list: ChapterListItem[] }> {
  return http.get<{ list: ChapterListItem[] }>('/student/chapter/list', { cid }).catch((err: any) => {
    // 权限不足（200311）属业务拦截，绝不降级为 mock，避免抽屉展示 mock 章节
    if (err && err.code === COURSE_NO_ACCESS_CODE) throw err
    return Promise.resolve({
      list: mockCourseDetail.chapter.map((ch, i) => ({ id: ch.id, chapterName: `第${i + 1}章 ${ch.name}` })),
    })
  })
}
export function getChapterDetail(chId: number, cid: number): Promise<ChapterDetailVO> {
  if (!isLoggedIn()) return Promise.reject(new Error('unauthorized'))
  return http.get<ChapterDetailVO>('/student/chapter/detail', { chId, cid }, undefined, { showError: false }).catch((err: any) => {
    // 权限不足（200311）属业务拦截，绝不降级为 mock，避免越权返回章节视频/附件
    if (err && err.code === COURSE_NO_ACCESS_CODE) throw err
    const mockChapterDetail: ChapterDetailVO = {
      id: chId,
      mediaSrc: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
      mediaType: 'video',
      videoList: [
        { id: 1, videoName: '课程导学', videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4', fileSize: 1024 * 1024 * 12 },
      ],
      article: '## 本章导读\n\n本章主要介绍课程的整体架构、学习目标与前置知识要求。\n\n### 学习要点\n1. 理解课程定位与学习路径\n2. 掌握基础概念与核心原理\n3. 完成环境搭建与工具配置\n\n学习完成后请完成课后习题巩固知识点。',
      attachList: [
        { id: 1, fileName: '第1章学习大纲.pdf', fileSize: '2.3MB' },
        { id: 2, fileName: '配套练习题库.docx', fileSize: '1.1MB' },
      ],
    }
    return mockChapterDetail
  })
}

/** 获取课程综合成绩（不使用mock，直接请求后端） */
export function getCourseScore(courseId: number): Promise<CourseScoreVO | null> {
  if (!isLoggedIn()) return Promise.resolve(null)
  return http.get<CourseScoreVO | null>(`/student/course/${courseId}/score`, undefined, undefined, { requireAuth: true })
}
