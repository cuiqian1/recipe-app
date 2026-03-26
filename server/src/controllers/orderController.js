const Order = require('../models/Order')
const Recipe = require('../models/Recipe')
const { success, error } = require('../utils/response')

// 获取指定日期菜单
exports.getByDate = async (req, res) => {
  try {
    const date = req.params.date || new Date().toISOString().slice(0, 10)
    const orders = await Order.find({ date })
      .populate('items.recipeId', 'title cover cookTime difficulty')
      .populate('items.orderedBy', 'nickname avatar')
      .sort({ mealType: 1 })
    success(res, orders)
  } catch (err) {
    error(res, err.message)
  }
}

// 获取今日菜单
exports.getToday = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10)
    const orders = await Order.find({ date: today })
      .populate('items.recipeId', 'title cover cookTime difficulty')
      .populate('items.orderedBy', 'nickname avatar')
    // 按三餐组织返回
    const meals = { breakfast: null, lunch: null, dinner: null }
    orders.forEach(o => { meals[o.mealType] = o })
    success(res, meals)
  } catch (err) {
    error(res, err.message)
  }
}

// 点菜（添加一道菜到某餐）
exports.addItem = async (req, res) => {
  try {
    const { date, mealType, recipeId } = req.body
    if (!date || !mealType || !recipeId) {
      return error(res, '参数不完整', -1, 400)
    }

    let order = await Order.findOne({ date, mealType })
    if (!order) {
      order = await Order.create({ date, mealType, items: [] })
    }

    // 避免重复点同一道菜
    const exists = order.items.some(
      item => item.recipeId.toString() === recipeId && item.orderedBy.toString() === req.userId
    )
    if (exists) return error(res, '已经点过这道菜了', -1, 400)

    order.items.push({ recipeId, orderedBy: req.userId })
    await order.save()

    // 更新菜谱被点次数
    await Recipe.findByIdAndUpdate(recipeId, { $inc: { favoriteCount: 1 } })

    await order.populate('items.recipeId', 'title cover cookTime difficulty')
    await order.populate('items.orderedBy', 'nickname avatar')
    success(res, order)
  } catch (err) {
    error(res, err.message)
  }
}

// 取消点菜
exports.removeItem = async (req, res) => {
  try {
    const { date, mealType, recipeId } = req.body
    const order = await Order.findOne({ date, mealType })
    if (!order) return error(res, '菜单不存在', -1, 404)

    const idx = order.items.findIndex(
      item => item.recipeId.toString() === recipeId && item.orderedBy.toString() === req.userId
    )
    if (idx === -1) return error(res, '未找到该点菜记录', -1, 404)

    order.items.splice(idx, 1)
    await order.save()

    await Recipe.findByIdAndUpdate(recipeId, { $inc: { favoriteCount: -1 } })
    success(res, order)
  } catch (err) {
    error(res, err.message)
  }
}

// 更新菜单状态
exports.updateStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('items.recipeId', 'title cover cookTime difficulty')
      .populate('items.orderedBy', 'nickname avatar')
    if (!order) return error(res, '菜单不存在', -1, 404)
    success(res, order)
  } catch (err) {
    error(res, err.message)
  }
}

// 历史菜单
exports.getHistory = async (req, res) => {
  try {
    const days = Number(req.query.days) || 7
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const dateStr = startDate.toISOString().slice(0, 10)

    const orders = await Order.find({ date: { $gte: dateStr } })
      .populate('items.recipeId', 'title cover')
      .populate('items.orderedBy', 'nickname')
      .sort({ date: -1, mealType: 1 })
    success(res, orders)
  } catch (err) {
    error(res, err.message)
  }
}
