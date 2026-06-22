<template>
  <u-tabbar :value="current" @change="onChange" active-color="#0195ff" inactive-color="#9aa4b2" :border="false" fixed placeholder safe-area-inset-bottom>
    <u-tabbar-item v-for="(t, i) in tabs" :key="i" :text="t.text" :icon="t.icon"></u-tabbar-item>
  </u-tabbar>
</template>

<script setup lang="ts">
defineProps<{ current: number }>()

const tabs = [
  { text: '首页', icon: 'home' },
  { text: '课程', icon: 'bookmark' },
  { text: 'AI助教', icon: 'chat' },
  { text: '考试', icon: 'grid' },
  { text: '我的', icon: 'account' },
]

function onChange(i: number) {
  const urls = ['/pages/index/index', '/pages/course/course', '/pages/ai/chat', '/pages/exam/exam', '/pages/mine/mine']
  uni.reLaunch({ url: urls[i] }).catch(() => {})
}
</script>
