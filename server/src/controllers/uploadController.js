const { v2: cloudinary } = require('cloudinary')
const { success, error } = require('../utils/response')
const { useCloudinary } = require('../middleware/upload')
const config = require('../config')

if (useCloudinary) {
  cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret
  })
}

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return error(res, '请选择图片', -1, 400)

    if (useCloudinary) {
      const type = req.query.type || 'covers'
      // 用 buffer 上传到 Cloudinary
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `recipe-app/${type}`,
            transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }]
          },
          (err, result) => {
            if (err) reject(err)
            else resolve(result)
          }
        )
        stream.end(req.file.buffer)
      })
      success(res, { url: result.secure_url, filename: result.public_id })
    } else {
      const type = req.query.type || 'covers'
      const url = `/uploads/${type}/${req.file.filename}`
      success(res, { url, filename: req.file.filename })
    }
  } catch (err) {
    error(res, err.message)
  }
}
