<template>
  <view class="edit-page">
    <!-- 顶部导航 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-back" @click="goBack">
        <text class="nav-back-arrow">&#x2190;</text>
      </view>
      <text class="nav-title">{{ isEdit ? '编辑菜谱' : '创建菜谱' }}</text>
      <view class="nav-placeholder" />
    </view>

    <!-- 表单主体 -->
    <view class="form-body">

      <!-- 封面图上传 -->
      <view class="section">
        <view class="section-label">
          <text class="label-text">封面图片</text>
        </view>
        <ImageUploader v-model:value="form.cover" type="covers" hint="上传封面图" />
      </view>

      <!-- 基本信息 -->
      <view class="section">
        <view class="section-label">
          <text class="label-text">基本信息</text>
        </view>

        <!-- 标题 -->
        <view class="field">
          <text class="field-label">菜谱名称 <text class="required">*</text></text>
          <input
            class="field-input"
            v-model="form.title"
            placeholder="给你的菜谱起个名字"
            placeholder-class="input-placeholder"
            maxlength="50"
          />
        </view>

        <!-- 分类 -->
        <view class="field">
          <text class="field-label">分类</text>
          <picker :range="categoryNames" @change="onCategoryChange">
            <view class="picker-value">
              <text :class="['picker-text', !selectedCategoryName && 'picker-placeholder']">
                {{ selectedCategoryName || '选择分类' }}
              </text>
              <text class="picker-arrow">&#x203A;</text>
            </view>
          </picker>
        </view>

        <!-- 描述 -->
        <view class="field">
          <text class="field-label">简介</text>
          <textarea
            class="field-textarea"
            v-model="form.description"
            placeholder="简单描述一下这道菜..."
            placeholder-class="input-placeholder"
            maxlength="500"
            :auto-height="true"
          />
        </view>

        <!-- 难度 -->
        <view class="field">
          <text class="field-label">难度</text>
          <view class="difficulty-row">
            <view
              v-for="item in difficultyOptions"
              :key="item.value"
              :class="['diff-btn', form.difficulty === item.value && 'diff-btn--active']"
              :style="form.difficulty === item.value ? { background: item.activeColor, borderColor: item.activeColor } : {}"
              @click="form.difficulty = item.value"
            >
              <text
                :class="['diff-btn-text', form.difficulty === item.value && 'diff-btn-text--active']"
              >{{ item.label }}</text>
            </view>
          </view>
        </view>

        <!-- 烹饪时间 & 份量 -->
        <view class="inline-fields">
          <view class="inline-field">
            <text class="field-label">烹饪时间(分钟)</text>
            <input
              class="field-input"
              type="number"
              v-model="form.cookTime"
              placeholder="30"
              placeholder-class="input-placeholder"
            />
          </view>
          <view class="inline-field">
            <text class="field-label">份量(人份)</text>
            <input
              class="field-input"
              type="number"
              v-model="form.servings"
              placeholder="2"
              placeholder-class="input-placeholder"
            />
          </view>
        </view>
      </view>

      <!-- 食材 -->
      <view class="section">
        <view class="section-label">
          <text class="label-text">食材准备 <text class="required">*</text></text>
        </view>

        <view class="ingredient-list">
          <view
            class="ingredient-row"
            v-for="(item, index) in form.ingredients"
            :key="index"
          >
            <input
              class="ingredient-name"
              v-model="item.name"
              placeholder="食材名"
              placeholder-class="input-placeholder"
            />
            <input
              class="ingredient-amount"
              v-model="item.amount"
              placeholder="用量"
              placeholder-class="input-placeholder"
            />
            <view
              class="row-delete"
              v-if="form.ingredients.length > 1"
              @click="removeIngredient(index)"
            >
              <text class="row-delete-text">&#xD7;</text>
            </view>
          </view>
        </view>

        <view class="add-row" @click="addIngredient">
          <text class="add-row-text">+ 添加食材</text>
        </view>
      </view>

      <!-- 步骤 -->
      <view class="section">
        <view class="section-label">
          <text class="label-text">烹饪步骤 <text class="required">*</text></text>
        </view>

        <view class="step-list">
          <view
            class="step-card"
            v-for="(step, index) in form.steps"
            :key="index"
          >
            <view class="step-header">
              <view class="step-number">
                <text class="step-number-text">{{ index + 1 }}</text>
              </view>
              <text class="step-title">步骤 {{ index + 1 }}</text>
              <view
                class="row-delete"
                v-if="form.steps.length > 1"
                @click="removeStep(index)"
              >
                <text class="row-delete-text">&#xD7;</text>
              </view>
            </view>

            <textarea
              class="step-textarea"
              v-model="step.content"
              placeholder="描述这一步的操作..."
              placeholder-class="input-placeholder"
              :auto-height="true"
            />

            <view class="step-image-wrap">
              <ImageUploader
                v-model:value="step.image"
                type="steps"
                hint="上传步骤图(可选)"
              />
            </view>
          </view>
        </view>

        <view class="add-row" @click="addStep">
          <text class="add-row-text">+ 添加步骤</text>
        </view>
      </view>

      <!-- 标签 & 小贴士 -->
      <view class="section">
        <view class="section-label">
          <text class="label-text">标签与小贴士</text>
        </view>

        <!-- 标签输入 -->
        <view class="field">
          <text class="field-label">标签</text>
          <view class="tags-wrap">
            <view class="tags-list" v-if="form.tags.length">
              <view
                class="tag-capsule"
                v-for="(tag, index) in form.tags"
                :key="index"
                @click="removeTag(index)"
              >
                <text class="tag-capsule-text">{{ tag }}</text>
                <text class="tag-capsule-close">&#xD7;</text>
              </view>
            </view>
            <input
              class="tag-input"
              v-model="tagInput"
              placeholder="输入标签后按回车添加"
              placeholder-class="input-placeholder"
              @confirm="addTag"
            />
          </view>
        </view>

        <!-- 分享开关 -->
        <view class="field share-field">
          <text class="field-label">分享给好友</text>
          <switch
            :checked="form.isShared"
            color="#1A1A1A"
            @change="form.isShared = $event.detail.value"
          />
        </view>

        <!-- 小贴士 -->
        <view class="field">
          <text class="field-label">小贴士</text>
          <textarea
            class="field-textarea"
            v-model="form.tips"
            placeholder="分享一些烹饪小技巧..."
            placeholder-class="input-placeholder"
            maxlength="500"
            :auto-height="true"
          />
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-placeholder" />
    </view>

    <!-- 固定底部提交按钮 -->
    <view class="submit-bar">
      <view class="submit-btn" :class="{ 'submit-btn--disabled': submitting }" @click="handleSubmit">
        <text class="submit-btn-text">{{ isEdit ? '保存修改' : '发布菜谱' }}</text>
      </view>
    </view>

    <Toast ref="toast" />
  </view>
