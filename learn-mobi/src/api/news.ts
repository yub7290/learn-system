import { http } from './request'
import type { NewsVO, NewsCategoryVO } from '../types/news'
import { isLoggedIn } from '../utils/auth'

/**
 * 获取资讯分类列表
 */
export function getNewsCategories(): Promise<NewsCategoryVO[]> {
  return http.get<NewsCategoryVO[]>('/app/news/categories')
}

/**
 * 获取资讯列表（分页，仅已发布，可按分类筛选）
 */
export function getNewsPage(params: {
  page: number
  pageSize: number
  categoryId?: number
}): Promise<{ list: NewsVO[]; total: number }> {
  if (!isLoggedIn()) return Promise.resolve({ list: [], total: 0 })
  return http
    .post<{ records: NewsVO[]; total: number }>('/app/news/page', {
      pageParam: { pageNum: params.page, pageSize: params.pageSize },
      queryParam: { categoryId: params.categoryId ?? null },
    })
    .then((res) => ({ list: res.records || [], total: res.total || 0 }))
}

/**
 * 获取资讯详情（阅读量 +1）
 */
export function getNewsDetail(id: number): Promise<NewsVO> {
  return http.get<NewsVO>(`/app/news/${id}`)
}
