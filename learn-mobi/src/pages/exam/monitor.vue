<template>
  <view class="monitor-wrap">
    <!-- 摄像头预览区 -->
    <view class="video-container">
      <video
        ref="videoRef"
        class="video-preview"
        autoplay
        muted
        playsinline
        :style="{ display: isRunning ? 'block' : 'none' }"
      ></video>
      <canvas
        ref="canvasRef"
        class="overlay-canvas"
        :style="{ display: isRunning ? 'block' : 'none' }"
      ></canvas>
      <view v-if="!isRunning" class="camera-placeholder">
        <u-icon name="camera" size="64" color="#555"></u-icon>
        <text class="placeholder-text">点击下方按钮启动监考</text>
        <text class="hint-text">H5 可用，App 端需要原生相机组件适配</text>
      </view>
    </view>

    <!-- 状态栏 -->
    <view class="status-bar">
      <view class="status-left">
        <view class="status-dot" :class="{ active: isRunning }"></view>
        <text class="status-text">{{ isRunning ? '监考运行中' : '监控未启动' }}</text>
      </view>
      <text v-if="isRunning" class="duration-text">{{ durationText }}</text>
    </view>

    <!-- 行为日志 -->
    <scroll-view scroll-y class="log-scroll" ref="logScrollRef">
      <view class="log-list">
        <view v-for="(log, i) in logs" :key="i" class="log-item">
          <text class="log-time">{{ log.time }}</text>
          <text class="log-tag" :class="log.type">{{ log.typeLabel }}</text>
          <text class="log-desc">{{ log.desc }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 按钮区域 -->
    <view class="btn-bar">
      <view v-if="!isRunning" class="btn btn-start" @click="startMonitor">开始监考</view>
      <view v-if="isRunning" class="btn btn-stop" @click="stopMonitor">结束监考</view>
      <view class="btn btn-exit" @click="goBack">退出</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { reportMonitorBehavior } from '../../api/exam'

/**
 * 在线监考页面（H5 简化版）
 *
 * 功能：
 * - 使用 navigator.mediaDevices.getUserMedia 获取摄像头（仅 H5）
 * - 显示摄像头预览画面
 * - 使用 Canvas 绘制模拟人脸检测框/提示（无 face-api.js）
 * - 记录并上报监考行为到后端 API
 *
 * 注意：此功能 H5 可用，App 端需要原生相机组件适配
 */

/* ====================== 类型 ====================== */
interface LogItem {
  time: string
  type: 'info' | 'warn' | 'normal'
  typeLabel: string
  desc: string
}

/* ====================== 状态 ====================== */
const examId = ref(0)
const isRunning = ref(false)
const isH5 = ref(false)
const logs = ref<LogItem[]>([])

/* 媒体 & Canvas */
const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const logScrollRef = ref<any>(null)

let mediaStream: MediaStream | null = null
let drawTimer: ReturnType<typeof setInterval> | null = null
let startTime: number | null = null
let durationSec = 0
let durationTimer: ReturnType<typeof setInterval> | null = null
const durationText = ref('00:00')

/* ====================== 生命周期 ====================== */
onLoad((q: any) => {
  examId.value = Number(q.examId) || Number(q.id) || 0
})

onMounted(() => {
  isH5.value = typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'mediaDevices' in navigator
  addLog('info', '系统就绪', '监考页面已加载')
})

onUnmounted(() => {
  cleanupMedia()
})

/* ====================== 日志 ====================== */
function addLog(type: LogItem['type'], typeLabel: string, desc: string) {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  logs.value.push({ time, type, typeLabel, desc })
  // 自动滚动到底部
  nextTick(() => {
    if (logScrollRef.value) {
      try { logScrollRef.value.scrollTo({ top: 99999, animated: false }) } catch {}
    }
  })
}

function getCurrentTimeStr(): string {
  return new Date().toLocaleString()
}

/* ====================== 启动/停止 监考 ====================== */
async function startMonitor() {
  if (!isH5.value) {
    uni.showToast({ title: '请在 H5 浏览器中打开', icon: 'none' })
    return
  }
  if (isRunning.value) return

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    })
    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream
    }
    isRunning.value = true
    startTime = Date.now()
    durationSec = 0

    // 等待视频元数据加载后初始化 Canvas
    if (videoRef.value) {
      videoRef.value.onloadedmetadata = () => {
        initCanvas()
        startDrawing()
      }
    }

    // 计时器
    durationTimer = setInterval(() => {
      durationSec++
      const m = Math.floor(durationSec / 60)
      const s = durationSec % 60
      durationText.value = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }, 1000)

    addLog('info', '监考启动', '摄像头已开启，开始监控')

    // 上报启动事件
    reportBehavior(5, '监考已启动，摄像头开启')

    uni.showToast({ title: '监考已启动', icon: 'success' })
  } catch (err: any) {
    const msg = err?.message || String(err)
    addLog('warn', '启动失败', msg)
    uni.showToast({ title: '摄像头启动失败：' + msg, icon: 'none' })
  }
}

