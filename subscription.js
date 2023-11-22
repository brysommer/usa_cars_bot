import { admin } from './app.js';
import fs from 'fs';
import { bot } from "./app.js";
import { dataBot } from './values.js';
import { getData } from './filter.js';
import axios from 'axios';


export const subscription = () => {
    admin.on('message', async (msg) => {
        const chatId = msg.chat.id;
        if (msg.text == 'send') {

            const [ offer ]  = await getData(dataBot.googleSheetId, 'subscription');

            const offerMessage = 
            `✅ Марка/модель: ${offer[0]}\n` +
            `✅ Двигун: ${offer[1]}\n` +
            `✅ Привід: ${offer[2]}\n` +
            `✅ Пробіг: ${offer[3]}\n` +
            `✅ Рік: ${offer[4]}\n` +
            `💵 Вартість розмитненого авто у Львові: ${offer[5]}\n`;

            try {

                const data = fs.readFileSync('./users.txt');
                const users = JSON.parse(data);
                if (data.length === 0) return;

                const groupSize = 10;
                for (let i = 0; i < users.length; i += groupSize) {
                    const chatIdsGroup = users.slice(i, i + groupSize);
                    chatIdsGroup.forEach(async el => {
                      try {

                        const response = await axios.get(offer[6], { responseType: 'arraybuffer' });
                        await bot.sendMessage(el, offer[7] );
                        await bot.sendPhoto(chatId, Buffer.from(response.data));
                        await bot.sendMessage(el, offerMessage , { reply_markup: { inline_keyboard: [[{ text: offer[8], callback_data: `offer` }]] } });

                      } catch (error) {
                        console.log(`USERID: ${el}`);
                        console.log(error.response.body);

                      }
                    });
                    await new Promise(resolve => setTimeout(resolve, 1000));
                  }
                  await bot.sendMessage(dataBot.channelId, `${users.length} користувачів отримало повідомлення по підписці`);
                  await bot.sendDocument(dataBot.channelId, fs.createReadStream(`./users.txt`), { caption: `Користувачі` })

    
            } catch (error) {
                
            }
            

        }
    })
}
