const multer = require('multer')
const path = require('path')
const config = require('../config')

// 判断是否配置了 Cloudinary
const useCloudinary = !!(config.cloudinaryCloudName && config.cloudinaryCloudName !== 'your_cloud_name')

let storage

if (useCloudinary) {
  // 线上用内存缓冲，然后在 controller 里上传到 Cloudinary
  storage = multer.memoryStorage()
} else {
  // 本地存储（开发用）
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const type = req.query.type || 'covers'
      const uploadPath = path.join(__dirname, '../../uploads', type)
      cb(null, uploadPath)
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname)
      const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
      cb(null, name)
    }
  })
}

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('只支持 JPG、PNG、GIF、WebP 格式的图片'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
})

module.exports = upload
module.exports.useCloudinary = useCloudinary
