<template>
  <view class="radar-chart-wrap">
    <!-- canvas 层 -->
    <canvas
      canvas-id="radarCanvas"
      class="radar-canvas"
      :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
      @ready="onCanvasReady"
    ></canvas>
    <!-- 标签层：用 DOM 定位提高清晰度 -->
    <view
      class="radar-label"
      v-for="(item, index) in props.labels"
      :key="index"
      :style="getLabelStyle(index)"
    >
      <text>{{ item }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, nextTick, computed, watch } from 'vue'

const props = withDefaults(defineProps<{
  /** 五维数据 0-100 */
  data?: number[]
  /** 维度标签 */
  labels?: string[]
  /** 尺寸（px） */
  size?: number
  /** 填充色 */
  fillColor?: string
  /** 描边色 */
  strokeColor?: string
}>(), {
  data: () => [80, 70, 60, 50, 40],
  labels: () => ['专注力', '理解归纳', '逻辑解题', '纠错复盘', '自主规划'],
  size: 300,
  fillColor: 'rgba(1, 149, 255, 0.2)',
  strokeColor: '#0195ff',
})

const CANVAS_ID = 'radarCanvas'
const canvasWidth = computed(() => props.size)
const canvasHeight = computed(() => props.size)

const levels = 5
const getCenter = () => ({ x: props.size / 2, y: props.size / 2 })
const radius = computed(() => (props.size / 2) - 20)

/** 角度转坐标，五边形第一个点朝上 */
function angleToPos(index: number, r: number): { x: number; y: number } {
  const center = getCenter()
  const angle = (Math.PI * 2 * index) / props.data.length - Math.PI / 2
  return {
    x: center.x + r * Math.cos(angle),
    y: center.y + r * Math.sin(angle),
  }
}

/** DOM 标签坐标 */
function getLabelStyle(index: number): Record<string, string> {
  const center = getCenter()
  const labelR = radius.value + 24
  const pos = angleToPos(index, labelR)
  return {
    position: 'absolute',
    left: pos.x + 'px',
    top: pos.y + 'px',
    transform: 'translate(-50%, -50%)',
    fontSize: '11px',
    color: '#666',
    whiteSpace: 'nowrap',
  }
}

function draw(ctx: UniApp.CanvasContext): void {
  const center = getCenter()
  const count = props.data.length
  const r = radius.value

  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)

  // 同心网格
  for (let level = 1; level <= levels; level++) {
    const lr = (r * level) / levels
    ctx.beginPath()
    for (let i = 0; i <= count; i++) {
      const pos = angleToPos(i % count, lr)
      if (i === 0) ctx.moveTo(pos.x, pos.y)
      else ctx.lineTo(pos.x, pos.y)
    }
    ctx.closePath()
    ctx.setStrokeStyle('#e8e8e8')
    ctx.setLineWidth(1)
    ctx.stroke()
  }

  // 轴线
  for (let i = 0; i < count; i++) {
    const pos = angleToPos(i, r)
    ctx.beginPath()
    ctx.moveTo(center.x, center.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.setStrokeStyle('#e8e8e8')
    ctx.setLineWidth(1)
    ctx.stroke()
  }

  // 数据多边形
  ctx.beginPath()
  for (let i = 0; i <= count; i++) {
    const idx = i % count
    const value = Math.max(0, Math.min(100, props.data[idx]))
    const vr = (value / 100) * r
    const pos = angleToPos(idx, vr)
    if (i === 0) ctx.moveTo(pos.x, pos.y)
    else ctx.lineTo(pos.x, pos.y)
  }
  ctx.closePath()
  ctx.setFillStyle(props.fillColor)
  ctx.fill()
  ctx.setStrokeStyle(props.strokeColor)
  ctx.setLineWidth(2)
  ctx.stroke()

  // 顶点圆点
  for (let i = 0; i < count; i++) {
    const value = Math.max(0, Math.min(100, props.data[i]))
    const vr = (value / 100) * r
    const pos = angleToPos(i, vr)
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2)
    ctx.setFillStyle(props.strokeColor)
    ctx.fill()
  }

  ctx.draw()
}

function onCanvasReady(): void {
  nextTick(() => {
    const ctx = uni.createCanvasContext(CANVAS_ID)
    draw(ctx)
  })
}

watch(() => props.data, () => {
  const ctx = uni.createCanvasContext(CANVAS_ID)
  draw(ctx)
}, { deep: true })

onMounted(() => {
  nextTick(() => {
    const ctx = uni.createCanvasContext(CANVAS_ID)
    draw(ctx)
  })
})
</script>

<style scoped lang="scss">
.radar-chart-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}
.radar-canvas {
  display: block;
}
.radar-label {
  pointer-events: none;
}
</style>
