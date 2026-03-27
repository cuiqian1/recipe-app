<template>
  <view class="home-page">
    <!-- 顶部欢迎 -->
    <view class="header">
      <view class="header-left">
        <text class="greeting">Hi, {{ userStore.nickname }} 👋</text>
        <text class="subtitle">今天想吃什么？</text>
      </view>
    </view>

    <!-- 搜索 -->
    <view class="search-wrap" @click="goSearch">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <text class="search-placeholder">搜索菜谱...</text>
      </view>
    </view>

    <!-- 分类入口 -->
    <scroll-view class="category-scroll" scroll-x enable-flex>
      <view
        class="category-item"
        v-for="cat in categories"
        :key="cat._id"
        @click="goCategory(cat)"
      >
        <view class="category-icon-wrap">
          <text class="category-emoji">{{ cat.icon || '🍽' }}</text>
        </view>
        <text class="category-name">{{ cat.name }}</text>
      </view>
    </scroll-view>

    <!-- 今日菜单提示 -->
    <view class="today-banner" v-if="todayCount > 0" @click="goTodayMenu">
      <view class="today-info">
        <text class="today-label">📋 今日菜单</text>
        <text class="today-desc">已点 {{ todayCount }} 道菜</text>
      </view>
      <text class="today-arrow">›</text>
    </view>

    <!-- Tab 切换：我的菜谱 / 好友分享 -->
    <view class="recipe-tabs">
      <view
        :class="['tab-item', activeTab === 'mine' && 'tab-item--active']"
        @click="activeTab = 'mine'"
      >
        <text class="tab-text">我的菜谱</text>
        <text class="tab-count" v-if="myRecipes.length">{{ myRecipes.length }}</text>
      </view>
      <view
        :class="['tab-item', activeTab === 'shared' && 'tab-item--active']"
        @click="activeTab = 'shared'"
      >
        <text class="tab-text">好友分享</text>
        <text class="tab-count" v-if="sharedRecipes.length">{{ sharedRecipes.length }}</text>
      </view>
    </view>

    <!-- 我的菜谱 -->
    <view v-if="activeTab === 'mine'">
      <view class="category-section" v-for="group in myCategoryGroups" :key="'my-' + group.category._id">
        <view class="section-header">
          <text class="section-title">{{ group.category.icon }} {{ group.category.name }}</text>
          <view class="see-all" @click="goCategory(group.category)">
            <text class="see-all-text">查看全部</text>
          </view>
        </view>
        <scroll-view class="recipe-scroll" scroll-x enable-flex>
          <view
            class="recipe-card"
            v-for="recipe in group.recipes"
            :key="recipe._id"
            @click="goDetail(recipe._id)"
          >
            <image v-if="recipe.cover" class="card-cover" :src="getCover(recipe.cover)" mode="aspectFill" lazy-load />
            <view v-else class="card-cover img-placeholder">
              <text class="placeholder-emoji" style="font-size: 64rpx;">🍽</text>
            </view>
            <view class="card-info">
              <text class="card-title">{{ recipe.title }}</text>
              <view class="card-meta">
                <text class="meta-text">{{ recipe.cookTime || 0 }}分钟</text>
                <text class="meta-dot">·</text>
                <text class="meta-text">{{ recipe.difficulty === 1 ? '简单' : recipe.difficulty === 2 ? '中等' : '困难' }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
      <view class="tab-empty" v-if="!myCategoryGroups.length && !loading">
        <text class="empty-emoji">🍳</text>
        <text class="empty-hint">还没有菜谱哦</text>
        <view class="empty-btn" @click="goCreate">
          <text class="empty-btn-text">创建第一道菜谱</text>
        </view>
      </view>
    </view>

    <!-- 好友分享 -->
    <view v-if="activeTab === 'shared'">
      <view class="category-section" v-for="group in sharedCategoryGroups" :key="'shared-' + group.category._id">
        <view class="section-header">
          <text class="section-title">{{ group.category.icon }} {{ group.category.name }}</text>
        </view>
        <scroll-view class="recipe-scroll" scroll-x enable-flex>
          <view
            class="recipe-card"
            v-for="recipe in group.recipes"
            :key="recipe._id"
            @click="goDetail(recipe._id)"
          >
            <image v-if="recipe.cover" class="card-cover" :src="getCover(recipe.cover)" mode="aspectFill" lazy-load />
            <view v-else class="card-cover img-placeholder">
              <text class="placeholder-emoji" style="font-size: 64rpx;">🍽</text>
            </view>
            <view class="card-info">
              <text class="card-title">{{ recipe.title }}</text>
              <view class="card-meta">
                <text class="meta-text shared-from">{{ getCreatorName(recipe) }} 分享</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
      <view class="tab-empty" v-if="!sharedCategoryGroups.length && !loading">
        <text class="empty-emoji">🤝</text>
        <text class="empty-hint">还没有好友分享的菜谱</text>
      </view>
    </view>

    <view style="height: 40rpx;" />
  </view>
</template>

<script>
import { getRecipes } from '@/api/recipe'
import { getCategories } from '@/api/category'
import { getTodayMenu } from '@/api/order'
import { useUserStore } from '@/store/user'
import { getImageUrl } from '@/api/request'

export default {
  data() {
    return {
      categories: [],
      allRecipes: [],
      todayCount: 0,
      loading: false,
      activeTab: 'mine'
    }
  },
  computed: {
    userStore() {
      return useUserStore()
    },
    myRecipes() {
      return this.allRecipes.filter(r => {
        const creatorId = typeof r.createdBy === 'object' ? r.createdBy._id : r.createdBy
        return creatorId === this.userStore.userId
      })
    },
    sharedRecipes() {
      return this.allRecipes.filter(r => {
        const creatorId = typeof r.createdBy === 'object' ? r.createdBy._id : r.createdBy
        return creatorId !== this.userStore.userId && r.isShared
      })
    },
    myCategoryGroups() {
      return this.buildGroups(this.myRecipes)
    },
    sharedCategoryGroups() {
      return this.buildGroups(this.sharedRecipes)
    }
  },
  onShow() {
    if (!this.userStore.isLoggedIn) {
      uni.redirectTo({ url: '/pages/login/index' })
      return
    }
    this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      await Promise.all([
        this.loadCategories(),
        this.loadRecipes(),
        this.loadTodayMenu()
      ])
      this.loading = false
    },
    async loadCategories() {
      try { this.categories = await getCategories() } catch (e) {}
    },
    async loadRecipes() {
      try {
        const res = await getRecipes({ page: 1, pageSize: 100 })
        this.allRecipes = res.list || []
      } catch (e) {}
    },
    async loadTodayMenu() {
      try {
        const meals = await getTodayMenu()
        let count = 0
        if (meals) {
          ['breakfast', 'lunch', 'dinner'].forEach(key => {
            if (meals[key] && meals[key].items) count += meals[key].items.length
          })
        }
        this.todayCount = count
      } catch (e) {}
    },
    getCover(cover) {
      if (!cover) return '/static/images/default-cover.png'
      return getImageUrl(cover)
    },
    buildGroups(recipes) {
      if (!this.categories.length || !recipes.length) return []
      const groups = []
      for (const cat of this.categories) {
        const matched = recipes.filter(r => {
          const catId = typeof r.categoryId === 'object' ? r.categoryId._id : r.categoryId
          return catId === cat._id
        })
        if (matched.length > 0) {
          groups.push({ category: cat, recipes: matched.slice(0, 6) })
        }
      }
      return groups
    },
    getCreatorName(recipe) {
      if (!recipe.createdBy) return ''
      return typeof recipe.createdBy === 'object' ? recipe.createdBy.nickname : ''
    },
    goSearch() {
      uni.navigateTo({ url: '/pages/recipe-list/index' })
    },
    goCategory(cat) {
      uni.navigateTo({ url: `/pages/recipe-list/index?categoryId=${cat._id}` })
    },
    goDetail(id) {
      uni.navigateTo({ url: `/pages/recipe-detail/index?id=${id}` })
    },
    goTodayMenu() {
      uni.switchTab({ url: '/pages/today-menu/index' })
    },
    goCreate() {
      uni.navigateTo({ url: '/pages/recipe-edit/index' })
    }
  }
}
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  background: #FFFFFF;
  padding-bottom: 40rpx;
  overflow-x: hidden;
}

