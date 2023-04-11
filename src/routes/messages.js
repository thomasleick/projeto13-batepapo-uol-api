const express = require('express')
const router = express.Router()
const messagesController = require('../controllers/messagesController')

router.post('/', messagesController.postParticipant)
router.get('/', messagesController.getParticipants)

module.exports = router