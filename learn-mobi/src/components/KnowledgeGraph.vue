<template>
  <view class="knowledge-graph-wrap">
    <canvas
      canvas-id="knowledgeGraphCanvas"
      class="graph-canvas"
      :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
      @ready="onCanvasReady"
    ></canvas>
    <!-- 图例 -->
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
import { onMounted, nextTick, computed, watch } from 'vue'
import type { GraphNodeVO } from '../types/student'

// 使用与类型定义文件一致的节点类型
type GraphNode = GraphNodeVO

const props = withDefaults(defineProps<{
  preNodes?: GraphNode[]
  coreNode?: GraphNode
  nextNodes?: GraphNode[]
  width?: number
  height?: number
}>(), {
  preNodes: () => [],
  coreNode: (): GraphNode => ({ id: 0, name: '核心', mastery: 75 }),
  nextNodes: () => [],
  width: 700,
  height: 400,
})

const CANVAS_ID = 'knowledgeGraphCanvas'
const canvasWidth = computed(() => props.width)
const canvasHeight = computed(() => props.height)
const NODE_RADIUS = 18
const FONT_SIZE = 11

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

function draw(ctx: UniApp.CanvasContext): void {
  const w = canvasWidth.value
  const h = canvasHeight.value
  ctx.clearRect(0, 0, w, h)

  const colX = [80, w / 2, w - 80]
  const allNodes: { id: number; name: string; mastery: number; x: number; y: number }[] = []

  const preList = props.preNodes
  const preCount = preList.length
  const preStartY = h / 2 - ((preCount - 1) * 80) / 2
  preList.forEach((node, i) => {
    allNodes.push({ ...node, x: colX[0], y: preStartY + i * 80 })
  })

  const core = props.coreNode
  allNodes.push({ ...core, x: colX[1], y: h / 2 })

  const nextList = props.nextNodes
  const nextCount = nextList.length
  const nextStartY = h / 2 - ((nextCount - 1) * 80) / 2
  nextList.forEach((node, i) => {
    allNodes.push({ ...node, x: colX[2], y: nextStartY + i * 80 })
  })

  // 连线
  ctx.setLineWidth(1.5)
  preList.forEach((node) => {
    const src = allNodes.find((n) => n.id === node.id)
    const dst = allNodes.find((n) => n.id === core.id)
    if (src && dst) {
      ctx.beginPath()
      ctx.moveTo(src.x + NODE_RADIUS, src.y)
      ctx.lineTo(dst.x - NODE_RADIUS, dst.y)
      ctx.setStrokeStyle(getMasteryColor(node.mastery))
      ctx.setGlobalAlpha(0.5)
      ctx.stroke()
      ctx.setGlobalAlpha(1)
    }
  })
  nextList.forEach((node) => {
    const src = allNodes.find((n) => n.id === core.id)
    const dst = allNodes.find((n) => n.id === node.id)
    if (src && dst) {
      ctx.beginPath()
      ctx.moveTo(src.x + NODE_RADIUS, src.y)
      ctx.lineTo(dst.x - NODE_RADIUS, dst.y)
      ctx.setStrokeStyle(getMasteryColor(node.mastery))
      ctx.setGlobalAlpha(0.5)
      ctx.stroke()
      ctx.setGlobalAlpha(1)
    }
  })

  // 节点
  allNodes.forEach((node) => {
    const color = getMasteryColor(node.mastery)
    const fill = getMasteryFill(node.mastery)

    ctx.beginPath()
    ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2)
    ctx.setFillStyle(fill)
    ctx.fill()
    ctx.setStrokeStyle(color)
    ctx.setLineWidth(2)
    ctx.stroke()

    ctx.setFillStyle('#333')
    ctx.setFontSize(FONT_SIZE)
    ctx.setTextAlign('center')
    ctx.fillText(node.name, node.x, node.y + NODE_RADIUS + FONT_SIZE + 4)

    ctx.setFillStyle(color)
    ctx.setFontSize(10)
    ctx.setTextAlign('center')
    ctx.fillText(node.mastery + '%', node.x, node.y + 3.5)
  })

  ctx.draw()
}

function onCanvasReady(): void {
  nextTick(() => {
    const ctx = uni.createCanvasContext(CANVAS_ID)
    draw(ctx)
  })
}

watch(
  () => [props.preNodes, props.coreNode, props.nextNodes],
  () => {
    const ctx = uni.createCanvasContext(CANVAS_ID)
    draw(ctx)
  },
  { deep: true }
)

onMounted(() => {
  nextTick(() => {
    const ctx = uni.createCanvasContext(CANVAS_ID)
    draw(ctx)
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
.graph-canvas {
  display: block;
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
