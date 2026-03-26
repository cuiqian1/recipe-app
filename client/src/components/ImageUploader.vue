<template>
  <view class="image-uploader" @click="chooseImage">
    <image v-if="value" class="preview" :src="previewUrl" mode="aspectFill" />
    <view v-else class="placeholder">
      <text class="plus">+</text>
      <text class="hint">{{ hint }}</text>
    </view>
    <view v-if="value" class="remove-btn" @click.stop="remove">×</view>
  </view>
</template>

<script>
import { uploadImage, getImageUrl } from '@/api/request'

export default {
  name: 'ImageUploader',
  props: {
    value: { type: String, default: '' },
    type: { type: String, default: 'covers' },
    hint: { type: String, default: '上传图片' }
  },
  emits: ['update:value', 'change'],
  computed: {
    previewUrl() {
      if (!this.value) return ''
      return getImageUrl(this.value)
    }
  },
  methods: {
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          const tempPath = res.tempFilePaths[0]
          uni.showLoading({ title: '上传中...' })
          try {
            const data = await uploadImage(tempPath, this.type)
            this.$emit('update:value', data.url)
            this.$emit('change', data.url)
          } catch (e) {
            uni.showToast({ title: '上传失败', icon: 'none' })
          } finally {
            uni.hideLoading()
          }
        }
      })
    },
    remove() {
      this.$emit('update:value', '')
      this.$emit('change', '')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.image-uploader {
  position: relative;
  width: 100%;
  height: 360rpx;
  border-radius: $radius-lg;
  overflow: hidden;
  background: #f5f5f5;
}

.preview {
  width: 100%;
  height: 100%;
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed $border;
  border-radius: $radius-lg;

  .plus {
    font-size: 80rpx;
    color: $text-hint;
    line-height: 1;
  }

  .hint {
    font-size: $font-caption;
    color: $text-hint;
    margin-top: 12rpx;
  }
}

.remove-btn {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  width: 48rpx;
  height: 48rpx;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}
</style>
