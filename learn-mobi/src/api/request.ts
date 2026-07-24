import { BASE_URL, PUBLIC_PATHS } from '../env'
import { clearTokens, getAccessToken, getRefreshToken, requireLogin, setTokens } from '../utils/auth'
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
    flushRetries: (ok: boolean) => {
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
  /** 请求超时时间（毫秒），默认60000 */
  timeout?: number
  /** 为 true 时即使有 token 也不带 Authorization(如刷新接口本身) */
  skipAuth?: boolean
  /** 为 true 时 401 才提示登录,默认允许页面自行展示空态 */
  requireAuth?: boolean
  /** 为 false 时不展示业务错误 toast */
  showError?: boolean
}

const queue = createRefreshQueue()

function isPublic(url: string): boolean {
  return PUBLIC_PATHS.some((p) => url.startsWith(p))
}

/** 调用刷新接口,返回是否成功 */
// 故意直接用 uni.request 而非 request({skipAuth:true}),避免刷新接口自身 401 时陷入续签递归
function doRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return Promise.resolve(false)
  return new Promise((resolve) => {
    uni.request({
      url: `${BASE_URL}/student/auth/refresh/${refreshToken}`,
      method: 'POST',
      success: (res: any) => {
        const r = res.data as Response<{ accessToken: string; refreshToken: string }>
        if (r != null && typeof r === 'object' && r.code === 200 && r.data?.accessToken) {
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
  const { url, method = 'GET', data, header = {}, timeout, skipAuth = false, requireAuth = false, showError = true } = opts
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
        timeout: timeout || 60000,
        success: async (res: any) => {
          try {
            const r = res.data as Response<T>
            // 401 且该请求非刷新接口本身 → 尝试续签
            if (res.statusCode === 401 && !url.startsWith('/student/auth/refresh')) {
              if (!getRefreshToken()) {
                clearTokens()
                if (requireAuth) {
                  requireLogin('登录已过期,请重新登录')
                }
                reject(new Error('unauthorized'))
                return
              }
              if (queue.isRefreshing()) {
                // 排队等刷新完成后重放
                queue.enqueueRetry(() => {
                  request<T>(opts).then(resolve).catch(reject)
                })
                return
              }
              queue.startRefreshing()
              const ok = getRefreshToken() ? await doRefresh() : false
              await queue.flushRetries(ok)
              if (ok) {
                // 续签成功,重放本次
                request<T>(opts).then(resolve).catch(reject)
              } else {
                clearTokens()
                if (requireAuth) {
                  requireLogin('登录已过期,请重新登录')
                }
                reject(new Error('unauthorized'))
              }
              return
            }
            // 响应体格式校验:防止网关返回非 JSON(HTML 错误页等)导致 r.code 未定义
            if (r == null || typeof r !== 'object' || typeof (r as any).code !== 'number') {
              if (showError) uni.showToast({ title: '服务器响应格式异常', icon: 'none' })
              reject(new Error('invalid response body'))
              return
            }
            if (r.code === 200) {
              resolve(r.data)
            } else {
              const err = new Error(r.message || `code ${r.code}`)
              // 透传业务码，便于调用方针对具体错误（如课程无权限 200311）做差异化引导
              ;(err as any).code = r.code
              if (showError) uni.showToast({ title: r.message || '请求失败', icon: 'none' })
              reject(err)
            }
          } catch (err) {
            reject(err instanceof Error ? err : new Error(String(err)))
          }
        },
        fail: () => {
          if (showError) uni.showToast({ title: '网络异常,请稍后重试', icon: 'none' })
          reject(new Error('network error'))
        },
      })
    }
    doRequest()
  })
}

export interface UploadOptions {
  /** 文件本地路径（uni.chooseImage 返回的 tempFilePath） */
  filePath: string
  /** 后端文件字段名，默认 file */
  name?: string
  /** 额外表单字段 */
  formData?: Record<string, string>
}

/** 文件上传，返回后端 Response.data 中的 URL 字符串 */
export function uploadFile(opts: UploadOptions): Promise<string> {
  const { filePath, name = 'file', formData: extra = {} } = opts
  const fullUrl = `${BASE_URL}/edu/upload/image`
  const authHeader: Record<string, string> = {}
  if (getAccessToken()) {
    authHeader['Authorization'] = `Bearer ${getAccessToken()}`
  }

  // H5模式：filePath是blob/data URL，用fetch+FormData上传
  // #ifdef H5
  return h5Upload(fullUrl, filePath, name, extra, authHeader)
  // #endif
  // #ifndef H5
  return uniUpload(fullUrl, filePath, name, extra, authHeader)
  // #endif
}

// #ifdef H5
function h5Upload(url: string, filePath: string, name: string, extra: Record<string, string>, headers: Record<string, string>): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    fetch(filePath)
      .then(res => res.blob())
      .then(blob => {
        const fd = new FormData()
        fd.append(name, blob, 'upload.jpg')
        Object.entries(extra).forEach(([k, v]) => fd.append(k, v))
        const xhr = new XMLHttpRequest()
        xhr.open('POST', url, true)
        if (headers['Authorization']) xhr.setRequestHeader('Authorization', headers['Authorization'])
        xhr.onload = () => {
          try {
            const r = JSON.parse(xhr.responseText) as Response<string>
            if (r.code === 200 && r.data) resolve(r.data)
            else reject(new Error(r.message || '上传失败'))
          } catch { reject(new Error('上传响应格式异常')) }
        }
        xhr.onerror = () => reject(new Error('上传网络异常'))
        xhr.send(fd)
      })
      .catch(() => reject(new Error('上传网络异常')))
  })
}
// #endif

// #ifndef H5
function uniUpload(url: string, filePath: string, name: string, extra: Record<string, string>, headers: Record<string, string>): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    uni.uploadFile({
      url,
      filePath,
      name,
      formData: { ...extra },
      header: headers,
      success: (res) => {
        try {
          const r = JSON.parse(res.data) as Response<string>
          if (r.code === 200 && r.data) resolve(r.data)
          else reject(new Error(r.message || '上传失败'))
        } catch { reject(new Error('上传响应格式异常')) }
      },
      fail: () => reject(new Error('上传网络异常')),
    })
  })
}
// #endif

export const http = {
  get: <T = any>(url: string, data?: any, header?: Record<string, string>, options?: Pick<RequestOptions, 'requireAuth' | 'showError' | 'skipAuth' | 'timeout'>) =>
    request<T>({ url, method: 'GET', data, header, ...options }),
  post: <T = any>(url: string, data?: any, header?: Record<string, string>, options?: Pick<RequestOptions, 'requireAuth' | 'showError' | 'skipAuth' | 'timeout'>) =>
    request<T>({ url, method: 'POST', data, header, ...options }),
  put: <T = any>(url: string, data?: any, header?: Record<string, string>, options?: Pick<RequestOptions, 'requireAuth' | 'showError' | 'skipAuth' | 'timeout'>) =>
    request<T>({ url, method: 'PUT', data, header, ...options }),
  delete: <T = any>(url: string, data?: any, header?: Record<string, string>, options?: Pick<RequestOptions, 'requireAuth' | 'showError' | 'skipAuth' | 'timeout'>) =>
    request<T>({ url, method: 'DELETE', data, header, ...options }),
}
