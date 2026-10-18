# 视频等待恢复与耗时记录

## 实现范围

- H5 播放器区分暂停预加载、播放缓冲、拖动等待和真实媒体失败。
- 暂停且已有元数据时不因 `stalled` 报播放超时；实际等待仍保留 30 秒看门狗。
- 重复 `waiting/stalled` 不延长当前等待期限；到期前重新读取媒体状态。
- 超时是可恢复提示，后续就绪/播放自动清除；真实资源错误保留重新加载入口。
- 提示层不拦截原生播放/进度控件；操作按钮最小高度 44px。
- 缓冲/拖动期间暂停学习计时；切源、卸载、进入后台时清理相关监控。
- hls.js 通过 `startPosition` 从续播目标加载；原生播放在元数据到达后只定位一次。
- 重试保留选中视频及最近播放位置，包括回到 0 秒、媒体错误导致元数据丢失的情况。
- 本次未调整转码模板、分片、CDN、接口权限、学习记录持久化或生产配置。

## 耗时定义与读取

- `first-frame`：从本次资源首次 `play` 事件到首个提交给合成器的视频帧，不含页面预加载和点击前停留。
- `seek`：从最近一次 `seeking` 到目标画面恢复；连续拖动仅保留最新目标。
- `basis=video-frame` 使用 `requestVideoFrameCallback`；不支持时以 `playing/timeupdate` 估算，并明确标记。
- 暂停拖动以 `seeked` 表示目标已就绪，不能与播放状态下实际出帧的样本混为同一口径。
- `reason=resume` 是初始续播定位，`reason=user` 是用户拖动。
- `outcome=timeout`、`basis=watchdog` 记录超时；恢复后可产生对应的 `outcome=ready` 样本。
- 切后台或首次出帧前暂停会放弃该未完成测量，避免把离开时间计入播放耗时。
- 页面控制台筛选 `[video-playback]`；H5 同时在当前标签页 `sessionStorage` 保存最近 50 条。
- 键名：`learn-video-playback-metrics`；记录毫秒、时间、课程/章节、视频序号和播放引擎，不记录地址、凭据或账号。
- 这是本地会话诊断，不会新增后台上报；关闭浏览器会话后不保证保留。

在学习页开发者工具中读取：

```js
JSON.parse(sessionStorage.getItem('learn-video-playback-metrics') || '[]')
```

## 验证与边界

- `learn-mobi` 下运行 `npm test`：42 项通过，包含状态时序和真实 Vue 组件接线测试。
- 独立播放器脚本及其导入的状态模块已通过严格 TypeScript 检查。
- H5 构建使用 `node node_modules/@dcloudio/vite-plugin-uni/bin/uni.js build -p h5 --outDir <独立输出目录>`。
- 直接调用构建器，避免触发现有 `postbuild:h5` 对 `dist.zip` 的覆盖。
- 浏览器组件验证页使用相同真实 HLS，不调用学习记录接口；不能代替完整学习页、安卓真机和弱网验收。
- 本地桌面原生播放路径：暂停超过 53 秒仍就绪；预加载后首帧 102ms、一次用户拖动出帧 115ms；重试保留 171.317 秒位置。这些不是安卓弱网或冷启动性能承诺。
- 真机验收：暂停超过 30 秒后播放；首播；暂停/播放中拖动；连续拖动；断网后恢复；重试与快速切章；切后台再返回。

## 是否调整分片或 CDN

先用相同手机、浏览器、视频和网络收集修复后的首帧、拖动及超时样本，并结合 Network 中清单/分片耗时。
若文件下载较快而出帧慢，继续定位播放器或解码；不要据此直接修改 CDN。
若同地区冷缓存明显慢、热缓存稳定快，再评估热门资源预热及缓存命中策略。
若弱网分片下载持续长于该分片播放时长，再选单个样本比较较短分片或较低码率。
当前维持三档码率和 6 秒分片；真实安卓修复后数据尚未验证前，不做批量转码或全局 CDN 调整。

## 文件与回滚

- 业务：`learn-mobi/src/components/HlsVideo.vue`、`learn-mobi/src/pages/course/study.vue`。
- 新模块：`learn-mobi/src/utils/videoPlayback.ts`。
- 测试：`learn-mobi/tests/video-playback.test.ts`、`learn-mobi/tests/hls-video.test.ts`、`learn-mobi/vitest.config.ts`。
- 原业务文件工作副本保存在 `C:/Users/12738/.codex/visualizations/2026/10/18/01a14dfe-eefc-73f1-b973-eadbb93218f0/video-fix-backup/`。
- 回滚时从该备份恢复两个业务文件和测试配置，移除本次新模块/测试及本文档；保留原有其他未提交改动。
- 不需要数据库、七牛资源或 CDN 配置回滚；本地修复尚未发布到线上。
