<template>
  <view class="knowledge-graph-wrap">
    <view
      class="graph-container"
      :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
      @wheel="onWheel"
    >
      <view
        class="graph-inner"
        :style="innerStyle"
      >
        <canvas
          canvas-id="knowledgeGraphCanvas"
          class="graph-canvas"
          :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
          @ready="onCanvasReady"
        ></canvas>
      </view>
    </view>
    <view class="graph-tips">
      <text>可拖拽平移，双指/滚轮缩放</text>
    </view>
    <view class="graph-legend">
      <view class="legend-item">
        <view class="legend-dot high"></view>
        <text>掌握良好(&ge;80)</text>
      </view>
      <view class="legend-item">
        <view class="legend-dot mid"></view>
        <text>基本掌握(60-79)</text>
      </view>
      <view class="legend-item">
        <view class="legend-dot low"></view>
        <text>待加强(&lt;60)</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, nextTick, computed, watch, onMounted } from 'vue'
import type { GraphNodeVO } from '../types/student'

type GraphNode = GraphNodeVO

interface KnowledgeRelation {
  sourceId: number
  targetId: number
  relationType: number
}

const props = withDefaults(defineProps<{
  preNodes?: GraphNode[]
  coreNode?: GraphNode
  nextNodes?: GraphNode[]
  allNodes?: GraphNode[]
  relations?: KnowledgeRelation[]
  width?: number
  height?: number
}>(), {
  preNodes: () => [],
  coreNode: (): GraphNode => ({ id: 0, name: '核心', mastery: 75 }),
  nextNodes: () => [],
  allNodes: () => [],
  relations: () => [],
  width: 700,
  height: 400,
})

const CANVAS_ID = 'knowledgeGraphCanvas'
const canvasWidth = computed(() => props.width)
const canvasHeight = computed(() => props.height)
const NODE_RADIUS = 18
const FONT_SIZE = 11

const offsetX = ref(0)
const offsetY = ref(0)
const scale = ref(1)
const MIN_SCALE = 0.5
const MAX_SCALE = 2

const isDragging = ref(false)
const lastX = ref(0)
const lastY = ref(0)
const lastTouchDistance = ref(0)

const innerStyle = computed(() => ({
  transform: `translate(${offsetX.value}px, ${offsetY.value}px) scale(${scale.value})`,
  transformOrigin: 'center center',
}))

function getMasteryColor(mastery: number): string {
  if (mastery >= 80) return '#07c160'
  if (mastery >= 60) return '#e6a23c'
  return '#f56c6c'
}

function getMasteryFill(mastery: number): string {
  if (mastery >= 80) return 'rgba(7,193,96,0.15)'
  if (mastery >= 60) return 'rgba(230,162,60,0.15)'
  return 'rgba(245,108,108,0.15)'
}

function layoutNodes(nodes: GraphNode[]): Map<number, { x: number; y: number }> {
  const layout = new Map<number, { x: number; y: number }>()
  const count = nodes.length
  
  if (count <= 3) {
    const colX = [120, canvasWidth.value / 2, canvasWidth.value - 120]
    nodes.forEach((node, i) => {
      layout.set(node.id, { x: colX[i], y: canvasHeight.value / 2 })
    })
  } else {
    const rows = Math.ceil(Math.sqrt(count))
    const cols = Math.ceil(count / rows)
    const spacingX = (canvasWidth.value - 160) / (cols - 1)
    const spacingY = (canvasHeight.value - 120) / (rows - 1)
    
    nodes.forEach((node, i) => {
      const row = Math.floor(i / cols)
      const col = i % cols
      const x = 80 + col * spacingX
      const y = 60 + row * spacingY
      layout.set(node.id, { x, y })
    })
  }
  
  return layout
}

