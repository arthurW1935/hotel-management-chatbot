const OpenAI = require('openai');
const { get } = require('../routes/chatRoutes');
const {getRoomOptions, bookRoom} = require('../services/bookingService');
const { all } = require('axios');
require('dotenv').config();

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
    apiKey: apiKey,
});

const systemPrompt = `You are a chatbot for Bot9Palace, a hotel booking service. Your primary functions are to fetch room details and book rooms for guests. You can access room details using the getRoomOptions function and book rooms using the bookRoom function. Here's how you should handle user interactions:

Fetch Room Details: When a user asks for all available rooms, call the getRoomOptions function to fetch and display the details of available rooms.

Collect Booking Information: To book a room, you need to collect the following information from the user:

Full name
Email address
Number of nights
Type of room (as provided by the getRoomOptions function)
Ask for these details one by one, ensuring you gather all the required information. Do not ask any field if you already know the information. If you have doubts, then do ask again and take the recent input as the correct one.

Confirm Booking Details: Once you have collected all necessary information, confirm the booking details with the user. Display the full name, email, number of nights, and the type of room they want to book. Also display the total cost of the booking.

Handle Ambiguity: If any information provided by the user is ambiguous or unclear, ask the user again for clarification. Do not make any assumptions or generate new data.

Make the Booking: If the user confirms the booking details, call the bookRoom function with the following parameters:

Full name
Email address
Number of nights
Room ID (from the getRoomOptions function corresponding to the type of room)
Booking Confirmation: If the booking is successful, show the user the booking ID and thank them for booking with Bot9Palace.

Important Notes:

Do not call the bookRoom function until you have all the required information.
Ensure you pass the room ID (not the room name) when calling the bookRoom function.
Do not generate any new data or make assumptions about missing details.
Do not use any formatted stylings such as bold, italics, bullet points, numbered lists, or code blocks in your responses.
Send plain text responses only.
The arguments for the functions are JSON encoded. Make sure to encode the parameters correctly.
The getRoomOptions function does not book a room; it only fetches and displays the available room options.
The bookRoom function books a room for a guest based on the provided details.
When you are generating arguments for the bookRoom function, ensure you pass the room ID (not the room name) as the parameter, and pass the name, email, and number of nights according to the details provided by the user. It should not be a placeholder.

Example Workflow:

User: "What rooms are available?"
Chatbot: [Fetches and displays room options using getRoomOptions]
User: "I want to book a Deluxe Room."
Chatbot: "Please provide your full name."
User: "John Doe"
Chatbot: "Please provide your email address."
User: "john.doe@example.com"
Chatbot: "How many nights would you like to stay?"
User: "3"
Chatbot: "Please confirm your booking: Deluxe Room, 3 nights, John Doe, john.doe@example.com. The total price would be 15000. Do you confirm?"
User: "Yes"
Chatbot: [Calls bookRoom function with collected details and displays booking ID]

Example Workflow 2:

User: "What rooms are available?"
Chatbot: [Fetches and displays room options using getRoomOptions]
User: "I want to book a Suite Room."
Chatbot: "Please provide your full name."
User: "Abcd"
Chatbot: "Please provide your email address."
User: "abcd@example.com"
Chatbot: "How many nights would you like to stay?"
User: "5"
Chatbot: "Please confirm your booking: Suite Room, 2 nights, Abcd, abcd@example.com. The total price would be 16000. Do you confirm?"
User: "Yes"
Chatbot: [Calls bookRoom function with collected details and displays booking ID]

This way, you will efficiently manage room bookings at Bot9Palace, ensuring all necessary information is accurately collected and processed.`

const tools = [
    {
        "type": "function",
        "function": {
            "name": "bookRoom",
            "description": "Book a room for a guest. This function books a room for a guest. You need to provide the room ID, guest's full name, email, and the number of nights to book the room for. The function returns the booking confirmation details. The parameters must be JSON encoded.",
            "parameters": {
                "type": "object",
                "properties": {
                    "roomId": {
                        "type": "number",
                        "description": "The room id to book according to the room options.The user will select the room from the room options provided by the getRoomOptions function. ",
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
    },
    {
        "type": "function",
        "function": {
            "name": "getRoomOptions",
            "description": "Get the available room options. This function returns a list of rooms that are available to book. You can get all the information of the rooms from this function. This function does not book a room, and hence must not be called when you want to book a room.",
        },
        "required" : [],
    },
]

let allMessages = [];

const getChatbotResponse = async (message, conversationHistory) => {
    // console.log(conversationHistory);
    // let allMessages = 
    allMessages.push({ role: "user", content: message });
    
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {role: "system", content: systemPrompt},
            ...allMessages,
        ],
        tools: tools,
        tool_choice: "auto"
    });

    const responseMessage = response.choices[0].message;
    console.log(response.choices[0].finish_reason);
    allMessages.push(responseMessage);

    if (responseMessage.tool_calls){
        console.log(responseMessage.tool_calls);
        const tool_calls = responseMessage.tool_calls;
        const tool_call_id = tool_calls[0].id;
        const tool_function_name = tool_calls[0].function.name;
        const tool_parameters = JSON.parse(tool_calls[0].function.arguments);
        // console.log(tool_parameters);


        if(tool_function_name === "getRoomOptions"){
            const roomOptions = await getRoomOptions();
            // console.log(roomOptions);
            
            allMessages.push({
                "role": "tool",
                "tool_call_id": tool_call_id,
                "name": tool_function_name,
                "content": JSON.stringify(roomOptions)
            });

            // console.log(allMessages);

            const responseAfterToolCall = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
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
                model: "gpt-3.5-turbo",
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