function stopMonitor() {
  if (!isRunning.value) return

  cleanupMedia()

  addLog('info', '监考结束', '监控已停止')
  reportBehavior(5, '监考已结束')

  uni.showToast({ title: '监考已结束', icon: 'success' })
}

function cleanupMedia() {
  isRunning.value = false

  // 停止媒体流
  if (mediaStream) {
    mediaStream.getTracks().forEach((t) => t.stop())
    mediaStream = null
  }

  // 清除定时器
  if (drawTimer) {
    clearInterval(drawTimer)
    drawTimer = null
  }
  if (durationTimer) {
    clearInterval(durationTimer)
    durationTimer = null
  }

  // 清空 Canvas
  if (canvasRef.value) {
    const ctx = canvasRef.value.getContext('2d')
    if (ctx) ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  }
}

/* ====================== Canvas 绘制 ====================== */
function initCanvas() {
  if (!canvasRef.value || !videoRef.value) return
  const video = videoRef.value
  const canvas = canvasRef.value

  // 匹配 Canvas 尺寸到视频实际渲染尺寸
  const rect = video.getBoundingClientRect?.() || { width: 375, height: 300 }
  canvas.width = rect.width || 375
  canvas.height = rect.height || 300
}

function startDrawing() {
  if (!canvasRef.value) return

  const canvas = canvasRef.value

  // 每 200ms 刷新 Canvas，模拟实时检测
  drawTimer = setInterval(() => {
    if (!isRunning.value || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    drawFaceDetectionFrame(ctx, canvas.width, canvas.height)
  }, 200)
}

/**
 * 模拟人脸检测框绘制
 *
 * 不使用 face-api.js，通过 Canvas 绘制模拟的人脸检测视觉反馈：
 * - 人脸边界框（绿色矩形，带边角标记）
 * - 眼部标记点
 * - 鼻部标记点
 * - 嘴部标记线
 * - "人脸检测中" 文字提示
 */
function drawFaceDetectionFrame(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.clearRect(0, 0, w, h)

  // 动态呼吸效果：边界框轻微缩放
  const breathe = Math.sin(Date.now() / 800) * 3

  // 人脸边界框 - 居中，比例约 3:4
  const boxW = w * 0.32 + breathe
  const boxH = h * 0.48 + breathe * 1.2
  const x = (w - boxW) / 2
  const y = (h - boxH) / 2 - 10

  // —— 主框 ——
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.8)'
  ctx.lineWidth = 2
  ctx.strokeRect(x, y, boxW, boxH)

  // —— 边角标记（科技感 4 角） ——
  const corner = 18
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.9)'
  ctx.lineWidth = 3

  // 左上角
  ctx.beginPath()
  ctx.moveTo(x, y + corner)
  ctx.lineTo(x, y)
  ctx.lineTo(x + corner, y)
  ctx.stroke()

  // 右上角
  ctx.beginPath()
  ctx.moveTo(x + boxW - corner, y)
  ctx.lineTo(x + boxW, y)
  ctx.lineTo(x + boxW, y + corner)
  ctx.stroke()

  // 左下角
  ctx.beginPath()
  ctx.moveTo(x, y + boxH - corner)
  ctx.lineTo(x, y + boxH)
  ctx.lineTo(x + corner, y + boxH)
  ctx.stroke()

  // 右下角
  ctx.beginPath()
  ctx.moveTo(x + boxW - corner, y + boxH)
  ctx.lineTo(x + boxW, y + boxH)
  ctx.lineTo(x + boxW, y + boxH - corner)
  ctx.stroke()

  // —— 眼部标记 ——
  ctx.fillStyle = 'rgba(0, 255, 136, 0.9)'
  const eyeY = y + boxH * 0.32
  // 左眼
  ctx.beginPath()
  ctx.arc(x + boxW * 0.30, eyeY, 4, 0, Math.PI * 2)
  ctx.fill()
  // 右眼
  ctx.beginPath()
  ctx.arc(x + boxW * 0.70, eyeY, 4, 0, Math.PI * 2)
  ctx.fill()

  // —— 鼻部标记 ——
  ctx.beginPath()
  ctx.arc(x + boxW * 0.50, y + boxH * 0.50, 3, 0, Math.PI * 2)
  ctx.fill()

  // —— 嘴部直线 ——
  ctx.strokeStyle = 'rgba(0, 255, 136, 0.8)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x + boxW * 0.25, y + boxH * 0.72)
  ctx.lineTo(x + boxW * 0.75, y + boxH * 0.72)
  ctx.stroke()

  // —— 文字标签 ——
  ctx.fillStyle = 'rgba(0, 255, 136, 0.7)'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('人脸检测中', w / 2, y - 14)

  // —— 左上角 LIVE 指示 ——
  ctx.fillStyle = 'rgba(0, 255, 136, 0.5)'
  ctx.font = '10px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('LIVE', 8, 16)
}

