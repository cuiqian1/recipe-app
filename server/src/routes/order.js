const router = require('express').Router()
const ctrl = require('../controllers/orderController')
const { auth } = require('../middleware/auth')

router.get('/today', ctrl.getToday)
router.get('/history', ctrl.getHistory)
router.get('/:date', ctrl.getByDate)
router.post('/add', auth, ctrl.addItem)
router.post('/remove', auth, ctrl.removeItem)
router.put('/:id/status', auth, ctrl.updateStatus)

module.exports = router
