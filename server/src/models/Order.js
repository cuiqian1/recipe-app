const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
  recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
  orderedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderedAt: { type: Date, default: Date.now }
}, { _id: false })

const orderSchema = new mongoose.Schema({
  date: { type: String, required: true },
  mealType: { type: String, required: true, enum: ['breakfast', 'lunch', 'dinner'] },
  items: [orderItemSchema],
  status: { type: String, default: 'ordering', enum: ['ordering', 'confirmed', 'done'] }
}, { timestamps: true })

orderSchema.index({ date: 1, mealType: 1 }, { unique: true })

module.exports = mongoose.model('Order', orderSchema)
