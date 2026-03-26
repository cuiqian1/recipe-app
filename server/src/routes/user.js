const router = require('express').Router()
const ctrl = require('../controllers/userController')

router.post('/login', ctrl.login)
router.get('/', ctrl.getUsers)
router.put('/:id', ctrl.updateUser)

module.exports = router
