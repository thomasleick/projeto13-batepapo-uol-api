const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusController');

router.post('/', statusController.postStatus);

module.exports = router;