/* 顶部 */
.header {
  padding: 32rpx 32rpx 16rpx;
}
.greeting { display: block; font-size: 36rpx; font-weight: 800; color: #1A1A1A; }
.subtitle { display: block; font-size: 26rpx; color: #BFBFBF; margin-top: 8rpx; }

/* 搜索 */
.search-wrap { padding: 16rpx 32rpx 24rpx; }
.search-box {
  display: flex;
  align-items: center;
  background: #F5F5F5;
  border-radius: 48rpx;
  padding: 0 28rpx;
  height: 80rpx;
}
.search-icon { font-size: 28rpx; margin-right: 12rpx; }
.search-placeholder { font-size: 28rpx; color: #BFBFBF; }

/* Tab 切换 */
.recipe-tabs {
  display: flex;
  margin: 0 32rpx 24rpx;
  background: #F5F5F5;
  border-radius: 16rpx;
  padding: 6rpx;
}
.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  height: 72rpx;
  border-radius: 12rpx;
  transition: all 0.25s;
}
.tab-item--active {
  background: #FFFFFF;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.08);
}
.tab-text {
  font-size: 28rpx;
  color: #999;
  font-weight: 600;
  .tab-item--active & { color: #1A1A1A; }
}
.tab-count {
  font-size: 22rpx;
  color: #BFBFBF;
  background: #F0F0F0;
  padding: 2rpx 12rpx;
  border-radius: 20rpx;
  .tab-item--active & { background: #1A1A1A; color: #fff; }
}
.tab-empty {
  padding: 120rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 分类横滑 */
.category-scroll {
  white-space: nowrap;
  padding: 0 32rpx 28rpx;
  width: 100%;
  box-sizing: border-box;
}
.category-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  margin-right: 36rpx;
  flex-shrink: 0;
}
.category-icon-wrap {
  width: 96rpx; height: 96rpx;
  border-radius: 24rpx;
  background: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}
.category-emoji { font-size: 40rpx; }
.category-name { font-size: 22rpx; color: #888; text-align: center; }

/* 今日菜单 */
.today-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 32rpx 28rpx;
  padding: 24rpx 28rpx;
  background: #F8F8F8;
  border-radius: 20rpx;

  &:active { background: #F0F0F0; }
}
.today-info { display: flex; flex-direction: column; gap: 6rpx; }
.today-label { font-size: 28rpx; font-weight: 600; color: #1A1A1A; }
.today-desc { font-size: 24rpx; color: #999; }
.today-arrow { font-size: 36rpx; color: #BFBFBF; }

/* 分类区块 */
.category-section {
  margin-bottom: 36rpx;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx 20rpx;
}
.section-title { font-size: 32rpx; font-weight: 700; color: #1A1A1A; }
.see-all-text { font-size: 24rpx; color: #BFBFBF; }

/* 横滑菜谱卡片 */
.recipe-scroll {
  white-space: nowrap;
  padding: 0 32rpx;
  width: 100%;
  box-sizing: border-box;
}
.recipe-card {
  display: inline-block;
  width: 300rpx;
  margin-right: 20rpx;
  border-radius: 20rpx;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06);
  flex-shrink: 0;
  vertical-align: top;

  &:active { transform: scale(0.97); }
}
.card-cover {
  width: 300rpx;
  height: 220rpx;
}
.card-info {
  padding: 16rpx 20rpx 20rpx;
}
.card-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1A1A1A;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8rpx;
}
.card-meta {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.meta-text { font-size: 22rpx; color: #BFBFBF; }
.meta-dot { font-size: 22rpx; color: #DDD; }
.shared-from { color: #2EC4B6; font-weight: 500; }

/* 空状态 */
.empty-wrap {
  padding: 120rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.empty-emoji { font-size: 100rpx; margin-bottom: 20rpx; }
.empty-hint { font-size: 28rpx; color: #BFBFBF; margin-bottom: 32rpx; }
.empty-btn {
  padding: 20rpx 48rpx;
  background: #1A1A1A;
  border-radius: 40rpx;
}
.empty-btn-text { font-size: 28rpx; color: #fff; font-weight: 600; }
</style>
