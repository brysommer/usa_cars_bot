import TelegramBot from 'node-telegram-bot-api';
import { anketaListiner } from './anketa.js';
import { dataBot } from './values.js';
import { subscription } from './subscription.js';


const bot = new TelegramBot(dataBot.telegramBotToken, { polling: true });
const admin = new TelegramBot(dataBot.adminBotToken, { polling: true });

export { bot, admin };

bot.setMyCommands([
  { command: '/start', description: 'Почати' },
]);


subscription();
anketaListiner();
