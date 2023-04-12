const express = require('express')
const router = express.Router()
const messagesController = require('../controllers/messagesController')

router.post('/', messagesController.postMessage)
router.get('/', messagesController.getMessages)
router.delete('/:id', messagesController.deleteMessage)

module.exports = router