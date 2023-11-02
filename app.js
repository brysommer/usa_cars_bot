import TelegramBot from 'node-telegram-bot-api';
import { anketaListiner } from './anketa.js';
import { dataBot } from './values.js';
import axios from 'axios';

const bot = new TelegramBot(dataBot.telegramBotToken, { polling: true });
export default bot;
bot.setMyCommands([
  {command: '/start', description: 'Почати'},
]);

const urlPic = 'https://cs.copart.com/v1/AUTH_svc.pdoc00001/lpp/1023/4d2f785195ba4355b9ba76738f3b1976_ful.jpg';

bot.on('message', async (message) => {
  if (message.text == 'pic') {
    try {
      const response = await axios.get(urlPic, { responseType: 'arraybuffer' });

      bot.sendPhoto(message.chat.id, Buffer.from(response.data));
    } catch (error) {
      console.error(error);
    }
  }
});



anketaListiner();
