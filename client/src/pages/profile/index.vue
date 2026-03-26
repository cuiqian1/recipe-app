<template>
  <view class="profile-page">
    <!-- 用户信息 -->
    <view class="profile-header">
      <view class="avatar-wrap">
        <text class="avatar-emoji">👨‍🍳</text>
      </view>
      <text class="user-name">{{ userStore.nickname || '未登录' }}</text>
    </view>

    <!-- 统计 -->
    <view class="stats-row" v-if="userStore.isLoggedIn">
      <view class="stat-item">
        <text class="stat-num">{{ myRecipeCount }}</text>
        <text class="stat-label">我的菜谱</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-num">{{ sharedCount }}</text>
        <text class="stat-label">已分享</text>
      </view>
    </view>

    <!-- 菜单 -->
    <view class="menu-list" v-if="userStore.isLoggedIn">
      <view class="menu-item" @click="goMyRecipes">
        <text class="menu-icon">📖</text>
        <text class="menu-text">我的菜谱</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goCreateRecipe">
        <text class="menu-icon">✏️</text>
        <text class="menu-text">创建新菜谱</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goHistory">
        <text class="menu-icon">📅</text>
        <text class="menu-text">历史菜单</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="showSwitchUser">
        <text class="menu-icon">🔄</text>
        <text class="menu-text">切换用户</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <view class="login-prompt" v-if="!userStore.isLoggedIn">
      <button class="login-btn" @click="goLogin">登录</button>
    </view>

    <view class="logout-wrap" v-if="userStore.isLoggedIn">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </view>
  </view>
</template>

<script>
import { useUserStore } from '@/store/user'
import { getRecipes } from '@/api/recipe'

export default {
  data() {
    return { myRecipeCount: 0, sharedCount: 0 }
  },
  computed: {
    userStore() { return useUserStore() }
  },
  onShow() {
    if (this.userStore.isLoggedIn) this.loadStats()
  },
  methods: {
    async loadStats() {
      try {
        const res = await getRecipes({ page: 1, pageSize: 1 })
        this.myRecipeCount = res.total || 0
      } catch (e) {}
    },
    goMyRecipes() { uni.navigateTo({ url: '/pages/recipe-list/index' }) },
    goCreateRecipe() { uni.navigateTo({ url: '/pages/recipe-edit/index' }) },
    goHistory() { uni.switchTab({ url: '/pages/today-menu/index' }) },
    goLogin() { uni.navigateTo({ url: '/pages/login/index' }) },
    showSwitchUser() {
      this.userStore.logout()
      uni.navigateTo({ url: '/pages/login/index' })
    },
    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定退出登录？',
        success: (res) => {
          if (res.confirm) {
            this.userStore.logout()
            uni.navigateTo({ url: '/pages/login/index' })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background: #FFFFFF;
}

.profile-header {
  padding: 60rpx 0 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-wrap {
  width: 140rpx; height: 140rpx;
  background: #F5F5F5;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 20rpx;
}
.avatar-emoji { font-size: 72rpx; }
.user-name { font-size: 36rpx; font-weight: 700; color: #1A1A1A; }

.stats-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 48rpx;
  margin: 20rpx 64rpx 40rpx;
  padding: 32rpx 0;
  background: #F8F8F8;
  border-radius: 24rpx;
}
.stat-item { display: flex; flex-direction: column; align-items: center; }
.stat-num { font-size: 40rpx; font-weight: 700; color: #1A1A1A; }
.stat-label { font-size: 22rpx; color: #999; margin-top: 4rpx; }
.stat-divider { width: 1rpx; height: 48rpx; background: #E5E5E5; }

.menu-list {
  margin: 0 32rpx;
}
.menu-item {
  display: flex;
  align-items: center;
  padding: 32rpx 0;
  border-bottom: 1rpx solid #F5F5F5;

  &:last-child { border-bottom: none; }
  &:active { opacity: 0.7; }
}
.menu-icon { font-size: 36rpx; margin-right: 20rpx; }
.menu-text { flex: 1; font-size: 30rpx; color: #333; }
.menu-arrow { font-size: 32rpx; color: #DDD; }

.login-prompt { padding: 100rpx 60rpx; text-align: center; }
.login-btn {
  background: #1A1A1A; color: #fff; border: none;
  border-radius: 48rpx; height: 88rpx; line-height: 88rpx;
  font-size: 30rpx; font-weight: 600;
}

.logout-wrap { padding: 48rpx 60rpx; }
.logout-btn {
  background: transparent; color: #999; border: 2rpx solid #E5E5E5;
  border-radius: 48rpx; height: 88rpx; line-height: 88rpx;
  font-size: 28rpx;
}
</style>