/* ====================== API 上报 ====================== */
function reportBehavior(behaviorType: number, description: string) {
  if (!examId.value) return
  reportMonitorBehavior({
    examId: examId.value,
    behaviorType,
    description,
    happenTime: getCurrentTimeStr(),
  }).catch(() => {
    // 上报失败不影响本地体验
  })
}

/* ====================== 退出 ====================== */
function goBack() {
  if (isRunning.value) {
    uni.showModal({
      title: '提示',
      content: '监考正在运行中，确定退出吗？',
      success: (res) => {
        if (res.confirm) {
          cleanupMedia()
          uni.navigateBack()
        }
      },
    })
  } else {
    uni.navigateBack()
  }
}
</script>

<style scoped lang="scss">
.monitor-wrap {
  width: 100vw;
  height: 100vh;
  background: #000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #fff;
}

/* ===== 摄像头预览区 ===== */
.video-container {
  flex: 1;
  position: relative;
  background: #111;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.video-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.camera-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;

  .placeholder-text {
    font-size: 15px;
    color: #888;
  }

  .hint-text {
    font-size: 11px;
    color: #555;
  }
}

/* ===== 状态栏 ===== */
.status-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #1a1a1a;
  border-bottom: 1px solid #333;
}

.status-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #555;
  transition: background 0.2s;

  &.active {
    background: #10b981;
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
  }
}

.status-text {
  font-size: 13px;
  color: #ccc;
}

.duration-text {
  font-size: 13px;
  color: #10b981;
  font-family: monospace;
  letter-spacing: 1px;
}

/* ===== 行为日志 ===== */
.log-scroll {
  flex-shrink: 1;
  max-height: 160px;
  background: #111;
  overflow-y: auto;
}

.log-list {
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.log-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  line-height: 1.6;
}

.log-time {
  color: #555;
  flex-shrink: 0;
  min-width: 58px;
}

.log-tag {
  flex-shrink: 0;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 500;
  min-width: 38px;
  text-align: center;

  &.info {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
  }

  &.warn {
    background: rgba(245, 158, 11, 0.2);
    color: #f59e0b;
  }

  &.normal {
    background: rgba(255, 255, 255, 0.08);
    color: #999;
  }
}

.log-desc {
  color: #aaa;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ===== 按钮区域 ===== */
.btn-bar {
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  gap: 12px;
  padding: 12px 16px;
  padding-bottom: calc(12px + constant(safe-area-inset-bottom));
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: #1a1a1a;
}

.btn {
  flex: 1;
  height: 44px;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
  transition: opacity 0.15s;

  &:active {
    opacity: 0.8;
  }
}

.btn-start {
  background: #2563eb;
  color: #fff;
}

.btn-stop {
  background: #f59e0b;
  color: #fff;
}

.btn-exit {
  background: #ef4444;
  color: #fff;
}
</style>
