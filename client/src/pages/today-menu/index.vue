<template>
  <view class="menu-page">
    <!-- 日期切换 -->
    <view class="date-header">
      <view class="date-arrow" @click="prevDay">
        <text class="arrow-icon">&#x25C0;</text>
      </view>
      <view class="date-center">
        <text class="date-text">{{ displayDate }}</text>
        <text class="date-label" v-if="isToday">今天</text>
      </view>
      <view class="date-arrow" @click="nextDay">
        <text class="arrow-icon">&#x25B6;</text>
      </view>
    </view>

    <!-- 三餐卡片 -->
    <scroll-view class="meal-scroll" scroll-y>
      <view
        class="meal-card"
        v-for="meal in mealSections"
        :key="meal.type"
      >
        <!-- 卡片头部 -->
        <view class="meal-header">
          <view class="meal-title-row">
            <text class="meal-emoji">{{ meal.emoji }}</text>
            <text class="meal-name">{{ meal.label }}</text>
          </view>
          <view
            class="status-badge"
            :class="'status-' + meal.status"
            @click="cycleStatus(meal)"
          >
            <text class="status-text">{{ statusLabel(meal.status) }}</text>
          </view>
        </view>

        <!-- 菜品列表 -->
        <view class="dish-list" v-if="meal.items && meal.items.length">
          <view
            class="dish-row"
            :class="{ done: item.done }"
            v-for="item in meal.items"
            :key="item._id"
            @click="goDetail(item)"
          >
            <image v-if="item.cover || item.coverImage" class="dish-thumb" :src="getImageUrl(item.cover || item.coverImage)" mode="aspectFill" />
            <view v-else class="dish-thumb img-placeholder">
              <text class="placeholder-emoji" style="font-size: 36rpx;">🍽</text>
            </view>
            <view class="dish-info">
              <text class="dish-title" :class="{ strikethrough: item.done }">{{ item.title }}</text>
              <text class="dish-orderer" v-if="item.orderedBy">{{ item.orderedBy.nickname }} 点的</text>
            </view>
            <view class="dish-done-check" v-if="item.done">
              <text class="done-icon">&#x2713;</text>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view class="meal-empty" v-else>
          <text class="meal-empty-icon">&#x1F37D;</text>
          <text class="meal-empty-text">还没点菜</text>
          <text class="meal-empty-hint">去点菜页面添加吧</text>
        </view>
      </view>

      <!-- 全空提示 -->
      <view class="page-empty" v-if="!loading && !hasAnyItem">
        <text class="page-empty-icon">&#x1F4CB;</text>
        <text class="page-empty-text">这一天还没有安排菜单</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getOrderByDate, updateOrderStatus } from '@/api/order'
import { getToday, formatDate, mealTypeText } from '@/utils/format'
import { getImageUrl as _getImageUrl } from '@/api/request'
import dayjs from 'dayjs'

