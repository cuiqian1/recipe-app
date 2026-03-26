const Recipe = require('../models/Recipe')
const { success, error, paginate } = require('../utils/response')

// 菜谱列表（分页、搜索、筛选）
exports.getList = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, categoryId, keyword, difficulty, tag } = req.query
    const query = {}

    // 只能看自己的 + 被分享的
    if (req.userId) {
      query.$or = [{ createdBy: req.userId }, { isShared: true }]
    }
    if (categoryId) query.categoryId = categoryId
    if (difficulty) query.difficulty = Number(difficulty)
    if (tag) query.tags = tag
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { tags: { $regex: keyword, $options: 'i' } }
      ]
      // 如果同时有用户过滤，需要合并条件
      if (req.userId) {
        query.$and = [
          { $or: [{ createdBy: req.userId }, { isShared: true }] },
          { $or: [{ title: { $regex: keyword, $options: 'i' } }, { tags: { $regex: keyword, $options: 'i' } }] }
        ]
        delete query.$or
      }
    }

    const skip = (Number(page) - 1) * Number(pageSize)
    const [list, total] = await Promise.all([
      Recipe.find(query)
        .populate('categoryId', 'name icon')
        .populate('createdBy', 'nickname avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(pageSize)),
      Recipe.countDocuments(query)
    ])

    paginate(res, { list, total, page: Number(page), pageSize: Number(pageSize) })
  } catch (err) {
    error(res, err.message)
  }
}

// 菜谱详情
exports.getDetail = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('categoryId', 'name icon')
      .populate('createdBy', 'nickname avatar')
    if (!recipe) return error(res, '菜谱不存在', -1, 404)
    success(res, recipe)
  } catch (err) {
    error(res, err.message)
  }
}

// 创建菜谱
exports.create = async (req, res) => {
  try {
    const recipe = await Recipe.create({ ...req.body, createdBy: req.userId })
    success(res, recipe)
  } catch (err) {
    error(res, err.message)
  }
}

// 编辑菜谱（只能编辑自己的）
exports.update = async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ _id: req.params.id, createdBy: req.userId })
    if (!recipe) return error(res, '菜谱不存在或无权编辑', -1, 404)
    Object.assign(recipe, req.body)
    await recipe.save()
    success(res, recipe)
  } catch (err) {
    error(res, err.message)
  }
}

// 删除菜谱（只能删除自己的）
exports.remove = async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndDelete({ _id: req.params.id, createdBy: req.userId })
    if (!recipe) return error(res, '菜谱不存在或无权删除', -1, 404)
    success(res, null, '删除成功')
  } catch (err) {
    error(res, err.message)
  }
}

// 复制菜谱到自己名下
exports.copy = async (req, res) => {
  try {
    const source = await Recipe.findById(req.params.id)
    if (!source) return error(res, '菜谱不存在', -1, 404)
    const data = source.toObject()
    delete data._id
    delete data.__v
    delete data.createdAt
    delete data.updatedAt
    data.createdBy = req.userId
    data.isShared = false
    data.favoriteCount = 0
    const newRecipe = await Recipe.create(data)
    success(res, newRecipe)
  } catch (err) {
    error(res, err.message)
  }
}

// 随机推荐
exports.getRandom = async (req, res) => {
  try {
    const query = req.userId
      ? { $or: [{ createdBy: req.userId }, { isShared: true }] }
      : {}
    const count = await Recipe.countDocuments(query)
    const size = Math.min(Number(req.query.size) || 6, count)
    const recipes = await Recipe.aggregate([
      { $match: query },
      { $sample: { size } }
    ])
    await Recipe.populate(recipes, [
      { path: 'categoryId', select: 'name icon' },
      { path: 'createdBy', select: 'nickname avatar' }
    ])
    success(res, recipes)
  } catch (err) {
    error(res, err.message)
  }
}

// 热门菜谱
exports.getHot = async (req, res) => {
  try {
    const query = req.userId
      ? { $or: [{ createdBy: req.userId }, { isShared: true }] }
      : {}
    const recipes = await Recipe.find(query)
      .populate('categoryId', 'name icon')
      .populate('createdBy', 'nickname avatar')
      .sort({ favoriteCount: -1 })
      .limit(Number(req.query.size) || 10)
    success(res, recipes)
  } catch (err) {
    error(res, err.message)
  }
}
