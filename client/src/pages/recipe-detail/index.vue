<template>
  <view class="detail-page">
    <!-- 顶部导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-back" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">食谱详情</text>
      <view class="nav-actions" v-if="isCreator">
        <view class="action-btn" @click="goEdit">
          <text class="action-icon">✏️</text>
          <text class="action-text">编辑</text>
        </view>
        <view class="action-btn action-btn--delete" @click="handleDelete">
          <text class="action-icon">🗑</text>
          <text class="action-text">删除</text>
        </view>
      </view>
      <view class="nav-actions" v-else />
    </view>

    <!-- 大图封面 -->
    <view class="cover-wrap">
      <image class="cover-image" :src="coverUrl" mode="aspectFill" />
      <view class="cover-category" v-if="recipe.categoryId">
        <text class="cover-category-text">{{ recipe.categoryId.name || '美食' }}</text>
      </view>
    </view>

    <!-- 主体内容区 -->
    <view class="content">
      <!-- 标题 -->
      <text class="recipe-title">{{ recipe.title }}</text>

      <!-- 描述 -->
      <text class="recipe-desc" v-if="recipe.description">{{ recipe.description }}</text>

      <!-- 标签 -->
      <view class="tags-row" v-if="recipe.tags && recipe.tags.length">
        <view class="tag-item" v-for="(tag, i) in recipe.tags" :key="i">
          <text class="tag-text">#{{ tag }}</text>
        </view>
      </view>

      <!-- 信息行 -->
      <view class="info-row">
        <view class="info-item">
          <text class="info-icon">🔥</text>
          <view class="info-detail">
            <text class="info-value">{{ difficultyLabel }}</text>
          </view>
        </view>
        <view class="info-item">
          <text class="info-icon">⏱</text>
          <view class="info-detail">
            <text class="info-value">{{ recipe.cookTime || 0 }}</text>
            <text class="info-unit">分钟</text>
          </view>
        </view>
        <view class="info-item">
          <text class="info-icon">🍽</text>
          <view class="info-detail">
            <text class="info-value">{{ recipe.servings || 2 }}</text>
            <text class="info-unit">人份</text>
          </view>
        </view>
      </view>

      <!-- 分隔线 -->
      <view class="divider" />

      <!-- 原料 -->
      <view class="section" v-if="recipe.ingredients && recipe.ingredients.length">
        <text class="section-title">原料</text>
        <view class="ingredient-list">
          <view class="ingredient-row" v-for="(item, i) in recipe.ingredients" :key="i">
            <view class="ingredient-left">
              <text class="ingredient-dot">●</text>
              <text class="ingredient-name">{{ item.name }}</text>
            </view>
            <text class="ingredient-amount">{{ item.amount }}</text>
          </view>
        </view>
      </view>

      <!-- 分隔线 -->
      <view class="divider" />

      <!-- 步骤 -->
      <view class="section" v-if="recipe.steps && recipe.steps.length">
        <text class="section-title">做法</text>
        <view class="step-list">
          <view class="step-item" v-for="(step, i) in recipe.steps" :key="i">
            <view class="step-header">
              <view class="step-num">
                <text class="step-num-text">{{ i + 1 }}</text>
              </view>
              <text class="step-label">步骤 {{ i + 1 }}</text>
            </view>
            <image
              v-if="step.image"
              class="step-image"
              :src="formatImageUrl(step.image)"
              mode="aspectFill"
            />
            <text class="step-text">{{ step.content }}</text>
          </view>
        </view>
      </view>

      <!-- 小贴士 -->
      <view class="tips-box" v-if="recipe.tips">
        <text class="tips-icon">💡</text>
        <view class="tips-content">
          <text class="tips-title">小贴士</text>
          <text class="tips-text">{{ recipe.tips }}</text>
        </view>
      </view>

      <!-- 作者信息 -->
      <view class="author-row" v-if="recipe.createdBy">
        <text class="author-label">创建者：{{ recipe.createdBy.nickname || '匿名' }}</text>
        <text class="shared-tag" v-if="recipe.isShared">已分享</text>
      </view>

      <!-- 底部占位 -->
      <view style="height: 160rpx;" />
    </view>

    <!-- 底部操作 -->
    <view class="bottom-bar">
      <view class="bottom-btns">
        <view class="copy-btn" v-if="!isCreator && recipe.isShared" @click="handleCopy">
          <text class="copy-btn-text">📥 添加到我的菜谱</text>
        </view>
        <view class="order-btn" @click="showMealPicker">
          <text class="order-btn-text">🍽 点这道菜</text>
        </view>
      </view>
    </view>

    <!-- 餐次选择 -->
    <view class="meal-mask" v-if="mealPickerVisible" @click="mealPickerVisible = false">
      <view class="meal-sheet" @click.stop>
        <text class="meal-title">选择餐次</text>
        <view class="meal-options">
          <view class="meal-btn" @click="selectMeal('breakfast')">
            <text class="meal-emoji">🌅</text>
            <text class="meal-name">早餐</text>
          </view>
          <view class="meal-btn" @click="selectMeal('lunch')">
            <text class="meal-emoji">☀️</text>
            <text class="meal-name">午餐</text>
          </view>
          <view class="meal-btn" @click="selectMeal('dinner')">
            <text class="meal-emoji">🌙</text>
            <text class="meal-name">晚餐</text>
          </view>
        </view>
        <view class="meal-cancel" @click="mealPickerVisible = false">
          <text class="meal-cancel-text">取消</text>
        </view>
      </view>
    </view>

    <Toast ref="toast" />
  </view>
