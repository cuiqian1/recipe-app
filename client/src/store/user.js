import { defineStore } from 'pinia'
import { getUser as getStoredUser, setUser as storeUser, removeUser } from '@/utils/storage'
import { login as apiLogin } from '@/api/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: getStoredUser()
  }),
  getters: {
    isLoggedIn: (state) => !!state.user,
    userId: (state) => state.user?._id,
    nickname: (state) => state.user?.nickname || ''
  },
  actions: {
    async login(nickname) {
      const user = await apiLogin(nickname)
      this.user = user
      storeUser(user)
      return user
    },
    logout() {
      this.user = null
      removeUser()
    }
  }
})
