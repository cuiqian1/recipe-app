<template>
  <view class="login-page">
    <view class="login-content">
      <view class="login-header">
        <text class="logo-emoji">🍳</text>
        <text class="app-name">美味菜谱</text>
        <text class="app-desc">记录美食，分享味道</text>
      </view>

      <view class="login-form">
        <view class="input-wrap">
          <input
            class="nickname-input"
            v-model="nickname"
            placeholder="输入你的昵称"
            :maxlength="10"
            @confirm="handleLogin"
          />
        </view>
        <button class="login-btn" @click="handleLogin" :disabled="!nickname.trim()">
          进入厨房
        </button>
        <view class="login-tip">
          <text class="tip-text">首次输入昵称自动创建账号，再次输入即可登录</text>
        </view>
      </view>
    </view>

    <Toast ref="toast" />
  </view>
</template>

<script>
import { useUserStore } from '@/store/user'
import Toast from '@/components/Toast.vue'

export default {
  components: { Toast },
  data() {
    return { nickname: '' }
  },
  methods: {
    async handleLogin() {
      const name = this.nickname.trim()
      if (!name) return
      try {
        this.$refs.toast.loading('登录中...')
        const userStore = useUserStore()
        await userStore.login(name)
        this.$refs.toast.hide()
        uni.switchTab({ url: '/pages/index/index' })
      } catch (e) {
        this.$refs.toast.show({ message: '登录失败', type: 'error' })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  height: 100vh;
  height: 100dvh;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-sizing: border-box;
}

.login-content {
  width: 100%;
  padding: 0 64rpx;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80rpx;

  .logo-emoji {
    font-size: 100rpx;
    margin-bottom: 24rpx;
  }

  .app-name {
    font-size: 48rpx;
    font-weight: 800;
    color: #1A1A1A;
    letter-spacing: 4rpx;
    margin-bottom: 12rpx;
  }

  .app-desc {
    font-size: 26rpx;
    color: #BFBFBF;
    letter-spacing: 2rpx;
  }
}

.login-form {
  width: 100%;
}

.input-wrap {
  margin-bottom: 32rpx;
}

.nickname-input {
  width: 100%;
  height: 96rpx;
  border: 2rpx solid #EEEEEE;
  border-radius: 48rpx;
  padding: 0 36rpx;
  font-size: 30rpx;
  text-align: center;
  color: #1A1A1A;
  background: #FAFAFA;
  box-sizing: border-box;

  &:focus {
    border-color: #1A1A1A;
    background: #fff;
  }
}

.login-btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #FFFFFF;
  background: #1A1A1A;
  border-radius: 48rpx;
  border: none;
  letter-spacing: 4rpx;

  &[disabled] {
    background: #E0E0E0;
    color: #BFBFBF;
  }

  &:active:not([disabled]) {
    background: #333;
  }
}

.login-tip {
  margin-top: 32rpx;
  text-align: center;
}

.tip-text {
  font-size: 22rpx;
  color: #BFBFBF;
}
</style>
