<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { useUserStore } from './stores/user'

const userStore = useUserStore()

onLaunch(() => {
  // 若本地有 token,尝试恢复用户信息(失败由 request 层 401 处理)
  if (userStore.isLoggedIn) {
    userStore.fetchUserInfo().catch((e) => {
      console.warn('[App] 恢复用户信息失败:', e?.message || e)
    })
  }
})
</script>

<style lang="scss">
/* 全局引入 iconfont 字体包 */
@import './static/font/iconfont.css';

page {
  background-color: #f5f7fa;
  color: #222;
  font-family: -apple-system, 'PingFang SC', 'Helvetica Neue', Helvetica, sans-serif;
}
</style>
