const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  nickname: { type: String, required: true, unique: true, trim: true },
  avatar: { type: String, default: '' }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)
