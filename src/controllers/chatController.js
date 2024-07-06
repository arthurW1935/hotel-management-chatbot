const { Conversation } = require('../models');
const { getChatbotResponse } = require('../services/openaiService');
const { getRoomOptions, bookRoom } = require('../services/bookingService');

const getHistory = async (req, res) => {
    const conversationHistory = await Conversation.findAll();
    res.json(conversationHistory);
}

const handleChat = async (req, res) => {
    const userMessage = req.body.message;
    const conversationHistory = await Conversation.findAll();

    const botResponse = await getChatbotResponse(userMessage, conversationHistory.map(conv => ({
        role: "user",
        content: conv.userMessage
    })).concat(conversationHistory.map(conv => ({
        role: "assistant",
        content: conv.botResponse
    }))));

    // Save to conversation history
    await Conversation.create({ userMessage, botResponse });

    res.json({ message: botResponse });
};



module.exports = { handleChat , getHistory};
