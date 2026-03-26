<template>
  <view class="list-page">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <view class="nav-back" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">食谱列表</text>
      <view class="nav-placeholder" />
    </view>

    <!-- 搜索栏 -->
    <view class="search-wrap">
      <view class="search-box">
        <text class="search-icon-text">🔍</text>
        <input
          class="search-input"
          v-model="keyword"
          placeholder="搜索菜谱..."
          placeholder-class="search-placeholder"
          @confirm="doSearch"
        />
        <view class="search-clear" v-if="keyword" @click="keyword = ''; doSearch()">
          <text class="clear-text">×</text>
        </view>
      </view>
    </view>

    <!-- 分类标签 -->
    <scroll-view class="category-bar" scroll-x enable-flex>
      <view
        :class="['cat-tab', !activeCategoryId && 'cat-tab--active']"
        @click="selectCategory('')"
      >
        <text class="cat-tab-text">全部</text>
      </view>
      <view
        v-for="cat in categories"
        :key="cat._id"
        :class="['cat-tab', activeCategoryId === cat._id && 'cat-tab--active']"
        @click="selectCategory(cat._id)"
      >
        <text class="cat-tab-text">{{ cat.name }}</text>
      </view>
    </scroll-view>

    <!-- 菜谱列表 — 参考设计稿的横卡片布局 -->
    <view class="recipe-list" v-if="recipes.length">
      <view
        class="recipe-card"
        v-for="item in recipes"
        :key="item._id"
        @click="goDetail(item._id)"
      >
        <image class="card-image" :src="getCover(item.cover)" mode="aspectFill" lazy-load />
        <view class="card-body">
          <view class="card-top">
            <view class="card-category" v-if="item.categoryId">
              <text class="category-label">{{ item.categoryId.name || '美食' }}</text>
            </view>
          </view>
          <text class="card-title">{{ item.title }}</text>
          <view class="card-stats">
            <view class="stat-item">
              <text class="stat-icon">🔥</text>
              <text class="stat-value">{{ item.difficulty === 1 ? '简单' : item.difficulty === 2 ? '中等' : '困难' }}</text>
            </view>
            <view class="stat-item">
              <text class="stat-icon">⏱</text>
              <text class="stat-value">{{ item.cookTime || 0 }}分钟</text>
            </view>
            <view class="stat-item">
              <text class="stat-icon">🍽</text>
              <text class="stat-value">{{ item.servings || 2 }}人份</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-wrap" v-else-if="!loading">
      <text class="empty-emoji">🍳</text>
      <text class="empty-hint">还没有菜谱，去创建一个吧</text>
    </view>

    <!-- 加载提示 -->
    <view class="load-tip" v-if="loading">
      <text class="load-text">加载中...</text>
    </view>
    <view class="load-tip" v-else-if="noMore && recipes.length">
      <text class="load-text">— 已经到底了 —</text>
    </view>
  </view>
</template>

<script>
import { getRecipes } from '@/api/recipe'
import { getCategories } from '@/api/category'
import { getImageUrl } from '@/api/request'