export default {
  data() {
    return {
      currentDate: getToday(),
      orderData: null,
      loading: false,
      mealConfigs: [
        { type: 'breakfast', label: '早餐', emoji: '\uD83C\uDF05' },
        { type: 'lunch', label: '午餐', emoji: '\u2600\uFE0F' },
        { type: 'dinner', label: '晚餐', emoji: '\uD83C\uDF19' }
      ],
      statusFlow: ['ordering', 'confirmed', 'completed']
    }
  },
  computed: {
    displayDate() {
      return formatDate(this.currentDate, 'M月D日 dddd')
    },
    isToday() {
      return this.currentDate === getToday()
    },
    mealSections() {
      return this.mealConfigs.map(config => {
        const mealData = this.orderData?.meals?.find(m => m.type === config.type)
        const items = (mealData?.items || []).map(item => {
          const recipe = item.recipeId || {}
          return {
            _id: item._id || recipe._id,
            recipeId: recipe._id || item.recipeId,
            title: recipe.title || '未知菜品',
            coverImage: recipe.coverImage || '',
            orderedBy: item.orderedBy || null,
            done: item.done || false
          }
        })
        return {
          ...config,
          status: mealData?.status || 'ordering',
          mealId: mealData?._id || null,
          items
        }
      })
    },
    hasAnyItem() {
      return this.mealSections.some(m => m.items && m.items.length > 0)
    }
  },
  onLoad() {
    this.loadOrder()
  },
  onShow() {
    this.loadOrder()
  },
  methods: {
    getImageUrl(path) {
      if (!path) return ''
      return _getImageUrl(path)
    },
    statusLabel(status) {
      const map = {
        ordering: '点菜中',
        confirmed: '已确认',
        completed: '已完成'
      }
      return map[status] || '点菜中'
    },
    prevDay() {
      this.currentDate = dayjs(this.currentDate).subtract(1, 'day').format('YYYY-MM-DD')
      this.loadOrder()
    },
    nextDay() {
      this.currentDate = dayjs(this.currentDate).add(1, 'day').format('YYYY-MM-DD')
      this.loadOrder()
    },
    async loadOrder() {
      this.loading = true
      try {
        const res = await getOrderByDate(this.currentDate)
        this.orderData = res || null
      } catch (e) {
        this.orderData = null
      } finally {
        this.loading = false
      }
    },
    async cycleStatus(meal) {
      if (!meal.mealId) {
        uni.showToast({ title: '还没有菜单', icon: 'none' })
        return
      }
      const currentIdx = this.statusFlow.indexOf(meal.status)
      const nextIdx = (currentIdx + 1) % this.statusFlow.length
      const nextStatus = this.statusFlow[nextIdx]
      try {
        await updateOrderStatus(meal.mealId, nextStatus)
        uni.showToast({ title: this.statusLabel(nextStatus), icon: 'none' })
        await this.loadOrder()
      } catch (e) {
        console.error('更新状态失败', e)
        uni.showToast({ title: '更新失败', icon: 'none' })
      }
    },
    goDetail(item) {
      const id = item.recipeId || item._id
      if (!id) return
      uni.navigateTo({
        url: `/pages/recipe-detail/index?id=${id}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.menu-page {
  min-height: 100vh;
  background: $bg-page;
  overflow-x: hidden;
}

/* 日期头部 */
.date-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx 32rpx 20rpx;
  background: $bg-card;
  border-bottom: 1rpx solid $border;
}

.date-arrow {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: $bg-page;
  transition: background 0.2s;

  &:active {
    background: $border;
  }
}

.arrow-icon {
  font-size: $font-caption;
  color: $text-secondary;
}

.date-center {
  display: flex;
  align-items: center;
  margin: 0 40rpx;
}

.date-text {
  font-size: $font-title;
  font-weight: 600;
  color: $text-primary;
}

.date-label {
  font-size: $font-mini;
  color: #fff;
  background: $primary;
  padding: 4rpx 16rpx;
  border-radius: $radius-xl;
  margin-left: 16rpx;
}

/* 三餐卡片 */
.meal-scroll {
  height: calc(100vh - 120rpx);
  padding: 20rpx 32rpx 40rpx;
  width: 100%;
  box-sizing: border-box;
}

.meal-card {
  background: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow-card;
  margin-bottom: 28rpx;
  overflow: hidden;
}

.meal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 28rpx;
  border-bottom: 1rpx solid $border;
}

.meal-title-row {
  display: flex;
  align-items: center;
}

.meal-emoji {
  font-size: 36rpx;
  margin-right: 12rpx;
}

.meal-name {
  font-size: $font-subtitle;
  font-weight: 600;
  color: $text-primary;
}

/* 状态标签 */
.status-badge {
  padding: 8rpx 24rpx;
  border-radius: $radius-xl;
  transition: all 0.2s;

  &.status-ordering {
    background: rgba($primary, 0.12);
  }

  &.status-confirmed {
    background: rgba($secondary, 0.12);
  }

  &.status-completed {
    background: rgba($success, 0.12);
  }
}

.status-text {
  font-size: $font-mini;
  font-weight: 500;

  .status-ordering & {
    color: $primary;
  }

  .status-confirmed & {
    color: $secondary;
  }

  .status-completed & {
    color: $success;
  }
}

/* 菜品行 */
.dish-list {
  padding: 0;
}

.dish-row {
  display: flex;
  align-items: center;
  padding: 20rpx 28rpx;
  border-bottom: 1rpx solid $border;
  transition: opacity 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &.done {
    opacity: 0.6;
  }
}

.dish-thumb {
  width: 80rpx;
  height: 80rpx;
  border-radius: $radius-sm;
  flex-shrink: 0;
  background: $bg-page;
}

.dish-info {
  flex: 1;
  margin-left: 20rpx;
  overflow: hidden;
}

.dish-title {
  font-size: $font-body;
  color: $text-primary;
  font-weight: 500;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &.strikethrough {
    text-decoration: line-through;
    color: $text-hint;
  }
}

.dish-orderer {
  font-size: $font-mini;
  color: $text-hint;
  margin-top: 6rpx;
  display: block;
}

.dish-done-check {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: $success;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: 16rpx;
}

.done-icon {
  font-size: $font-caption;
  color: #fff;
  font-weight: 600;
}

/* 空状态 - 单餐 */
.meal-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 0;
}

.meal-empty-icon {
  font-size: 52rpx;
  margin-bottom: 12rpx;
}

.meal-empty-text {
  font-size: $font-body;
  color: $text-hint;
}

.meal-empty-hint {
  font-size: $font-mini;
  color: $text-hint;
  opacity: 0.6;
  margin-top: 8rpx;
}

/* 全空提示 */
.page-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;
}

.page-empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.page-empty-text {
  font-size: $font-body;
  color: $text-hint;
}
</style>
