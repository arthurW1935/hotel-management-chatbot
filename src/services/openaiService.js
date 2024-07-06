const OpenAI = require('openai');
const { get } = require('../routes/chatRoutes');
const {getRoomOptions, bookRoom} = require('../services/bookingService');
const { all } = require('axios');

// const configuration = new Configuration({
//     apiKey: process.env.OPENAI_API_KEY,
// });
const openai = new OpenAI({
    apiKey: "sk-proj-B8qsABsRydCMcuuppMgdT3BlbkFJg6ifxFHeFavQMeKNpGda",
});

const tools = [
    {
        "type": "function",
        "function": {
            "name": "getRoomOptions",
            "description": "Get the available room options. This function returns a list of rooms that are available to book. You can get all the information of the rooms from this function.",
        },
        "required" : [],
    },
    {
        "type": "function",
        "function": {
            "name": "bookRoom",
            "description": "Book a room for a guest. This function books a room for a guest. You need to provide the room ID, guest's full name, email, and the number of nights to book the room for. The function returns the booking confirmation details. The parameters must be JSON encoded.",
            "parameters": {
                "type": "object",
                "properties": {
                    "roomId": {
                        "type": "string",
                        "description": "The ID of the room to book",
                    },
                    "fullName": {
                        "type": "string",
                        "description": "The full name of the guest",
                    },
                    "email": {
                        "type": "string",
                        "description": "The email of the guest",
                    },
                    "nights": {
                        "type": "number",
                        "description": "The number of nights to book the room for",
                    },
                },
            },
            "required" : ["roomId", "fullName", "email", "nights"]
        }
    }
]

const getChatbotResponse = async (message, conversationHistory) => {
    let allMessages = [
        {role: "system", content: "This is a chatbot which can help the user know the availability and book a room. Please provide responses in plain text only. Do not use any formatted stylings such as bold, italics, bullet points, numbered lists, or code blocks. Also, do not use newline characters. Reply in one paragraph only."},
        ...conversationHistory,
        { role: "user", content: message }
    ]
    
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: allMessages,
        tools: tools,
    });
    const responseMessage = response.choices[0].message;
    allMessages.push(responseMessage);
    if (responseMessage.tool_calls){
        const tool_calls = responseMessage.tool_calls;
        const tool_call_id = tool_calls[0].id;
        const tool_function_name = tool_calls[0].function.name;
        const tool_parameters = eval(tool_calls[0].function.arguments);
        console.log(tool_parameters);


        if(tool_function_name === "getRoomOptions"){
            const roomOptions = await getRoomOptions();
            // console.log(roomOptions);
            
            allMessages.push({
                "role": "tool",
                "tool_call_id": tool_call_id,
                "name": tool_function_name,
                "content": JSON.stringify(roomOptions)
            });

            console.log(allMessages);

            const responseAfterToolCall = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: allMessages
            });

            let reply = responseAfterToolCall.choices[0].message;
            
            console.log(reply.content);

            return reply.content;
        }
        else if(tool_function_name === "bookRoom"){
            console.log("bookRoom");
            console.log(tool_parameters);

        }
        else{
            return "No functions found with the name: " + tool_function_name;
        }
        return "This is a tool call";
    }
    return responseMessage.content;
};

module.exports = { getChatbotResponse };
