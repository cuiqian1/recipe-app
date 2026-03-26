<template>
  <view class="toast-mask" v-if="visible" @click.stop>
    <view class="toast-box">
      <view class="toast-spinner" v-if="isLoading" />
      <text class="toast-icon" v-else>{{ iconMap[type] }}</text>
      <text class="toast-msg">{{ message }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Toast',
  data() {
    return {
      visible: false,
      message: '',
      type: 'success',
      isLoading: false,
      timer: null,
      iconMap: {
        success: '✓',
        error: '✕',
        warning: '!',
        info: 'i'
      }
    }
  },
  methods: {
    show({ message = '', type = 'success', duration = 2000 }) {
      if (this.timer) clearTimeout(this.timer)
      this.message = message
      this.type = type
      this.isLoading = false
      this.visible = true
      this.timer = setTimeout(() => {
        this.visible = false
      }, duration)
    },
    loading(message = '加载中...') {
      if (this.timer) clearTimeout(this.timer)
      this.message = message
      this.isLoading = true
      this.visible = true
    },
    hide() {
      if (this.timer) clearTimeout(this.timer)
      this.visible = false
      this.isLoading = false
    }
  }
}
</script>

<style lang="scss" scoped>
.toast-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.toast-box {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx 40rpx;
  border-radius: 48rpx;
  background: rgba(26, 26, 26, 0.92);
  backdrop-filter: blur(20px);
  animation: toastIn 0.3s ease;
}

.toast-icon {
  font-size: 32rpx;
  font-weight: 800;
  color: #fff;
  width: 40rpx;
  height: 40rpx;
  line-height: 40rpx;
  text-align: center;
  border: 3rpx solid rgba(255,255,255,0.5);
  border-radius: 50%;
  flex-shrink: 0;
}

.toast-spinner {
  width: 36rpx;
  height: 36rpx;
  border: 4rpx solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  flex-shrink: 0;
}

.toast-msg {
  font-size: 28rpx;
  color: #fff;
  font-weight: 600;
  max-width: 400rpx;
}

@keyframes toastIn {
  0% { opacity: 0; transform: scale(0.85) translateY(20rpx); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
