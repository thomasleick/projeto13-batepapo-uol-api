const express = require('express')
const router = express.Router()
const participantController = require('../controllers/participantsControllers')

router.post('/', participantController.postParticipant)

module.exports = router