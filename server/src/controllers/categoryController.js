const Category = require('../models/Category')
const { success, error } = require('../utils/response')

exports.getAll = async (req, res) => {
  try {
    const categories = await Category.find().sort({ sort: 1 })
    success(res, categories)
  } catch (err) {
    error(res, err.message)
  }
}

exports.create = async (req, res) => {
  try {
    const category = await Category.create(req.body)
    success(res, category)
  } catch (err) {
    error(res, err.message)
  }
}

exports.update = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!category) return error(res, '分类不存在', -1, 404)
    success(res, category)
  } catch (err) {
    error(res, err.message)
  }
}

exports.remove = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id)
    if (!category) return error(res, '分类不存在', -1, 404)
    success(res, null, '删除成功')
  } catch (err) {
    error(res, err.message)
  }
}
