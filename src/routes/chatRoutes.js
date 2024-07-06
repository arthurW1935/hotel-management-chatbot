const express = require('express');
const { handleChat, getHistory } = require('../controllers/chatController');
const router = express.Router();

router.get('/chat', getHistory);
router.post('/chat', handleChat);

module.exports = router;
