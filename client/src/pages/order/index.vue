<template>
  <view class="order-page">
    <!-- 餐次选择 -->
    <view class="meal-tabs">
      <view
        class="meal-tab"
        :class="{ active: activeMeal === meal.key }"
        v-for="meal in mealTypes"
        :key="meal.key"
        @click="switchMeal(meal.key)"
      >
        <text class="meal-emoji">{{ meal.emoji }}</text>
        <text class="meal-label">{{ meal.label }}</text>
      </view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-inner">
        <text class="search-icon">&#x1F50D;</text>
        <input
          class="search-input"
          type="text"
          v-model="keyword"
          placeholder="搜索菜谱..."
          confirm-type="search"
          @confirm="onSearch"
        />
        <view class="search-clear" v-if="keyword" @click="clearSearch">
          <text class="clear-text">&#x2715;</text>
        </view>
      </view>
    </view>

    <!-- 分类分组列表 -->
    <scroll-view class="recipe-scroll" scroll-y :style="{ height: scrollHeight + 'px' }">
      <view class="category-group" v-for="group in filteredGroups" :key="group.categoryId">
        <view class="category-header" @click="toggleCategory(group.categoryId)">
          <text class="category-name">{{ group.categoryName }}</text>
          <text class="category-count">{{ group.recipes.length }}</text>
          <text class="category-arrow" :class="{ collapsed: collapsedMap[group.categoryId] }">&#x25BE;</text>
        </view>
        <view class="recipe-list" v-show="!collapsedMap[group.categoryId]">
          <view
            class="recipe-row"
            v-for="recipe in group.recipes"
            :key="recipe._id"
            @click="goDetail(recipe._id)"
          >
            <image class="recipe-thumb" :src="getImageUrl(recipe.coverImage)" mode="aspectFill" />
            <view class="recipe-info">
              <text class="recipe-title">{{ recipe.title }}</text>
              <view class="recipe-meta">
                <view class="difficulty-dot" :class="'level-' + recipe.difficulty"></view>
                <text class="meta-text">{{ difficultyText(recipe.difficulty) }}</text>
                <text class="meta-divider">|</text>
                <text class="meta-text">{{ cookTimeText(recipe.cookTime) }}</text>
              </view>
            </view>
            <view
              class="add-btn"
              :class="{ checked: isOrdered(recipe._id) }"
              @click.stop="toggleItem(recipe)"
            >
              <text class="add-icon" v-if="!isOrdered(recipe._id)">+</text>
              <text class="check-icon" v-else>&#x2713;</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty" v-if="!filteredGroups.length && !loading">
        <text class="empty-icon">&#x1F373;</text>
        <text class="empty-text">暂无菜谱</text>
      </view>
    </scroll-view>

    <!-- 底部已点菜面板 -->
    <view class="bottom-panel" v-if="currentMealItems.length">
      <view class="panel-left">
        <text class="panel-count">已选 {{ currentMealItems.length }} 道菜</text>
        <scroll-view class="panel-thumbs" scroll-x enable-flex>
          <image
            class="panel-thumb"
            v-for="item in currentMealItems"
            :key="item._id"
            :src="getImageUrl(item.coverImage)"
            mode="aspectFill"
          />
        </scroll-view>
      </view>
      <view class="confirm-btn" @click="confirmMenu">
        <text class="confirm-text">确认菜单</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getRecipes } from '@/api/recipe'
import { getCategories } from '@/api/category'
import { addOrderItem, getTodayMenu } from '@/api/order'
import { getToday, difficultyText, cookTimeText } from '@/utils/format'
import { useUserStore } from '@/store/user'
import { getImageUrl as _getImageUrl } from '@/api/request'

