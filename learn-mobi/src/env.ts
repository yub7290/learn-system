/**
 * 后端接口基地址。
 * - 开发环境 (dev): 直连本地后端 http://localhost:8001/api
 * - 生产环境 (prod): 通过 /api 由 Nginx 反向代理到后端
 *
 * 可通过环境变量 VITE_API_BASE_URL 覆盖，如：
 *   VITE_API_BASE_URL=https://api.example.com/api
 */
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * 前端/H5 应用基地址（用于生成分享邀请链接，指向 H5 页面而非后端 API）。
 * 默认本地开发地址 http://localhost:5173；生产环境通过 VITE_H5_BASE_URL 覆盖为 H5 域名。
 */
export const H5_BASE_URL = import.meta.env.VITE_H5_BASE_URL || 'http://localhost:5173'

/** 不需要鉴权的路径前缀(与后端 SecurityConfig permitAll 对齐) */
export const PUBLIC_PATHS = [
  '/student/auth/login',
  '/student/auth/captcha',
  '/student/auth/register',
  '/student/auth/refresh/',
  '/student/auth/oauth/',
]
