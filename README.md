# Hotel Booking Chatbot
### Overview
This project is a simplified hotel booking chatbot that allows users to inquire about booking a resort room. The chatbot uses OpenAI's API for natural language processing and maintains conversation history. It also leverages function calling to fetch information about the The backend is built with Express.js and is implemented as a Telegram Bot.

### Features
- Chat with users and provide room booking options.
- Fetch room options from an external API.
- Simulate room booking and provide booking confirmation.
- Maintain conversation history using SQLite and Sequelize.
- Telegram Bot for interacting with chatbot

### Technologies Used
- Backend: Node.js, Express.js
- Frontend: React
- Database: SQLite, Sequelize
- Natural Language Processing: OpenAI API

## Setup Instructions
### Prerequisites
- Node.js (v14.x or later)
- npm (v6.x or later)
- OpenAI API Key
- Telegram Bot Key

### Backend Setup
- Clone the repository:
```
git clone https://github.com/yourusername/hotel-booking-chatbot.git
cd hotel-booking-chatbot/server
```

- Install dependencies:
```
npm install
```

- Create a .env file in the server directory and add your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key
```

- Run the backend server:
```
node src/app.js
```

### Telegram Bot Setup
- Head over to telegram and create a new bot using Telegram BotFather
- Copy the token provided by the BotFather bot.
- Add the token in your .env file
```
TELEGRAM_BOT_TOKEN=your_token
```
- In a new terminal, run the telegram bot
```
node telegram-bot/bot.js
```

## Example Usage

### Telegram Bot
- Head over to telegram and go to the bot which was created by you
- Start the bot
- You can watch the demo video of the working telegram bot [here](https://drive.google.com/file/d/1kzYKpL3tkMgAo29MaBZeMHtnLSKE-4pa/view?usp=sharing)

### Backend 

Example request
```
curl -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d '{"message": "I want to book a room"}'
```

Example response
```
{
  "message": "Here are the available room options..."
}
```



