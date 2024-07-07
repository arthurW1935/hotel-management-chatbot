const {Telegraf} = require('telegraf');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });


const botToken = process.env.TELEGRAM_BOT_TOKEN;
const bot = new Telegraf(botToken);

bot.start((ctx) => ctx.reply('Welcome to Bot9Palace! How can I assist you today?'));

bot.help((ctx) => ctx.reply('You can ask me about available rooms or book a room. How can I help you today?'));

bot.on('text', async (ctx) => {
    const message = ctx.message.text;
    const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message })
    });
    const data = await response.json();
    ctx.reply(data.message);
});

bot.launch();
console.log('Bot is running');

