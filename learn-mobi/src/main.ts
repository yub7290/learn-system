import { createSSRApp } from 'vue'
import * as Pinia from 'pinia'
import App from './App.vue'
import uviewPlus from 'uview-plus'

// H5模式polyfill：uni.chooseImage内部调用getFileSystemManager，浏览器无此API
// ponytail: 统一polyfill入口，chat.vue已移除重复polyfill
// @ts-ignore
if (typeof uni !== 'undefined' && typeof window !== 'undefined' && !uni.getFileSystemManager) {
  // @ts-ignore
  uni.getFileSystemManager = () => ({
    getFileInfo: (_: any, cb: any) => cb && cb({ errMsg: 'ok' }),
    readFile: (_: any, cb: any) => cb && cb({ errMsg: 'ok', data: '' }),
    stat: (_: any, cb: any) => cb && cb({ errMsg: 'ok', stats: {} }),
  })
}

export function createApp() {
  const app = createSSRApp(App)
  const pinia = Pinia.createPinia()
  app.use(pinia)
  app.use(uviewPlus)
  return { app, pinia }
}
