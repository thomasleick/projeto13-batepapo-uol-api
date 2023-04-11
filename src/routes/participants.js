const express = require('express')
const router = express.Router()
const participantsController = require('../controllers/participantsController')

router.post('/', participantsController.postParticipant)
router.get('/', participantsController.getParticipants)

module.exports = router