function draw(ctx: UniApp.CanvasContext): void {
  const w = canvasWidth.value
  const h = canvasHeight.value
  ctx.clearRect(0, 0, w, h)

  const nodes = props.allNodes.length > 0 ? props.allNodes : [props.coreNode, ...props.preNodes, ...props.nextNodes]
  
  if (nodes.length === 0) {
    ctx.draw()
    return
  }

  const nodeLayout = layoutNodes(nodes)
  const relations = props.relations || []

  ctx.setLineWidth(1.5)
  relations.forEach((rel) => {
    const src = nodeLayout.get(rel.sourceId)
    const dst = nodeLayout.get(rel.targetId)
    if (src && dst) {
      ctx.beginPath()
      ctx.moveTo(src.x, src.y)
      ctx.lineTo(dst.x, dst.y)
      ctx.setStrokeStyle('#909399')
      ctx.setGlobalAlpha(0.5)
      ctx.stroke()
      ctx.setGlobalAlpha(1)
    }
  })

  nodes.forEach((node) => {
    const pos = nodeLayout.get(node.id)
    if (!pos) return
    
    const color = getMasteryColor(node.mastery)
    const fill = getMasteryFill(node.mastery)
    const r = NODE_RADIUS

    ctx.beginPath()
    ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2)
    ctx.setFillStyle(fill)
    ctx.fill()
    ctx.setStrokeStyle(color)
    ctx.setLineWidth(2)
    ctx.stroke()

    ctx.setFillStyle('#333')
    ctx.setFontSize(FONT_SIZE)
    ctx.setTextAlign('center')
    ctx.fillText(node.name, pos.x, pos.y + r + FONT_SIZE + 4)

    ctx.setFillStyle(color)
    ctx.setFontSize(10)
    ctx.setTextAlign('center')
    ctx.fillText(node.mastery + '%', pos.x, pos.y + 3.5)
  })

  ctx.draw()
}

function redraw(): void {
  const ctx = uni.createCanvasContext(CANVAS_ID)
  draw(ctx)
}

function onCanvasReady(): void {
  nextTick(() => {
    redraw()
  })
}

function onTouchStart(e: TouchEvent): void {
  if (e.touches.length === 1) {
    isDragging.value = true
    lastX.value = e.touches[0].clientX
    lastY.value = e.touches[0].clientY
  } else if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX
    const dy = e.touches[0].clientY - e.touches[1].clientY
    lastTouchDistance.value = Math.sqrt(dx * dx + dy * dy)
  }
}

function onTouchMove(e: TouchEvent): void {
  if (e.touches.length === 1 && isDragging.value) {
    const dx = e.touches[0].clientX - lastX.value
    const dy = e.touches[0].clientY - lastY.value
    offsetX.value += dx
    offsetY.value += dy
    lastX.value = e.touches[0].clientX
    lastY.value = e.touches[0].clientY
  } else if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX
    const dy = e.touches[0].clientY - e.touches[1].clientY
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (lastTouchDistance.value > 0) {
      const delta = distance / lastTouchDistance.value
      scale.value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale.value * delta))
    }
    lastTouchDistance.value = distance
  }
}

function onTouchEnd(): void {
  isDragging.value = false
  lastTouchDistance.value = 0
}

function onMouseDown(e: MouseEvent): void {
  isDragging.value = true
  lastX.value = e.clientX
  lastY.value = e.clientY
}

function onMouseMove(e: MouseEvent): void {
  if (!isDragging.value) return
  const dx = e.clientX - lastX.value
  const dy = e.clientY - lastY.value
  offsetX.value += dx
  offsetY.value += dy
  lastX.value = e.clientX
  lastY.value = e.clientY
}

function onMouseUp(): void {
  isDragging.value = false
}

function onWheel(e: WheelEvent): void {
  e.preventDefault()
  const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
  scale.value = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale.value * zoomFactor))
}

watch(
  () => [props.allNodes, props.relations, props.preNodes, props.coreNode, props.nextNodes],
  () => {
    offsetX.value = 0
    offsetY.value = 0
    scale.value = 1
    nextTick(() => {
      redraw()
    })
  },
  { deep: true }
)

onMounted(() => {
  nextTick(() => {
    redraw()
  })
})
</script>

<style scoped lang="scss">
.knowledge-graph-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.graph-container {
  position: relative;
  overflow: hidden;
  cursor: grab;
  touch-action: none;
}
.graph-container:active {
  cursor: grabbing;
}
.graph-inner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-origin: center center;
  transition: transform 0.1s ease-out;
}
.graph-canvas {
  display: block;
}
.graph-tips {
  margin-top: 8rpx;
  text {
    font-size: 20rpx;
    color: $text-3;
  }
}
.graph-legend {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 24rpx;
  margin-top: 16rpx;
  flex-wrap: wrap;
}
.legend-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8rpx;
}
.legend-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
}
.legend-dot.high { background: #07c160; }
.legend-dot.mid { background: #e6a23c; }
.legend-dot.low { background: #f56c6c; }
.legend-item text {
  font-size: 22rpx;
  color: $text-3;
}
</style>