</template>

<script>
import { getRecipeDetail, copyRecipe, deleteRecipe } from '@/api/recipe'
import { addOrderItem } from '@/api/order'
import { useUserStore } from '@/store/user'
import { difficultyText, cookTimeText, getToday } from '@/utils/format'
import { getImageUrl } from '@/api/request'
import { setToastRef } from '@/utils/toast'
import Toast from '@/components/Toast.vue'

export default {
  components: { Toast },
  data() {
    return {
      id: '',
      recipe: {},
      statusBarHeight: 0,
      mealPickerVisible: false
    }
  },
  computed: {
    coverUrl() {
      return this.formatImageUrl(this.recipe.cover)
    },
    difficultyLabel() {
      return difficultyText(this.recipe.difficulty)
    },
    isCreator() {
      const userStore = useUserStore()
      if (!userStore.userId || !this.recipe.createdBy) return false
      const creatorId = typeof this.recipe.createdBy === 'object' ? this.recipe.createdBy._id : this.recipe.createdBy
      return userStore.userId === creatorId
    }
  },
  onLoad(options) {
    this.id = options.id
    const sysInfo = uni.getSystemInfoSync()
    this.statusBarHeight = sysInfo.statusBarHeight || 44
    this.$nextTick(() => setToastRef(this.$refs.toast))
    this.loadDetail()
  },
  methods: {
    async loadDetail() {
      if (!this.id) return
      try {
        this.recipe = await getRecipeDetail(this.id) || {}
      } catch (e) {
        this.$refs.toast.show({ message: '加载失败', type: 'error' })
      }
    },
    formatImageUrl(url) {
      if (!url) return '/static/images/default-cover.png'
      return getImageUrl(url)
    },
    goBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) uni.navigateBack()
      else uni.switchTab({ url: '/pages/index/index' })
    },
    goEdit() {
      uni.navigateTo({ url: `/pages/recipe-edit/index?id=${this.id}` })
    },
    handleDelete() {
      uni.showModal({
        title: '确认删除',
        content: '删除后不可恢复，确定要删除这道菜谱吗？',
        confirmColor: '#E74C3C',
        success: async (res) => {
          if (res.confirm) {
            try {
              this.$refs.toast.loading('删除中...')
              await deleteRecipe(this.id)
              this.$refs.toast.show({ message: '已删除', type: 'success' })
              setTimeout(() => {
                uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/index/index' }) })
              }, 1000)
            } catch (e) {
              this.$refs.toast.show({ message: '删除失败', type: 'error' })
            }
          }
        }
      })
    },
    showMealPicker() {
      this.mealPickerVisible = true
    },
    async selectMeal(mealType) {
      this.mealPickerVisible = false
      try {
        await addOrderItem({ recipeId: this.id, mealType, date: getToday() })
        this.$refs.toast.show({ message: '已加入菜单', type: 'success' })
      } catch (e) {}
    },
    async handleCopy() {
      try {
        this.$refs.toast.loading('添加中...')
        const newRecipe = await copyRecipe(this.id)
        this.$refs.toast.show({ message: '已添加到我的菜谱', type: 'success' })
        setTimeout(() => {
          uni.redirectTo({ url: `/pages/recipe-detail/index?id=${newRecipe._id}` })
        }, 1500)
      } catch (e) {
        this.$refs.toast.show({ message: '添加失败', type: 'error' })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.detail-page {
  min-height: 100vh;
  background: #FFFFFF;
}

/* 导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 24rpx;
  padding-right: 24rpx;
  padding-bottom: 16rpx;
  background: #fff;
}
.nav-back {
  width: 56rpx; height: 56rpx;
  display: flex; align-items: center; justify-content: center;
}
.back-icon { font-size: 56rpx; color: #333; font-weight: 300; line-height: 1; }
.nav-title { font-size: 34rpx; font-weight: 700; color: #1A1A1A; }
.nav-actions { min-width: 56rpx; display: flex; align-items: center; gap: 12rpx; }
.action-btn {
  display: flex; align-items: center; gap: 6rpx;
  padding: 8rpx 20rpx; background: #F5F5F5; border-radius: 24rpx;
}
.action-icon { font-size: 24rpx; }
.action-text { font-size: 24rpx; color: #666; }
.action-btn--delete {
  background: rgba(231, 76, 60, 0.1);
  .action-text { color: #E74C3C; }
}

/* 封面图 */
.cover-wrap {
  position: relative;
  margin: 0 32rpx;
  border-radius: 28rpx;
  overflow: hidden;
}
.cover-image {
  width: 100%;
  height: 440rpx;
}
.cover-category {
  position: absolute;
  top: 24rpx;
  left: 24rpx;
  padding: 10rpx 24rpx;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 20rpx;
}
.cover-category-text { font-size: 24rpx; color: #fff; font-weight: 500; }

/* 内容区 */
.content {
  padding: 36rpx 32rpx 0;
}

.recipe-title {
  display: block;
  font-size: 42rpx;
  font-weight: 800;
  color: #1A1A1A;
  line-height: 1.35;
  margin-bottom: 16rpx;
}

.recipe-desc {
  display: block;
  font-size: 28rpx;
  color: #888;
  line-height: 1.75;
  margin-bottom: 20rpx;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 28rpx;
}
.tag-item {
  padding: 8rpx 20rpx;
  background: #F5F5F5;
  border-radius: 20rpx;
}
.tag-text { font-size: 24rpx; color: #1A1A1A; }

/* 信息行 — 参考设计稿 */
.info-row {
  display: flex;
  gap: 48rpx;
  padding: 24rpx 0;
}
.info-item { display: flex; align-items: center; gap: 12rpx; }
.info-icon { font-size: 32rpx; }
.info-detail { display: flex; align-items: baseline; gap: 4rpx; }
.info-value { font-size: 32rpx; font-weight: 700; color: #1A1A1A; }
.info-unit { font-size: 22rpx; color: #999; }

.divider {
  height: 1rpx;
  background: #F0F0F0;
  margin: 20rpx 0 32rpx;
}

/* 通用 section */
.section { margin-bottom: 12rpx; }
.section-title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: #1A1A1A;
  margin-bottom: 28rpx;
}

/* 原料列表 — 参考设计稿的左右对齐 */
.ingredient-list { padding: 0 8rpx; }
.ingredient-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #F8F8F8;

  &:last-child { border-bottom: none; }
}
.ingredient-left { display: flex; align-items: center; gap: 16rpx; }
.ingredient-dot { font-size: 14rpx; color: #1A1A1A; }
.ingredient-name { font-size: 30rpx; color: #333; }
.ingredient-amount { font-size: 30rpx; color: #999; text-align: right; }

/* 步骤 */
.step-list { padding: 0; }
.step-item {
  margin-bottom: 40rpx;
  &:last-child { margin-bottom: 0; }
}
.step-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
}
.step-num {
  width: 48rpx; height: 48rpx;
  border-radius: 50%;
  background: #1A1A1A;
  display: flex; align-items: center; justify-content: center;
}
.step-num-text { font-size: 26rpx; color: #fff; font-weight: 700; }
.step-label { font-size: 28rpx; font-weight: 600; color: #333; }
.step-image {
  width: 100%;
  height: 360rpx;
  border-radius: 20rpx;
  margin-bottom: 16rpx;
}
.step-text {
  display: block;
  font-size: 28rpx;
  color: #555;
  line-height: 1.8;
}

/* 小贴士 */
.tips-box {
  display: flex;
  gap: 16rpx;
  padding: 28rpx 24rpx;
  background: #FFFBF0;
  border-radius: 20rpx;
  margin-top: 36rpx;
  border: 1rpx solid #FFF0D6;
}
.tips-icon { font-size: 36rpx; flex-shrink: 0; margin-top: 4rpx; }
.tips-content { flex: 1; }
.tips-title { display: block; font-size: 28rpx; font-weight: 700; color: #333; margin-bottom: 8rpx; }
.tips-text { display: block; font-size: 26rpx; color: #888; line-height: 1.7; }

/* 作者 */
.author-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 32rpx;
  padding: 24rpx 0;
  border-top: 1rpx solid #F0F0F0;
}
.author-label { font-size: 24rpx; color: #BFBFBF; }
.shared-tag {
  font-size: 22rpx; color: #2EC4B6;
  padding: 4rpx 16rpx; background: rgba(46,196,182,0.1);
  border-radius: 12rpx;
}

/* 底部操作 */
.bottom-bar {
  position: fixed;
  left: 0; right: 0; bottom: 0; z-index: 200;
  background: rgba(255,255,255,0.96);
  backdrop-filter: blur(20px);
  padding: 16rpx 32rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2rpx 16rpx rgba(0,0,0,0.06);
}
.bottom-btns {
  display: flex;
  gap: 16rpx;
}
.copy-btn {
  flex: 1;
  height: 96rpx;
  border-radius: 48rpx;
  background: #FFFFFF;
  border: 2rpx solid #1A1A1A;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active { opacity: 0.7; }
}
.copy-btn-text { font-size: 28rpx; color: #1A1A1A; font-weight: 600; }
.order-btn {
  flex: 1;
  height: 96rpx;
  border-radius: 48rpx;
  background: linear-gradient(135deg, #1A1A1A, #333333);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 28rpx rgba(0, 0, 0, 0.2);

  &:active { opacity: 0.9; transform: scale(0.98); }
}
.order-btn-text { font-size: 32rpx; color: #fff; font-weight: 700; }

/* 餐次弹窗 */
.meal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 500;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: flex-end;
}
.meal-sheet {
  width: 100%;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 40rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}
.meal-title {
  display: block;
  text-align: center;
  font-size: 32rpx; font-weight: 700; color: #1A1A1A;
  margin-bottom: 36rpx;
}
.meal-options {
  display: flex;
  justify-content: space-around;
  margin-bottom: 32rpx;
}
.meal-btn {
  display: flex; flex-direction: column; align-items: center; gap: 12rpx;
  padding: 32rpx 48rpx; border-radius: 24rpx; background: #F8F8F8;

  &:active { background: #FFF5F0; }
}
.meal-emoji { font-size: 52rpx; }
.meal-name { font-size: 28rpx; color: #333; font-weight: 600; }
.meal-cancel {
  padding: 24rpx;
  text-align: center;
  border-top: 1rpx solid #F0F0F0;
}
.meal-cancel-text { font-size: 30rpx; color: #999; }
</style>
