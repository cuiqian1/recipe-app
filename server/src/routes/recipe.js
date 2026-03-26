const router = require('express').Router()
const ctrl = require('../controllers/recipeController')
const { auth, optionalAuth } = require('../middleware/auth')

router.get('/random', optionalAuth, ctrl.getRandom)
router.get('/hot', optionalAuth, ctrl.getHot)
router.get('/', optionalAuth, ctrl.getList)
router.get('/:id', ctrl.getDetail)
router.post('/', auth, ctrl.create)
router.post('/:id/copy', auth, ctrl.copy)
router.put('/:id', auth, ctrl.update)
router.delete('/:id', auth, ctrl.remove)

module.exports = router
