import { http } from './request'
import type { NoticeVO, NoticeUnreadVO } from '../types/notice'
import { isLoggedIn } from '../utils/auth'

/**
 * 获取通知列表（分页，含是否已读标记）
 */
export function getNoticePage(params: {
  page: number
  pageSize: number
  type?: number
}): Promise<{ list: NoticeVO[]; total: number }> {
  if (!isLoggedIn()) return Promise.resolve({ list: [], total: 0 })
  return http
    .post<{ records: NoticeVO[]; total: number }>('/app/notice/page', {
      pageParam: { pageNum: params.page, pageSize: params.pageSize },
      queryParam: { type: params.type ?? null },
    })
    .then((res) => ({ list: res.records || [], total: res.total || 0 }))
}

/**
 * 获取通知详情（打开即标记已读）
 */
export function getNoticeDetail(id: number): Promise<NoticeVO> {
  return http.get<NoticeVO>(`/app/notice/${id}`)
}

/**
 * 获取未读通知数
 */
export function getNoticeUnread(): Promise<NoticeUnreadVO> {
  return http.get<NoticeUnreadVO>('/app/notice/unread/count')
}
