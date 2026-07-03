import { beforeEach, describe, expect, it, vi } from 'vitest'

const storage = new Map<string, string>()
const requestMock = vi.fn()

vi.stubGlobal('uni', {
  getStorageSync: vi.fn((key: string) => storage.get(key) || ''),
  setStorageSync: vi.fn((key: string, value: string) => storage.set(key, value)),
  removeStorageSync: vi.fn((key: string) => storage.delete(key)),
  request: requestMock,
  showToast: vi.fn(),
})

describe('student growth api', () => {
  beforeEach(() => {
    storage.clear()
    storage.set('student_access_token', 'token')
    requestMock.mockReset()
    requestMock.mockImplementation((options: any) => {
      options.success({
        statusCode: 200,
        data: {
          code: 200,
          data: { taskId: 12, completed: true },
          message: 'success',
        },
      })
    })
  })

  it('updates weekly task status through backend endpoint', async () => {
    const { updateWeeklyTaskStatus } = await import('../src/api/student')

    const result = await updateWeeklyTaskStatus(12, true)

    expect(result).toEqual({ taskId: 12, completed: true })
    expect(requestMock).toHaveBeenCalledTimes(1)
    expect(requestMock.mock.calls[0][0]).toMatchObject({
      method: 'PUT',
      data: { completed: true },
    })
    expect(requestMock.mock.calls[0][0].url).toContain('/student/growth/task/12/status')
  })

  it('regenerates week plan through backend endpoint', async () => {
    requestMock.mockImplementationOnce((options: any) => {
      options.success({
        statusCode: 200,
        data: {
          code: 200,
          data: { planId: 99, weekName: '07/01-07/07' },
          message: 'success',
        },
      })
    })
    const { regenerateWeekPlan } = await import('../src/api/student')

    const result = await regenerateWeekPlan(0)

    expect(result).toMatchObject({ planId: 99, weekName: '07/01-07/07' })
    expect(requestMock).toHaveBeenCalledTimes(1)
    expect(requestMock.mock.calls[0][0].method).toBe('POST')
    expect(requestMock.mock.calls[0][0].url).toContain('/student/growth/week-plan/regenerate')
    expect(requestMock.mock.calls[0][0].data).toEqual({ weekIndex: 0 })
  })
})
