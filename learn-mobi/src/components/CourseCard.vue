<template>
  <view class="course-card" :class="{ locked: !isCourseAccessible(item.accessible) }" @click="$emit('click', item)">
    <view class="cover" :style="{ background: coverBg }">
      <image v-if="item.imageUrl" :src="item.imageUrl" mode="aspectFill" class="cover-img"></image>
      <view v-else class="cover-default">
        <view class="cover-deco"></view>
        <text class="cover-watermark">{{ coverInitial }}</text>
      </view>
      <view class="tag" :class="tagClass" v-if="item.feeType">{{ item.feeType }}</view>
      <view class="lock-badge" v-if="!isCourseAccessible(item.accessible)">
        <u-icon name="lock" color="#fff" size="11"></u-icon>
        <text>未授权</text>
      </view>
    </view>
    <view class="name">{{ item.name }}</view>
    <view class="teacher" v-if="item.teacherName">
      <u-icon name="account" color="#9aa4b2" size="11"></u-icon>
      <text>{{ item.teacherName }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { isCourseAccessible } from '../utils/permission'

export interface CourseCardItem {
  id: number
  imageUrl: string
  name: string
  courseType: number
  teacherName: string
  feeType?: string
  accessible?: boolean
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

// 课程名首字作为水印
const coverInitial = computed(() => {
  const name = props.item.name || ''
  return name.trim().charAt(0) || '课'
})

// 封面背景：有图留白，无图使用与首页 banner 一致的品牌渐变
const coverBg = computed(() => {
  if (props.item.imageUrl) return '#fff'
  return props.item.courseType === 3
    ? 'radial-gradient(120% 80% at 90% 10%, rgba(255,255,255,.35), rgba(255,255,255,0) 55%), linear-gradient(135deg,#ffb27a,#ff7847)'
    : 'radial-gradient(120% 80% at 90% 10%, rgba(255,255,255,.38), rgba(255,255,255,0) 55%), linear-gradient(135deg,#0195ff,#00c6ff)'
})
</script>

<style scoped lang="scss">
.course-card {
  background: $bg-card;
  border-radius: $radius-card;
  overflow: hidden;
  box-shadow: $shadow-card;
  border: 1px solid rgba(0, 0, 0, 0.03);
  position: relative;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.course-card:active {
  transform: translateY(-2px);
  box-shadow: 0 10px 26px rgba(0, 40, 80, 0.12);
}

/* 封面 */
.cover {
  height: 100px;
  position: relative;
  overflow: hidden;
}
.cover-img {
  width: 100%;
  height: 100%;
  display: block;
}

/* 无封面时的默认占位 */
.cover-default {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cover-deco {
  position: absolute;
  right: -26px;
  top: -26px;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 0 20px rgba(255, 255, 255, 0.05);
}
.cover-watermark {
  position: absolute;
  left: -6px;
  bottom: -16px;
  font-size: 64px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.12);
  line-height: 1;
  pointer-events: none;
}
/* 未授权：暗色遮罩 */
.course-card.locked .cover::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(20, 28, 42, 0.38);
  backdrop-filter: blur(1px);
}

/* 收费类型标签（免费/限免/试学） */
.tag {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
  font-size: 10px;
  line-height: 1;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}
.tag-free { color: #00a854; }
.tag-limited { color: #ff7a18; }
.tag-trial { color: #7c5cff; }

/* 锁定角标 */
.lock-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  line-height: 1;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 999px;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(2px);
}

/* 文本区 */
.name {
  font-size: 13px;
  color: $text-1;
  font-weight: 600;
  line-height: 1.35;
  padding: 10px 10px 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
.teacher {
  font-size: 11px;
  color: $text-3;
  padding: 6px 10px 11px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.course-card.locked .name { color: $text-3; }
</style>
