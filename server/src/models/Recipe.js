const mongoose = require('mongoose')

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: String, required: true }
}, { _id: false })

const stepSchema = new mongoose.Schema({
  order: { type: Number, required: true },
  content: { type: String, required: true },
  image: { type: String, default: '' }
}, { _id: false })

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  cover: { type: String, default: '' },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  difficulty: { type: Number, default: 1, min: 1, max: 3 },
  cookTime: { type: Number, default: 0 },
  servings: { type: Number, default: 2 },
  ingredients: [ingredientSchema],
  steps: [stepSchema],
  tips: { type: String, default: '' },
  tags: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isShared: { type: Boolean, default: false },
  favoriteCount: { type: Number, default: 0 }
}, { timestamps: true })

recipeSchema.index({ categoryId: 1 })
recipeSchema.index({ title: 'text' })
recipeSchema.index({ tags: 1 })
recipeSchema.index({ createdBy: 1 })
recipeSchema.index({ createdAt: -1 })

module.exports = mongoose.model('Recipe', recipeSchema)
