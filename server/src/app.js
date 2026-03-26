const express = require('express')
const cors = require('cors')
const path = require('path')
const config = require('./config')
const connectDB = require('./config/db')
const routes = require('./routes')

const app = express()

// 连接数据库
connectDB()

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 静态文件服务（图片访问）
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// API 路由
app.use('/api', routes)

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ code: -1, message: err.message || '服务器内部错误', data: null })
})

app.listen(config.port, () => {
  console.log(`菜谱 App 服务启动成功，端口: ${config.port}`)
})

module.exports = app