export default {
  data() {
    return {
      recipes: [],
      categories: [],
      keyword: '',
      activeCategoryId: '',
      page: 1,
      pageSize: 10,
      total: 0,
      loading: false,
      noMore: false
    }
  },
  onLoad(options) {
    if (options.categoryId) this.activeCategoryId = options.categoryId
    if (options.keyword) this.keyword = options.keyword
    this.loadCategories()
    this.loadRecipes()
  },
  onReachBottom() {
    if (!this.noMore && !this.loading) {
      this.page++
      this.loadRecipes(true)
    }
  },
  onPullDownRefresh() {
    this.page = 1
    this.noMore = false
    this.loadRecipes().then(() => uni.stopPullDownRefresh())
  },
  methods: {
    async loadCategories() {
      try { this.categories = await getCategories() } catch (e) {}
    },
    async loadRecipes(append = false) {
      if (this.loading) return
      this.loading = true
      try {
        const params = { page: this.page, pageSize: this.pageSize }
        if (this.activeCategoryId) params.categoryId = this.activeCategoryId
        if (this.keyword) params.keyword = this.keyword
        const res = await getRecipes(params)
        this.recipes = append ? [...this.recipes, ...res.list] : (res.list || [])
        this.total = res.total || 0
        this.noMore = this.recipes.length >= this.total
      } catch (e) {}
      this.loading = false
    },
    selectCategory(id) {
      this.activeCategoryId = id
      this.page = 1
      this.noMore = false
      this.loadRecipes()
    },
    doSearch() {
      this.page = 1
      this.noMore = false
      this.loadRecipes()
    },
    getCover(cover) {
      if (!cover) return '/static/images/default-cover.png'
      return getImageUrl(cover)
    },
    goDetail(id) {
      uni.navigateTo({ url: `/pages/recipe-detail/index?id=${id}` })
    },
    goBack() {
      uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/index/index' }) })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.list-page {
  min-height: 100vh;
  background: #FFFFFF;
}

/* 导航 */
.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx 16rpx;
}
.nav-back {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.back-icon { font-size: 56rpx; color: #333; font-weight: 300; line-height: 1; }
.nav-title { font-size: 36rpx; font-weight: 700; color: #1A1A1A; }
.nav-placeholder { width: 56rpx; }

/* 搜索 */
.search-wrap { padding: 0 32rpx 20rpx; }
.search-box {
  display: flex;
  align-items: center;
  background: #F5F5F5;
  border-radius: 60rpx;
  padding: 0 28rpx;
  height: 80rpx;
}
.search-icon-text { font-size: 28rpx; margin-right: 12rpx; }
.search-input { flex: 1; font-size: 28rpx; color: #333; }
.search-placeholder { color: #BFBFBF; }
.search-clear {
  width: 40rpx; height: 40rpx;
  background: #D9D9D9; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.clear-text { font-size: 28rpx; color: #fff; }

/* 分类 */
.category-bar { white-space: nowrap; padding: 0 32rpx 28rpx; }
.cat-tab {
  display: inline-flex;
  padding: 14rpx 36rpx;
  border-radius: 40rpx;
  background: #F5F5F5;
  margin-right: 16rpx;
  transition: all 0.2s;
}
.cat-tab--active {
  background: #1A1A1A;
  .cat-tab-text { color: #fff; }
}
.cat-tab-text { font-size: 26rpx; color: #888; font-weight: 500; }

/* === 核心：横向菜谱卡片（参考设计稿） === */
.recipe-list { padding: 0 32rpx; }

.recipe-card {
  display: flex;
  align-items: stretch;
  background: #FFFFFF;
  border-radius: 28rpx;
  overflow: hidden;
  margin-bottom: 28rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.07);

  &:active {
    transform: scale(0.98);
  }
}

.card-image {
  width: 260rpx;
  min-height: 260rpx;
  flex-shrink: 0;
  object-fit: cover;
}

.card-body {
  flex: 1;
  padding: 28rpx 28rpx 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-top { margin-bottom: 8rpx; }

.card-category {
  display: inline-flex;
  padding: 6rpx 20rpx;
  background: rgba(46, 196, 182, 0.12);
  border-radius: 20rpx;
}
.category-label { font-size: 22rpx; color: #2EC4B6; font-weight: 600; }

.card-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1A1A1A;
  line-height: 1.45;
  margin-bottom: 20rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-stats {
  display: flex;
  gap: 20rpx;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
}
.stat-icon { font-size: 24rpx; }
.stat-value { font-size: 22rpx; color: #999; font-weight: 500; }

/* 空状态 */
.empty-wrap {
  padding: 200rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.empty-emoji { font-size: 120rpx; margin-bottom: 24rpx; }
.empty-hint { font-size: 28rpx; color: #BFBFBF; }

/* 加载提示 */
.load-tip { padding: 40rpx 0; text-align: center; }
.load-text { font-size: 24rpx; color: #BFBFBF; }
</style>
