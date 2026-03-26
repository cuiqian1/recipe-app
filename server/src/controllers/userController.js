const User = require('../models/User')
const { success, error } = require('../utils/response')

// 登录/注册（输入昵称，存在则登录，不存在则创建）
exports.login = async (req, res) => {
  try {
    const { nickname } = req.body
    if (!nickname || !nickname.trim()) {
      return error(res, '请输入昵称', -1, 400)
    }
    let user = await User.findOne({ nickname: nickname.trim() })
    if (!user) {
      user = await User.create({ nickname: nickname.trim() })
    }
    success(res, user)
  } catch (err) {
    error(res, err.message)
  }
}

// 获取所有用户
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: 1 })
    success(res, users)
  } catch (err) {
    error(res, err.message)
  }
}

// 更新用户
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!user) return error(res, '用户不存在', -1, 404)
    success(res, user)
  } catch (err) {
    error(res, err.message)
  }
}
