<template>
  <view class="recipe-card card" @click="goDetail">
    <image v-if="recipe.cover" class="card-cover" :src="coverUrl" mode="aspectFill" lazy-load />
    <view v-else class="card-cover img-placeholder">
      <text class="placeholder-emoji" style="font-size: 80rpx;">🍽</text>
    </view>
    <view class="card-info">
      <text class="card-title">{{ recipe.title }}</text>
      <view class="card-meta">
        <view class="meta-item">
          <view class="difficulty-dot" :class="'difficulty-' + recipe.difficulty"></view>
          <text>{{ difficultyText(recipe.difficulty) }}</text>
        </view>
        <text class="meta-time" v-if="recipe.cookTime">{{ cookTimeText(recipe.cookTime) }}</text>
      </view>
      <view class="card-tags" v-if="recipe.tags && recipe.tags.length">
        <text class="tag tag-primary" v-for="tag in recipe.tags.slice(0, 2)" :key="tag">{{ tag }}</text>
      </view>
      <view class="card-footer">
        <text class="card-author" v-if="recipe.createdBy">{{ recipe.createdBy.nickname }}</text>
        <view class="card-shared" v-if="recipe.isShared">
          <text class="shared-badge">已分享</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { difficultyText, cookTimeText } from '@/utils/format'
import { getImageUrl } from '@/api/request'

export default {
  name: 'RecipeCard',
  props: {
    recipe: { type: Object, required: true }
  },
  computed: {
    coverUrl() {
      if (!this.recipe.cover) return '/static/images/default-cover.png'
      return getImageUrl(this.recipe.cover)
    }
  },
  methods: {
    difficultyText,
    cookTimeText,
    goDetail() {
      uni.navigateTo({ url: `/pages/recipe-detail/index?id=${this.recipe._id}` })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.recipe-card {
  border-radius: $radius-lg;
  overflow: hidden;
  transition: transform 0.15s;

  &:active {
    transform: scale(0.97);
  }
}

.card-cover {
  width: 100%;
  height: 280rpx;
}

.card-info {
  padding: 16rpx 20rpx 20rpx;
}

.card-title {
  font-size: $font-body;
  font-weight: 700;
  color: $text-primary;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  align-items: center;
  margin-top: 10rpx;
  font-size: $font-caption;
  color: $text-secondary;

  .meta-item {
    display: flex;
    align-items: center;
    margin-right: 16rpx;
  }

  .meta-time {
    color: $text-hint;
  }
}

.card-tags {
  margin-top: 10rpx;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10rpx;
}

.card-author {
  font-size: $font-mini;
  color: $text-hint;
}

.shared-badge {
  font-size: $font-mini;
  color: $secondary;
  background: rgba($secondary, 0.1);
  padding: 2rpx 12rpx;
  border-radius: 12rpx;
}
</style>
