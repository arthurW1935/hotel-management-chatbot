const { Conversation } = require('../models');
const { getChatbotResponse } = require('../services/openaiService');
const { getRoomOptions, bookRoom } = require('../services/bookingService');

const getHistory = async (req, res) => {
    const conversationHistory = await Conversation.findAll();
    let conversationData = [];
    conversationHistory.forEach(conv => {
        conversationData.push({role: "user", content: conv.userMessage});
        conversationData.push({role: "assistant", content: conv.botResponse});
    });
    res.json(conversationData);
}

const handleChat = async (req, res) => {
    const userMessage = req.body.message;
    const conversationHistory = await Conversation.findAll();
    let conversationData = [];
    conversationHistory.forEach(conv => {
        conversationData.push({role: "user", content: conv.userMessage});
        conversationData.push({role: "assistant", content: conv.botResponse});
    });

    const botResponse = await getChatbotResponse(userMessage, conversationData);
    await Conversation.create({ userMessage, botResponse });

    res.json({ message: botResponse });
};



module.exports = { handleChat , getHistory};
