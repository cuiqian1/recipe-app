const STORAGE_KEY_USER = 'recipe_app_user'

export const getUser = () => {
  try {
    const data = uni.getStorageSync(STORAGE_KEY_USER)
    return data ? JSON.parse(data) : null
  } catch (e) {
    return null
  }
}

export const setUser = (user) => {
  uni.setStorageSync(STORAGE_KEY_USER, JSON.stringify(user))
}

export const removeUser = () => {
  uni.removeStorageSync(STORAGE_KEY_USER)
}
