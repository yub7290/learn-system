<template>
  <view class="ring-wrap" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" :stop-color="color" />
          <stop offset="100%" :stop-color="lightColor" />
        </linearGradient>
      </defs>
      <circle
        cx="60"
        cy="60"
        :r="radius"
        fill="none"
        :stroke="trackColor"
        :stroke-width="strokeWidth"
      />
      <circle
        cx="60"
        cy="60"
        :r="radius"
        fill="none"
        :stroke="`url(#ringGrad)`"
        :stroke-width="strokeWidth"
        :stroke-linecap="rounded ? 'round' : 'butt'"
        :stroke-dasharray="dashArray"
        :stroke-dashoffset="dashOffset"
        transform="rotate(-90 60 60)"
      />
    </svg>
    <view class="ring-text" :style="{ width: size + 'px', height: size + 'px' }">
      <text v-if="label" class="ring-label" :style="{ fontSize: labelSize + 'px' }">{{ label }}</text>
      <text class="ring-value" :style="{ fontSize: valueSize + 'px' }">{{ displayValue }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  percent?: number
  size?: number
  strokeWidth?: number
  color?: string
  lightColor?: string
  trackColor?: string
  rounded?: boolean
  label?: string
  value?: string
  labelSize?: number
  valueSize?: number
}>(), {
  percent: 0,
  size: 120,
  strokeWidth: 10,
  color: '#0195ff',
  lightColor: '#00c6ff',
  trackColor: '#e6f4ff',
  rounded: true,
  labelSize: 12,
  valueSize: 24,
})

const radius = 60 - props.strokeWidth / 2
const circumference = 2 * Math.PI * radius
const dashArray = `${circumference} ${circumference}`
const dashOffset = computed(() => circumference - (Math.min(100, Math.max(0, props.percent)) / 100) * circumference)
const displayValue = computed(() => props.value ?? `${Math.round(props.percent)}`)
</script>

<style scoped lang="scss">
.ring-wrap {
  position: relative;
  display: inline-block;
}
.ring-text {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.ring-label {
  color: $text-3;
  margin-bottom: 2px;
}
.ring-value {
  color: $text-1;
  font-weight: 700;
}
</style>
