import { sm3 } from 'sm-crypto'

/**
 * 对明文做 SM3 哈希,返回 64 位十六进制字符串。
 * 与后端密码链路一致:前端 SM3(明文) → 后端 BCrypt(SM3 值)。
 */
export function sm3Hash(plain: string): string {
  return sm3(plain)
}
