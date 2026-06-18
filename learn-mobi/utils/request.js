/**
 * HTTP 请求工具 - UTS 兼容版本
 * 使用 uni.request 回调模式，不用 Promise
 */

const BASE_URL = 'http://localhost:8001/api'

export function getToken() {
  return uni.getStorageSync('access_token') || ''
}

export function setToken(token) {
  uni.setStorageSync('access_token', token)
}

export function setRefreshToken(token) {
  uni.setStorageSync('refresh_token', token)
}

export function getUserInfo() {
  return uni.getStorageSync('user_info') || null
}

export function setUserInfo(info) {
  uni.setStorageSync('user_info', info)
}

export function clearAuth() {
  uni.removeStorageSync('access_token')
  uni.removeStorageSync('refresh_token')
  uni.removeStorageSync('user_info')
}

export function isLoggedIn() {
  const token = getToken()
  return token != null && token !== ''
}

/**
 * 封装请求 - 使用回调方式
 * options: { url, method, data, success, fail, showLoading }
 */
export function request(options) {
  const url = options.url || ''
  const method = options.method || 'GET'
  const data = options.data
  const onSuccess = options.success
  const onFail = options.fail
  const showError = options.showError !== false

  let fullUrl = url
  if (url.indexOf('http') !== 0) {
    fullUrl = BASE_URL + url
  }

  const token = getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token != null && token !== '') {
    headers['Authorization'] = 'Bearer ' + token
  }

  uni.request({
    url: fullUrl,
    method: method,
    data: data,
    header: headers,
    success(res) {
      const r = res
      if (r.statusCode === 200) {
        const responseData = r.data
        if (responseData.code === 200) {
          if (onSuccess) onSuccess(responseData)
        } else {
          if (showError) uni.showToast({ title: responseData.msg || '请求失败', icon: 'none' })
          if (onFail) onFail(responseData)
        }
      } else if (r.statusCode === 401) {
        clearAuth()
        uni.reLaunch({ url: '/pages/login/login' })
        if (onFail) onFail(r.data)
      } else {
        if (showError) uni.showToast({ title: '请求失败', icon: 'none' })
        if (onFail) onFail(r.data)
      }
    },
    fail(err) {
      if (showError) uni.showToast({ title: '网络连接失败', icon: 'none' })
      if (onFail) onFail(err)
    }
  })
}
