/**
 * 课程学习权限工具
 *
 * 服务端为权限权威；本工具仅用于前端体验（锁定态展示 / 无权限引导）。
 * 真正的拦截由后端 StudentChapterController 等接口的 canAccess 校验保证。
 */

/** 无学习权限业务码（对应后端 EduErrorCode.COURSE_NO_ACCESS = 200311） */
export const COURSE_NO_ACCESS_CODE = 200311

/**
 * 判断课程是否可学习。
 * 规则与服务端一致：免费课 / 已购买 / 所属组已绑定 → 可学。
 * 约定：后端始终返回布尔 accessible；undefined 仅出现在离线 mock 兜底场景，按"可学"处理以免开发态误锁。
 */
export function isCourseAccessible(accessible?: boolean): boolean {
  return accessible !== false
}

/**
 * 无学习权限时弹出引导：去购买（跳详情）或返回。
 * @param cid 课程ID（用于跳转详情引导购买）
 */
export function showNoAccessModal(cid: number): void {
  uni.showModal({
    title: '无学习权限',
    content: '你还没有购买该课程，或所在学员组未绑定本课程，暂时无法学习。',
    confirmText: '去购买',
    cancelText: '返回',
    success: (res) => {
      if (res.confirm) {
        uni.redirectTo({ url: `/pages/course/detail?cid=${cid}` }).catch(() => {})
      } else {
        uni.navigateBack().catch(() => {
          uni.reLaunch({ url: '/pages/course/course' })
        })
      }
    },
  })
}
