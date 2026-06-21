import { describe, it, expect, beforeEach } from 'vitest'
import { createRefreshQueue } from '../src/api/request'

describe('RefreshQueue', () => {
  let queue: ReturnType<typeof createRefreshQueue>
  beforeEach(() => { queue = createRefreshQueue() })

  it('初始非刷新中,无待重放', () => {
    expect(queue.isRefreshing()).toBe(false)
    expect(queue.pendingCount()).toBe(0)
  })

  it('标记刷新中后,后续请求进入待重放队列', () => {
    queue.startRefreshing()
    queue.enqueueRetry(() => {})
    queue.enqueueRetry(() => {})
    expect(queue.isRefreshing()).toBe(true)
    expect(queue.pendingCount()).toBe(2)
  })

  it('刷新成功后重放所有待重放请求并清空', async () => {
    queue.startRefreshing()
    let retried = 0
    queue.enqueueRetry(() => { retried++ })
    queue.enqueueRetry(() => { retried++ })
    await queue.flushRetries(true)
    expect(retried).toBe(2)
    expect(queue.pendingCount()).toBe(0)
    expect(queue.isRefreshing()).toBe(false)
  })

  it('刷新失败时不重放,清空队列', async () => {
    queue.startRefreshing()
    let retried = 0
    queue.enqueueRetry(() => { retried++ })
    await queue.flushRetries(false)
    expect(retried).toBe(0)
    expect(queue.pendingCount()).toBe(0)
    expect(queue.isRefreshing()).toBe(false)
  })
})
