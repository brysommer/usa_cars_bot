import bot from "./app.js";
import { dataBot } from './values.js';
import axios from 'axios';
import { filterCars } from './filter.js';
import { phrases, keyboards, submitBudget, submitYear, budget, year } from './leguage.js';

let customerPhone;
let customerName;
let cars;
let carsData;

const sendMessages = async (cars, numberofcar, pictures, chatId) => {
    numberofcar = numberofcar * 1;
    console.log(`Число: ${numberofcar}`);
    console.log(cars[numberofcar]);

    try {
        await bot.sendMessage(chatId, cars[numberofcar], { reply_markup: 
            keyboards.calculation
        });      
    } catch (error) {
        console.log(error)
    }
    if (!cars[numberofcar]) return;
  try {
      console.log(`Link: ${pictures[numberofcar][6]}`)
      const response = await axios.get(pictures[numberofcar][6], { responseType: 'arraybuffer' });
      await bot.sendPhoto(chatId, Buffer.from(response.data), { reply_markup: 
          { inline_keyboard: [
              [
              { text: '<= Попередня', callback_data: numberofcar - 1 },
              { text: 'Наступна =>', callback_data: numberofcar + 1 }],
          ]},
      });
  } catch (error) {
      console.log(error);
  }
};


export const anketaListiner = async () => {
    bot.on('callback_query', async (query) => {
        const callback = query.data;
        const chatId = query.message.chat.id;
        console.log(JSON.stringify(carsData))
        if (!carsData) return;
        if (callback == '/calculation') {
            bot.sendMessage(dataBot.channelId, `CALCULATION: ${customerPhone}, ${customerName}`);
            bot.sendMessage(chatId, `✅Вашу заявку на прорахунок прийнято🙌`);
        } else if (callback == carsData.length) {
            await sendMessages(cars, 0, carsData, chatId);
        } else if (callback < 0) {
            await sendMessages(cars, carsData.length -1, carsData, chatId);
        } else if (callback >= 0) {
            await sendMessages(cars, callback, carsData, chatId);
        }
    });

    bot.on('message', async (msg) => {
        let chatId = msg.chat.id;
        const text = msg.text;   

        switch (msg.text) {
            case '/start':
                bot.sendMessage(chatId, phrases.greetings, {
                    reply_markup: {
                      keyboard: keyboards.startingKeyboard,
                      resize_keyboard: true,
                      one_time_keyboard: true,}})
                break;
            
            case '🚙 Підібрати авто':
                bot.sendMessage(chatId, phrases.bugetQuestion, {
                    reply_markup: {keyboard: 
                      keyboards.surveyQuestion1,
                      resize_keyboard: true,
                      one_time_keyboard: true,}})
                break;
            
            case '💰7000$ - 10000$':
            case '💰10000$ - 15000$':
            case '💰15000$ - 20000$':
            case '💰20000$ - 50000$':
                await submitBudget(text, chatId);
                break;

            case '📅2005 - 2010':
            case '📅2010 - 2015':
            case '📅2015 - 2020':
            case '📅2020 - 2023':
                await submitYear(text, chatId);
                break; 
            case '📞 Звʼяжіться зі мною':
                bot.sendMessage(chatId, phrases.callback, keyboards.sendContact);
                break; 
        }
        if (msg.contact) {
            customerPhone = msg.contact.phone_number;
            customerName = msg.contact.first_name;

            if(!(budget || year)) {
              bot.sendMessage(dataBot.channelId, `Callback: ${customerPhone, customerName}`);
              return;
            };

            await bot.sendMessage(dataBot.channelId, ` ${customerPhone} ${customerName} ${budget} ${year}`);
                
            carsData = await filterCars(budget, year);

            if (carsData.length === 0) {
              await bot.sendMessage(chatId, phrases.nodata, keyboards.sendContact);
            };

            cars = carsData.map((lot, index) => {
                const rowText = 
                    `🚗 Варіант Авто ${index + 1}\n` +
                    `✅ Марка/модель: ${lot[0]}\n` +
                    `✅ Двигун: ${lot[1]}\n` +
                    `✅ Привід: ${lot[2]}\n` +
                    `✅ Пробіг: ${lot[3]}\n` +
                    `✅ Рік: ${lot[4]}\n` +
                    `💵 Вартість розмитненого авто у Львові: ${lot[5]}\n`;
                    
                return rowText;
            });


            await sendMessages(cars, 0, carsData, chatId);
        }
    })
}

