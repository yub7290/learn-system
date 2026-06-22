/** 后端接口基地址。dev 指向本地后端,prod 可改环境变量或构建期替换。 */
export const BASE_URL = 'http://localhost:8001/api'

/** 不需要鉴权的路径前缀(与后端 SecurityConfig permitAll 对齐) */
export const PUBLIC_PATHS = [
  '/student/auth/login',
  '/student/auth/captcha',
  '/student/auth/refresh/',
]