export default {
  data() {
    return {
      mealTypes: [
        { key: 'breakfast', label: '早餐', emoji: '\uD83C\uDF05' },
        { key: 'lunch', label: '午餐', emoji: '\u2600\uFE0F' },
        { key: 'dinner', label: '晚餐', emoji: '\uD83C\uDF19' }
      ],
      activeMeal: 'lunch',
      keyword: '',
      categories: [],
      allRecipes: [],
      todayMenu: null,
      collapsedMap: {},
      loading: false,
      scrollHeight: 500
    }
  },
  computed: {
    // 按分类分组
    groupedRecipes() {
      const groups = []
      const catMap = {}
      this.categories.forEach(cat => {
        catMap[cat._id] = cat.name
      })
      // 按分类分组
      const map = {}
      this.allRecipes.forEach(recipe => {
        const catId = recipe.categoryId || 'uncategorized'
        if (!map[catId]) {
          map[catId] = {
            categoryId: catId,
            categoryName: catMap[catId] || '其他',
            recipes: []
          }
        }
        map[catId].recipes.push(recipe)
      })
      return Object.values(map)
    },
    // 搜索过滤
    filteredGroups() {
      if (!this.keyword.trim()) return this.groupedRecipes
      const kw = this.keyword.trim().toLowerCase()
      return this.groupedRecipes
        .map(group => ({
          ...group,
          recipes: group.recipes.filter(r =>
            r.title.toLowerCase().includes(kw)
          )
        }))
        .filter(group => group.recipes.length > 0)
    },
    // 当前餐次已点的菜品列表
    currentMealItems() {
      if (!this.todayMenu || !this.todayMenu.meals) return []
      const meal = this.todayMenu.meals.find(m => m.type === this.activeMeal)
      if (!meal || !meal.items) return []
      // 将 item 中的 recipeId 匹配到完整菜谱信息
      return meal.items.map(item => {
        const recipe = this.allRecipes.find(r => r._id === (item.recipeId?._id || item.recipeId))
        return recipe || { _id: item.recipeId, title: '未知菜品', coverImage: '' }
      })
    },
    // 当前餐次已点的 recipeId 集合
    orderedIdSet() {
      const set = new Set()
      this.currentMealItems.forEach(item => {
        set.add(item._id)
      })
      return set
    }
  },
  onLoad() {
    this.calcScrollHeight()
    this.loadCategories()
    this.loadRecipes()
    this.loadTodayMenu()
  },
  onShow() {
    // 每次显示时刷新今日菜单
    this.loadTodayMenu()
  },
  methods: {
    difficultyText,
    cookTimeText,
    calcScrollHeight() {
      const sysInfo = uni.getSystemInfoSync()
      // 餐次 tabs(100rpx) + 搜索栏(100rpx) + 底部面板(120rpx) + 安全区
      const reserved = uni.upx2px(320) + (sysInfo.safeAreaInsets?.bottom || 0) + 50
      this.scrollHeight = sysInfo.windowHeight - reserved
    },
    getImageUrl(path) {
      if (!path) return ''
      return _getImageUrl(path)
    },
    switchMeal(key) {
      this.activeMeal = key
    },
    toggleCategory(catId) {
      this.collapsedMap = {
        ...this.collapsedMap,
        [catId]: !this.collapsedMap[catId]
      }
    },
    isOrdered(recipeId) {
      return this.orderedIdSet.has(recipeId)
    },
    async loadCategories() {
      try {
        this.categories = await getCategories()
      } catch (e) {
        console.error('加载分类失败', e)
      }
    },
    async loadRecipes() {
      this.loading = true
      try {
        const res = await getRecipes({ pageSize: 999 })
        this.allRecipes = res.list || res.data || res || []
      } catch (e) {
        console.error('加载菜谱失败', e)
      } finally {
        this.loading = false
      }
    },
    async loadTodayMenu() {
      try {
        const res = await getTodayMenu()
        this.todayMenu = res || null
      } catch (e) {
        // 可能还没有今日菜单，忽略
        this.todayMenu = null
      }
    },
    async toggleItem(recipe) {
      const userStore = useUserStore()
      if (!userStore.isLoggedIn) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        return
      }
      if (this.isOrdered(recipe._id)) {
        // 已点过的不重复添加
        uni.showToast({ title: '已在菜单中', icon: 'none' })
        return
      }
      try {
        await addOrderItem({
          date: getToday(),
          mealType: this.activeMeal,
          recipeId: recipe._id
        })
        uni.showToast({ title: '已添加', icon: 'success' })
        // 刷新今日菜单
        await this.loadTodayMenu()
      } catch (e) {
        console.error('添加失败', e)
        uni.showToast({ title: '添加失败', icon: 'none' })
      }
    },
    confirmMenu() {
      uni.switchTab({
        url: '/pages/today-menu/index'
      })
    },
    goDetail(id) {
      uni.navigateTo({
        url: `/pages/recipe-detail/index?id=${id}`
      })
    },
    onSearch() {
      // 搜索由 computed 自动过滤
    },
    clearSearch() {
      this.keyword = ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.order-page {
  min-height: 100vh;
  background: $bg-page;
  padding-bottom: 140rpx;
}

/* 餐次 Tabs */
.meal-tabs {
  display: flex;
  background: $bg-card;
  padding: 20rpx 32rpx;
  gap: 20rpx;
}

.meal-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20rpx 0;
  border-radius: $radius-lg;
  background: $bg-page;
  transition: all 0.25s;

  &.active {
    background: $primary;
    box-shadow: 0 4rpx 16rpx rgba($primary, 0.35);
  }
}

.meal-emoji {
  font-size: 40rpx;
  margin-bottom: 6rpx;
}

.meal-label {
  font-size: $font-caption;
  color: $text-secondary;
  font-weight: 500;

  .meal-tab.active & {
    color: #fff;
    font-weight: 600;
  }
}

/* 搜索栏 */
.search-bar {
  padding: 16rpx 32rpx;
  background: $bg-card;
  border-bottom: 1rpx solid $border;
}

.search-inner {
  display: flex;
  align-items: center;
  background: $bg-page;
  border-radius: $radius-xl;
  padding: 14rpx 24rpx;
}

.search-icon {
  font-size: 26rpx;
  margin-right: 12rpx;
}

.search-input {
  flex: 1;
  font-size: $font-body;
  color: $text-primary;
}

.search-clear {
  padding: 8rpx;
  margin-left: 8rpx;
}

.clear-text {
  font-size: $font-caption;
  color: $text-hint;
}

/* 分类分组 */
.recipe-scroll {
  padding: 0 0 20rpx;
}

.category-group {
  margin: 20rpx 32rpx 0;
  background: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-card;
}

.category-header {
  display: flex;
  align-items: center;
  padding: 24rpx 28rpx;
  border-bottom: 1rpx solid $border;
}

.category-name {
  flex: 1;
  font-size: $font-subtitle;
  font-weight: 600;
  color: $text-primary;
}

.category-count {
  font-size: $font-mini;
  color: $text-hint;
  background: $bg-page;
  padding: 4rpx 16rpx;
  border-radius: $radius-xl;
  margin-right: 12rpx;
}

.category-arrow {
  font-size: $font-body;
  color: $text-hint;
  transition: transform 0.25s;

  &.collapsed {
    transform: rotate(-90deg);
  }
}

/* 菜谱行 */
.recipe-row {
  display: flex;
  align-items: center;
  padding: 20rpx 28rpx;
  border-bottom: 1rpx solid $border;

  &:last-child {
    border-bottom: none;
  }
}

.recipe-thumb {
  width: 80rpx;
  height: 80rpx;
  border-radius: $radius-sm;
  flex-shrink: 0;
  background: $bg-page;
}

.recipe-info {
  flex: 1;
  margin-left: 20rpx;
  overflow: hidden;
}

.recipe-title {
  font-size: $font-body;
  color: $text-primary;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.recipe-meta {
  display: flex;
  align-items: center;
  margin-top: 8rpx;
}

.difficulty-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  margin-right: 8rpx;

  &.level-1 {
    background: $difficulty-easy;
  }
  &.level-2 {
    background: $difficulty-medium;
  }
  &.level-3 {
    background: $difficulty-hard;
  }
}

.meta-text {
  font-size: $font-mini;
  color: $text-hint;
}

.meta-divider {
  margin: 0 10rpx;
  color: $border;
  font-size: $font-mini;
}

/* 添加/已选按钮 */
.add-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: 16rpx;
  background: $primary;
  transition: all 0.2s;

  &.checked {
    background: $success;
  }
}

.add-icon {
  font-size: 36rpx;
  color: #fff;
  font-weight: 300;
  line-height: 1;
}

.check-icon {
  font-size: 28rpx;
  color: #fff;
  font-weight: 600;
}

/* 空状态 */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 160rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: $font-body;
  color: $text-hint;
}

/* 底部面板 */
.bottom-panel {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: $bg-card;
  box-shadow: $shadow-float;
  z-index: 100;
}

.panel-left {
  flex: 1;
  overflow: hidden;
}

.panel-count {
  font-size: $font-caption;
  color: $text-secondary;
  font-weight: 500;
  margin-bottom: 8rpx;
  display: block;
}

.panel-thumbs {
  white-space: nowrap;
}

.panel-thumb {
  width: 56rpx;
  height: 56rpx;
  border-radius: $radius-sm;
  margin-right: 10rpx;
  display: inline-block;
  background: $bg-page;
}

.confirm-btn {
  flex-shrink: 0;
  margin-left: 24rpx;
  padding: 20rpx 40rpx;
  background: $primary;
  border-radius: $radius-xl;
  box-shadow: 0 4rpx 16rpx rgba($primary, 0.35);
}

.confirm-text {
  font-size: $font-body;
  color: #fff;
  font-weight: 600;
}
</style>
