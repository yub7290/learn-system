import { describe, expect, it, vi } from 'vitest'
import { htmlToText } from '../src/utils/text'
import { courseTabs } from '../src/utils/course-tabs'
import { examDetailUrl } from '../src/utils/exam-route'

describe('home repair behavior', () => {
  it('keeps the free API type stable after unsupported filters are removed', () => {
    const free = courseTabs.find(tab => tab.name === '免费')!
    expect(free.type).toBe(3)
    expect(courseTabs.map(tab => tab.type)).not.toContain(2)
    expect(courseTabs.map(tab => tab.type)).not.toContain(4)
    expect(courseTabs[0].type).toBe(-1)
  })

  it('routes a final exam through its course admission screen', () => {
    expect(examDetailUrl({ id: 999, courseId: 5, isFinalExam: 1 }))
      .toBe('/pages/exam/exam-detail?courseId=5&final=1')
  })

  it('keeps ordinary and legacy id-only exam links valid', () => {
    expect(examDetailUrl({ id: 2, isFinalExam: 0 })).toBe('/pages/exam/exam-detail?id=2')
    expect(examDetailUrl({ id: 999, isFinalExam: 1 })).toBe('/pages/exam/exam-detail?id=999')
  })

  it.each([
    ['<p>简介123123</p>', '简介123123'],
    ['<p>第一段</p><p>第二段<br>下一行</p>', '第一段 第二段 下一行'],
    ['<b>范围</b>&nbsp;1&lt;x&amp;y&gt;0', '范围 1<x&y>0'],
    ['<script>alert(1)</script><style>body{display:none}</style>简介', '简介'],
    ['&#x1F393; &#20013;&#25991;', '🎓 中文'],
    ['&#x110000;', '&#x110000;'],
    [null, ''],
  ])('shows rich introduction as plain text: %s', (input, output) => {
    expect(htmlToText(input)).toBe(output)
  })
})

describe('teacher data source', () => {
  it('requests the selected teacher and propagates failure instead of using demo data', async () => {
    const get = vi.fn().mockResolvedValueOnce({ info: { id: 3, name: '真实教师' }, course: [] })
      .mockRejectedValueOnce(new Error('unavailable'))
    vi.doMock('../src/api/request', () => ({ http: { get } }))
    const { getTeacherDetail } = await import('../src/api/teacher')
    expect((await getTeacherDetail(3)).info.name).toBe('真实教师')
    expect(get).toHaveBeenCalledWith('/student/home/teacher/info', { tid: 3 })
    await expect(getTeacherDetail(4)).rejects.toThrow('unavailable')
    vi.doUnmock('../src/api/request')
  })
})
