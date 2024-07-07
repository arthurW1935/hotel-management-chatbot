const OpenAI = require('openai');
const fs = require('fs');
const {getRoomOptions, bookRoom} = require('../services/bookingService');
require('dotenv').config();

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
    apiKey: apiKey,
});

const systemPrompt = fs.readFileSync('src/services/systemPrompt.txt', 'utf8');

const tools = JSON.parse(fs.readFileSync('src/services/tools.json', 'utf8'));

const getChatbotResponse = async (message, conversationHistory) => {
    
    let allMessages = [
        {role: "system", content: systemPrompt}, 
        ...conversationHistory,
        { role: "user", content: message }
    ];
    
    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: allMessages,
        tools: tools,
        tool_choice: "auto"
    });

    const responseMessage = response.choices[0].message;
    allMessages.push(responseMessage);
    console.log(responseMessage);

    if (responseMessage.tool_calls){
        // console.log(responseMessage.tool_calls);
        const tool_calls = responseMessage.tool_calls;
        const tool_call_id = tool_calls[0].id;
        const tool_function_name = tool_calls[0].function.name;
        const tool_parameters = JSON.parse(tool_calls[0].function.arguments);

        if(tool_function_name === "getRoomOptions"){
            const roomOptions = await getRoomOptions();
            
            allMessages.push({
                "role": "tool",
                "tool_call_id": tool_call_id,
                "name": tool_function_name,
                "content": JSON.stringify(roomOptions)
            });

            const responseAfterToolCall = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {role: "system", content: systemPrompt},
                    ...allMessages
                ]
            });

            let reply = responseAfterToolCall.choices[0].message;
            allMessages.push(reply);
            return reply.content;
        }
        else if(tool_function_name === "bookRoom"){
            console.log(tool_parameters);
            const { roomId, fullName, email, nights } = tool_parameters;
            const bookingConfirmation = await bookRoom(roomId, fullName, email, nights);
            
            allMessages.push({
                role: "tool",
                tool_call_id: tool_call_id,
                name: tool_function_name,
                content: JSON.stringify(bookingConfirmation)
            });

            const responseAfterToolCall = await openai.chat.completions.create({
                model: "gpt-4",
                messages: allMessages
            });

            return responseAfterToolCall.choices[0].message.content;
        }
        else{
            return "No functions found with the name: " + tool_function_name;
        }
    }
    return responseMessage.content;
};

module.exports = { getChatbotResponse };