</template>

<script>
import { createRecipe, updateRecipe, getRecipeDetail } from '@/api/recipe'
import { getCategories } from '@/api/category'
import ImageUploader from '@/components/ImageUploader.vue'
import Toast from '@/components/Toast.vue'

export default {
  components: { ImageUploader, Toast },
  data() {
    return {
      statusBarHeight: 0,
      isEdit: false,
      recipeId: '',
      submitting: false,
      tagInput: '',
      categories: [],
      difficultyOptions: [
        { label: '简单', value: 1, activeColor: '#00B894' },
        { label: '中等', value: 2, activeColor: '#FDCB6E' },
        { label: '困难', value: 3, activeColor: '#E17055' }
      ],
      form: {
        title: '',
        description: '',
        cover: '',
        categoryId: '',
        difficulty: 1,
        cookTime: 30,
        servings: 2,
        ingredients: [{ name: '', amount: '' }],
        steps: [{ order: 1, content: '', image: '' }],
        tags: [],
        tips: '',
        isShared: false
      }
    }
  },
  computed: {
    categoryNames() {
      return this.categories.map(c => c.name)
    },
    selectedCategoryName() {
      const cat = this.categories.find(c => c._id === this.form.categoryId)
      return cat ? cat.name : ''
    }
  },
  onLoad(options) {
    const sysInfo = uni.getSystemInfoSync()
    this.statusBarHeight = sysInfo.statusBarHeight || 44
    this.loadCategories()

    if (options.id) {
      this.isEdit = true
      this.recipeId = options.id
      this.loadRecipe(options.id)
    }
  },
  methods: {
    goBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
      } else {
        uni.switchTab({ url: '/pages/index/index' })
      }
    },

    async loadCategories() {
      try {
        const res = await getCategories()
        this.categories = res || []
      } catch (e) {
        console.error('加载分类失败', e)
      }
    },

    async loadRecipe(id) {
      try {
        this.$refs.toast.loading('加载中...')
        const res = await getRecipeDetail(id)
        this.$refs.toast.hide()
        if (res) {
          this.form.title = res.title || ''
          this.form.description = res.description || ''
          this.form.cover = res.coverImage || res.cover || ''
          this.form.categoryId = res.categoryId || ''
          this.form.difficulty = res.difficulty || 1
          this.form.cookTime = res.cookTime || 30
          this.form.servings = res.servings || 2
          this.form.tips = res.tips || ''
          this.form.isShared = !!res.isShared
          this.form.tags = Array.isArray(res.tags) ? [...res.tags] : []

          if (Array.isArray(res.ingredients) && res.ingredients.length) {
            this.form.ingredients = res.ingredients.map(item => ({
              name: item.name || '',
              amount: item.amount || ''
            }))
          }

          if (Array.isArray(res.steps) && res.steps.length) {
            this.form.steps = res.steps.map((step, i) => ({
              order: i + 1,
              content: step.content || step.text || step.description || '',
              image: step.image || ''
            }))
          }
        }
      } catch (e) {
        console.error('加载菜谱失败', e)
        this.$refs.toast.show({ message: '加载失败', type: 'error' })
      } finally {
        this.$refs.toast.hide()
      }
    },

    onCategoryChange(e) {
      const index = e.detail.value
      this.form.categoryId = this.categories[index]._id
    },

    // 食材操作
    addIngredient() {
      this.form.ingredients.push({ name: '', amount: '' })
    },
    removeIngredient(index) {
      this.form.ingredients.splice(index, 1)
    },

    // 步骤操作
    addStep() {
      this.form.steps.push({
        order: this.form.steps.length + 1,
        content: '',
        image: ''
      })
    },
    removeStep(index) {
      this.form.steps.splice(index, 1)
      // 重排序号
      this.form.steps.forEach((step, i) => {
        step.order = i + 1
      })
    },

    // 标签操作
    addTag() {
      const tag = this.tagInput.trim()
      if (tag && !this.form.tags.includes(tag)) {
        this.form.tags.push(tag)
      }
      this.tagInput = ''
    },
    removeTag(index) {
      this.form.tags.splice(index, 1)
    },

    // 表单校验
    validate() {
      if (!this.form.title.trim()) {
        this.$refs.toast.show({ message: '请输入菜谱名称', type: 'warning' })
        return false
      }
      const validIngredients = this.form.ingredients.filter(i => i.name.trim())
      if (validIngredients.length === 0) {
        this.$refs.toast.show({ message: '请至少添加一种食材', type: 'warning' })
        return false
      }
      const validSteps = this.form.steps.filter(s => s.content.trim())
      if (validSteps.length === 0) {
        this.$refs.toast.show({ message: '请至少添加一个步骤', type: 'warning' })
        return false
      }
      return true
    },

    async handleSubmit() {
      if (this.submitting) return
      if (!this.validate()) return

      // 构建提交数据，过滤空食材和空步骤
      const data = {
        ...this.form,
        cookTime: Number(this.form.cookTime) || 0,
        servings: Number(this.form.servings) || 1,
        ingredients: this.form.ingredients.filter(i => i.name.trim()),
        steps: this.form.steps
          .filter(s => s.content.trim())
          .map((s, i) => ({ ...s, order: i + 1 }))
      }

      this.submitting = true
      try {
        this.$refs.toast.loading('保存中...')
        let res
        if (this.isEdit) {
          res = await updateRecipe(this.recipeId, data)
        } else {
          res = await createRecipe(data)
        }
        this.$refs.toast.show({ message: this.isEdit ? '修改成功' : '发布成功', type: 'success' })

        const targetId = this.isEdit ? this.recipeId : (res._id || res.id)
        setTimeout(() => {
          uni.redirectTo({
            url: `/pages/recipe-detail/index?id=${targetId}`
          })
        }, 1500)
      } catch (e) {
        console.error('保存菜谱失败', e)
        this.$refs.toast.show({ message: '保存失败，请重试', type: 'error' })
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.edit-page {
  min-height: 100vh;
  background: $bg-page;
}

/* ========== 导航栏 ========== */
.nav-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16rpx;
  padding-left: 24rpx;
  padding-right: 24rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.nav-back {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: $bg-page;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-back-arrow {
  font-size: 36rpx;
  color: $text-primary;
  font-weight: bold;
}

.nav-title {
  font-size: $font-subtitle;
  font-weight: 700;
  color: $text-primary;
}

.nav-placeholder {
  width: 64rpx;
}

/* ========== 表单主体 ========== */
.form-body {
  padding: 20rpx 24rpx 0;
}

.section {
  background: $bg-card;
  border-radius: $radius-xl;
  box-shadow: $shadow-card;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.section-label {
  margin-bottom: 28rpx;
}

.label-text {
  font-size: $font-subtitle;
  font-weight: 700;
  color: $text-primary;
}

.required {
  color: $danger;
  font-weight: 700;
}

/* ========== 表单字段 ========== */
.field {
  margin-bottom: 28rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.field-label {
  display: block;
  font-size: $font-caption;
  color: $text-secondary;
  font-weight: 600;
  margin-bottom: 12rpx;
}

.field-input {
  width: 100%;
  height: 80rpx;
  background: $bg-page;
  border: 2rpx solid $border;
  border-radius: $radius-md;
  padding: 0 24rpx;
  font-size: $font-body;
  color: $text-primary;
  box-sizing: border-box;
  transition: border-color 0.2s;

  &:focus {
    border-color: $primary;
  }
}

.field-textarea {
  width: 100%;
  min-height: 160rpx;
  background: $bg-page;
  border: 2rpx solid $border;
  border-radius: $radius-md;
  padding: 20rpx 24rpx;
  font-size: $font-body;
  color: $text-primary;
  box-sizing: border-box;
  line-height: 1.6;
}

.input-placeholder {
  color: $text-hint;
}

/* ========== Picker ========== */
.picker-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80rpx;
  background: $bg-page;
  border: 2rpx solid $border;
  border-radius: $radius-md;
  padding: 0 24rpx;
}

.picker-text {
  font-size: $font-body;
  color: $text-primary;
}

.picker-placeholder {
  color: $text-hint;
}

.picker-arrow {
  font-size: 36rpx;
  color: $text-hint;
  font-weight: bold;
}

/* ========== 难度选择 ========== */
.difficulty-row {
  display: flex;
  gap: 20rpx;
}

.diff-btn {
  flex: 1;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-lg;
  background: $bg-page;
  border: 2rpx solid $border;
  transition: all 0.25s;
}

.diff-btn--active {
  border-color: transparent;
}

.diff-btn-text {
  font-size: $font-body;
  color: $text-secondary;
  font-weight: 600;
}

.diff-btn-text--active {
  color: #fff;
}

/* ========== 行内双字段 ========== */
.inline-fields {
  display: flex;
  gap: 24rpx;
}

.inline-field {
  flex: 1;
}

/* ========== 食材列表 ========== */
.ingredient-list {
  margin-bottom: 20rpx;
}

.ingredient-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.ingredient-name {
  flex: 1;
  height: 76rpx;
  background: $bg-page;
  border: 2rpx solid $border;
  border-radius: $radius-md;
  padding: 0 20rpx;
  font-size: $font-body;
  color: $text-primary;
  box-sizing: border-box;
}

.ingredient-amount {
  width: 200rpx;
  height: 76rpx;
  background: $bg-page;
  border: 2rpx solid $border;
  border-radius: $radius-md;
  padding: 0 20rpx;
  font-size: $font-body;
  color: $text-primary;
  box-sizing: border-box;
}

/* ========== 通用删除按钮 ========== */
.row-delete {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background: rgba($danger, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.row-delete-text {
  font-size: 36rpx;
  color: $danger;
  line-height: 1;
  margin-top: -2rpx;
}

/* ========== 添加按钮 ========== */
.add-row {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 76rpx;
  border: 2rpx dashed rgba($primary, 0.4);
  border-radius: $radius-md;
  background: rgba($primary, 0.03);
}

.add-row-text {
  font-size: $font-body;
  color: $primary;
  font-weight: 600;
}

/* ========== 步骤卡片 ========== */
.step-list {
  margin-bottom: 20rpx;
}

.step-card {
  background: $bg-page;
  border-radius: $radius-lg;
  padding: 24rpx;
  margin-bottom: 20rpx;
  border: 2rpx solid $border;
}

.step-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.step-number {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: $primary;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba($primary, 0.3);
}

.step-number-text {
  font-size: $font-caption;
  color: #fff;
  font-weight: 700;
}

.step-title {
  font-size: $font-body;
  color: $text-primary;
  font-weight: 600;
  flex: 1;
}

.step-textarea {
  width: 100%;
  min-height: 120rpx;
  background: $bg-card;
  border: 2rpx solid $border;
  border-radius: $radius-md;
  padding: 20rpx;
  font-size: $font-body;
  color: $text-primary;
  box-sizing: border-box;
  line-height: 1.6;
  margin-bottom: 16rpx;
}

.step-image-wrap {
  :deep(.image-uploader) {
    height: 240rpx;
  }
}

/* ========== 标签 ========== */
.tags-wrap {
  background: $bg-page;
  border: 2rpx solid $border;
  border-radius: $radius-md;
  padding: 16rpx 20rpx;
  min-height: 80rpx;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.tag-capsule {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 20rpx;
  background: rgba($primary, 0.1);
  border-radius: 100rpx;
}

.tag-capsule-text {
  font-size: $font-mini;
  color: $primary;
  font-weight: 500;
}

.tag-capsule-close {
  font-size: $font-caption;
  color: rgba($primary, 0.6);
  margin-left: 4rpx;
}

.tag-input {
  width: 100%;
  height: 52rpx;
  font-size: $font-body;
  color: $text-primary;
}

/* ========== 分享开关 ========== */
.share-field {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .field-label {
    margin-bottom: 0;
  }
}

/* ========== 底部提交 ========== */
.bottom-placeholder {
  height: 160rpx;
}

.submit-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 200;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: 16rpx 32rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.submit-btn {
  width: 100%;
  height: 92rpx;
  border-radius: $radius-xl;
  background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba($primary, 0.35);
  transition: opacity 0.2s;

  &:active {
    opacity: 0.85;
  }
}

.submit-btn--disabled {
  opacity: 0.6;
}

.submit-btn-text {
  font-size: $font-subtitle;
  color: #fff;
  font-weight: 700;
  letter-spacing: 4rpx;
}
</style>
