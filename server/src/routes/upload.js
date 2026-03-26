const router = require('express').Router()
const upload = require('../middleware/upload')
const ctrl = require('../controllers/uploadController')

router.post('/image', upload.single('file'), ctrl.uploadImage)

module.exports = router
