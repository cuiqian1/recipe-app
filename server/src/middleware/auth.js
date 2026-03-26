// 简单身份识别中间件：从请求头获取用户ID
const auth = (req, res, next) => {
  const userId = req.headers['x-user-id']
  if (!userId) {
    return res.status(401).json({ code: -1, message: '请先登录', data: null })
  }
  req.userId = userId
  next()
}

// 可选身份识别：有就带上，没有也放行
const optionalAuth = (req, res, next) => {
  req.userId = req.headers['x-user-id'] || null
  next()
}

module.exports = { auth, optionalAuth }
