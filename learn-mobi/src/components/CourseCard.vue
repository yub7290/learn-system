<template>
  <view class="course-card" @click="$emit('click', item)">
    <view class="cover" :style="{ background: coverBg }">
      <image v-if="item.imageUrl" :src="item.imageUrl" mode="aspectFill" class="cover-img"></image>
      <view class="tag" :class="tagClass" v-if="item.feeType">{{ item.feeType }}</view>
    </view>
    <view class="name">{{ item.name }}</view>
    <view class="teacher" v-if="item.teacherName">
      <u-icon name="account" color="#9aa4b2" size="12"></u-icon>
      <text>{{ item.teacherName }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface CourseCardItem {
  id: number
  imageUrl: string
  name: string
  courseType: number
  teacherName: string
  feeType?: string
}

const props = defineProps<{ item: CourseCardItem }>()
defineEmits<{ (e: 'click', item: CourseCardItem): void }>()

const tagClass = computed(() => {
  switch (props.item.feeType) {
    case '免费': return 'tag-free'
    case '限免': return 'tag-limited'
    case '试学': return 'tag-trial'
    default: return ''
  }
})
const coverBg = computed(() => {
  if (props.item.imageUrl) return '#fff'
  return props.item.courseType === 3 ? 'linear-gradient(135deg,#ffb38a,#ff7847)' : 'linear-gradient(135deg,#7ec8ff,#0195ff)'
})
</script>

<style scoped lang="scss">
.course-card { background: $bg-card; border-radius: 12px; overflow: hidden; box-shadow: $shadow-card; }
.cover { height: 86px; position: relative; }
.cover-img { width: 100%; height: 100%; }
.tag { position: absolute; top: 6px; right: 6px; font-size: 10px; padding: 2px 8px; border-radius: 10px; background: rgba(255,255,255,.9); }
.tag-free { color: $primary; }
.tag-limited { color: #f5a623; }
.tag-trial { color: #722ed1; }
.name { font-size: 13px; color: $text-1; font-weight: 500; line-height: 1.3; padding: 8px 10px 0; }
.teacher { font-size: 11px; color: #9aa4b2; padding: 5px 10px 10px; display: flex; align-items: center; gap: 4px; }
</style>
