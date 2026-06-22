import { describe, it, expect } from 'vitest'
import { sm3Hash } from '../src/utils/sm3'

describe('sm3Hash', () => {
  it('对空字符串返回标准 SM3 摘要', () => {
    // SM3("") = 1ab21d8355cfa17f8e61194831e81a8f22bec8c728fefb747ed035eb5082aa2b
    expect(sm3Hash('')).toBe('1ab21d8355cfa17f8e61194831e81a8f22bec8c728fefb747ed035eb5082aa2b')
  })

  it('对 abc 返回标准 SM3 摘要', () => {
    // SM3("abc") = 66c7f0f462eeedd9d1f2d46bdc10e4e24167c4875cf2f7a2297da02b8f4ba8e0
    expect(sm3Hash('abc')).toBe('66c7f0f462eeedd9d1f2d46bdc10e4e24167c4875cf2f7a2297da02b8f4ba8e0')
  })

  it('相同输入结果一致(确定性)', () => {
    expect(sm3Hash('admin123')).toBe(sm3Hash('admin123'))
  })

  it('输出是 64 位十六进制', () => {
    expect(sm3Hash('test')).toMatch(/^[0-9a-f]{64}$/)
  })
})
