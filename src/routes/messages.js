const express = require('express')
const router = express.Router()
const messagesController = require('../controllers/messagesController')

router.post('/', messagesController.postMessage)
router.get('/', messagesController.getMessages)

module.exports = router