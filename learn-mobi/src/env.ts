/**
 * 后端接口基地址。
 * - 开发环境 (dev): 直连本地后端 http://localhost:8001/api
 * - 生产环境 (prod): 通过 /api 由 Nginx 反向代理到后端
 *
 * 可通过环境变量 VITE_API_BASE_URL 覆盖，如：
 *   VITE_API_BASE_URL=https://api.example.com/api
 */
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/** 不需要鉴权的路径前缀(与后端 SecurityConfig permitAll 对齐) */
export const PUBLIC_PATHS = [
  '/student/auth/login',
  '/student/auth/captcha',
  '/student/auth/refresh/',
]
