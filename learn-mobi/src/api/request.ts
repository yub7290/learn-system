import { BASE_URL, PUBLIC_PATHS } from '../env'
import { getAccessToken, getRefreshToken, setTokens, clearTokens, redirectLogin } from '../utils/auth'
import type { Response } from '../types/response'

/** 续签队列:纯逻辑,可单测 */
export function createRefreshQueue() {
  let refreshing = false
  let pending: Array<() => void> = []
  return {
    isRefreshing: () => refreshing,
    pendingCount: () => pending.length,
    startRefreshing: () => { refreshing = true },
    enqueueRetry: (fn: () => void) => { pending.push(fn) },
    /** ok=true 刷新成功:重放并清空;ok=false 刷新失败:清空不重放 */
    flushRetries: async (ok: boolean) => {
      const list = pending
      pending = []
      refreshing = false
      if (ok) list.forEach((fn) => fn())
    },
  }
}

export interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
  /** 为 true 时即使有 token 也不带 Authorization(如刷新接口本身) */
  skipAuth?: boolean
}

const queue = createRefreshQueue()

function isPublic(url: string): boolean {
  return PUBLIC_PATHS.some((p) => url.startsWith(p))
}

/** 调用刷新接口,返回是否成功 */
function doRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return Promise.resolve(false)
  return new Promise((resolve) => {
    uni.request({
      url: `${BASE_URL}/student/auth/refresh/${refreshToken}`,
      method: 'POST',
      success: (res: any) => {
        const r = res.data as Response<{ accessToken: string; refreshToken: string }>
        if (r.code === 200 && r.data?.accessToken) {
          setTokens(r.data.accessToken, r.data.refreshToken)
          resolve(true)
        } else {
          resolve(false)
        }
      },
      fail: () => resolve(false),
    })
  })
}

/** 核心请求方法,返回 Promise<T>(T 为 Response.data) */
export function request<T = any>(opts: RequestOptions): Promise<T> {
  const { url, method = 'GET', data, header = {}, skipAuth = false } = opts
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`

  const finalHeader: Record<string, string> = { 'Content-Type': 'application/json', ...header }
  if (!skipAuth && !isPublic(url) && getAccessToken()) {
    finalHeader['Authorization'] = `Bearer ${getAccessToken()}`
  }

  return new Promise<T>((resolve, reject) => {
    const doRequest = () => {
      uni.request({
        url: fullUrl,
        method,
        data,
        header: finalHeader,
        success: async (res: any) => {
          const r = res.data as Response<T>
          // 401 且该请求非刷新接口本身 → 尝试续签
          if (res.statusCode === 401 && !url.startsWith('/student/auth/refresh')) {
            if (queue.isRefreshing()) {
              // 排队等刷新完成后重放
              queue.enqueueRetry(() => {
                request<T>(opts).then(resolve).catch(reject)
              })
              return
            }
            queue.startRefreshing()
            const ok = await doRefresh()
            await queue.flushRetries(ok)
            if (ok) {
              // 续签成功,重放本次
              request<T>(opts).then(resolve).catch(reject)
            } else {
              redirectLogin()
              reject(new Error('登录已过期,请重新登录'))
            }
            return
          }
          if (r.code === 200) {
            resolve(r.data)
          } else {
            uni.showToast({ title: r.message || '请求失败', icon: 'none' })
            reject(new Error(r.message || `code ${r.code}`))
          }
        },
        fail: () => {
          uni.showToast({ title: '网络异常,请稍后重试', icon: 'none' })
          reject(new Error('network error'))
        },
      })
    }
    doRequest()
  })
}

export const http = {
  get: <T = any>(url: string, data?: any, header?: Record<string, string>) =>
    request<T>({ url, method: 'GET', data, header }),
  post: <T = any>(url: string, data?: any, header?: Record<string, string>) =>
    request<T>({ url, method: 'POST', data, header }),
  put: <T = any>(url: string, data?: any, header?: Record<string, string>) =>
    request<T>({ url, method: 'PUT', data, header }),
  delete: <T = any>(url: string, data?: any, header?: Record<string, string>) =>
    request<T>({ url, method: 'DELETE', data, header }),
}
