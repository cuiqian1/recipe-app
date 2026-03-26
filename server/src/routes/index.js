const router = require('express').Router()

router.use('/users', require('./user'))
router.use('/categories', require('./category'))
router.use('/recipes', require('./recipe'))
router.use('/orders', require('./order'))
router.use('/upload', require('./upload'))

module.exports = router
