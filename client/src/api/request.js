import { getUser } from '@/utils/storage'

const SERVER_HOST = 'https://recipe-app-ws7n.onrender.com'
const BASE_URL = SERVER_HOST + '/api'

// 导出给其他文件用的图片URL前缀
export const getImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http') || path.startsWith('blob') || path.startsWith('/tmp') || path.startsWith('wxfile')) return path
  return SERVER_HOST + path
}

const request = (options) => {
  return new Promise((resolve, reject) => {
    const user = getUser()
    const header = { ...options.header }
    if (user && user._id) {
      header['x-user-id'] = user._id
    }

    uni.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header,
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data.data)
        } else if (res.statusCode === 401) {
          uni.navigateTo({ url: '/pages/login/index' })
          reject(new Error('请先登录'))
        } else {
          uni.showToast({ title: res.data.message || '请求失败', icon: 'none' })
          reject(new Error(res.data.message))
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络连接失败', icon: 'none' })
        reject(err)
      }
    })
  })
}

export const get = (url, data) => request({ url, method: 'GET', data })
export const post = (url, data) => request({ url, method: 'POST', data })
export const put = (url, data) => request({ url, method: 'PUT', data })
export const del = (url, data) => request({ url, method: 'DELETE', data })

// 图片上传
export const uploadImage = (filePath, type = 'covers') => {
  return new Promise((resolve, reject) => {
    const user = getUser()
    uni.uploadFile({
      url: `${BASE_URL}/upload/image?type=${type}`,
      filePath,
      name: 'file',
      header: user ? { 'x-user-id': user._id } : {},
      success: (res) => {
        const data = JSON.parse(res.data)
        if (data.code === 0) {
          resolve(data.data)
        } else {
          reject(new Error(data.message))
        }
      },
      fail: reject
    })
  })
}

export default { get, post, put, del, uploadImage }
