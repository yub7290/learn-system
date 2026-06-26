<template>
  <view class="exam-card" @click="$emit('click', item)">
    <view class="card-header">
      <view class="icon-wrap">
        <view class="icon-document"></view>
      </view>
      <text class="card-title">{{ index }}.{{ item.title }}</text>
    </view>
    <view class="divider"></view>
    <view class="card-body">
      <view class="info-row">
        <text class="info-label">总分：</text>
        <text class="info-value">{{ item.totalScore }}分 / {{ item.passScore }}分及格</text>
      </view>
      <view class="info-row">
        <text class="info-label">限时：</text>
        <text class="info-value">{{ item.duration }}分钟</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { ExamVO } from '../types/exam'

defineProps<{
  item: ExamVO
  index: number
}>()

defineEmits<{
  (e: 'click', item: ExamVO): void
}>()
</script>

<style scoped lang="scss">
.exam-card {
  background: $bg-card;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: $shadow-card;
}

.card-header {
  display: flex;
  align-items: center;
}

.icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: $primary-bg;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  flex-shrink: 0;
}

.icon-document {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  background: $gradient-primary;
  position: relative;
}

.icon-document::before {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  right: 3px;
  bottom: 3px;
  background: #fff;
  border-radius: 1px;
}

.icon-document::after {
  content: '';
  position: absolute;
  top: 8px;
  left: 7px;
  right: 7px;
  height: 1px;
  background: $border;
  box-shadow: 0 4px 0 $border, 0 8px 0 $border;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: $text-1;
  flex: 1;
}

.divider {
  height: 1px;
  background: $border;
  margin: 12px 0;
}

.card-body {
  padding-left: 0;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;

  &:last-child {
    margin-bottom: 0;
  }
}

.info-label {
  color: $text-3;
  width: 70px;
  flex-shrink: 0;
}

.info-value {
  color: $text-2;
}
</style>
