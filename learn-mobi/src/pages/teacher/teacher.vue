<template>
  <view class="teacher-page">
    <view class="teacher-grid" v-if="teacherList.length">
      <view class="teacher-card" v-for="t in teacherList" :key="t.id" @click="goTeacher(t.id)">
        <image class="avatar" :src="t.avatarUrl" v-if="t.avatarUrl"></image>
        <view class="avatar ph" v-else></view>
        <text class="t-name">{{ t.name }}</text>
        <text class="t-title" v-if="t.titleName">{{ t.titleName }}</text>
        <text class="t-signature" v-if="t.signature">{{ t.signature }}</text>
      </view>
    </view>
    <u-empty v-else text="暂无教师数据" mode="data" margin-top="80"></u-empty>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getTeacherList } from '../../api/teacher'
import type { TeacherListItem } from '../../types/teacher'

const teacherList = ref<TeacherListItem[]>([])

async function loadData() {
  try {
    const res = await getTeacherList()
    teacherList.value = res.list || []
  } catch (e) { /* stub -> empty */ }
}

onShow(loadData)

function goTeacher(id: number) {
  uni.showToast({ title: '老师详情', icon: 'none' })
}
</script>

<style scoped lang="scss">
.teacher-page { min-height: 100vh; padding: 14px; background: $bg-page; }
.teacher-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.teacher-card {
  background: $bg-card; border-radius: 14px; padding: 20px 12px; text-align: center;
  box-shadow: $shadow-card; display: flex; flex-direction: column; align-items: center;
}
.avatar { width: 64px; height: 64px; border-radius: 50%; }
.avatar.ph { width: 64px; height: 64px; border-radius: 50%; background: #d6dde6; }
.t-name { font-size: 14px; font-weight: 600; color: $text-1; margin-top: 10px; }
.t-title { font-size: 12px; color: $primary; margin-top: 4px; }
.t-signature { font-size: 11px; color: $text-3; margin-top: 6px; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
</style>
