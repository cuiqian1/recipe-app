// 统一响应格式
const success = (res, data = null, message = 'success') => {
  res.json({ code: 0, message, data })
}

const error = (res, message = '服务器错误', code = -1, status = 500) => {
  res.status(status).json({ code, message, data: null })
}

const paginate = (res, { list, total, page, pageSize }) => {
  res.json({
    code: 0,
    message: 'success',
    data: { list, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  })
}

module.exports = { success, error, paginate }
