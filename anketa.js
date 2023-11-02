import bot from "./app.js";
import { dataBot } from './values.js';
import axios from 'axios';

import { allData, formattedMessages } from './filter.js';

let customerPhone;
let customerName;
let budget;
let year;

const phrases = {
    greetings: 'Вітаємо ! Це чат-бот компанії "AutoCar - Авто зі США" 🇺🇸',
    contactRequest: 'Нам потрібні ваші контактні дані. Отримати з контактних даних телеграм?',
    dataConfirmation: `Ваш номер телефону: ${customerPhone}. Ваше імя ${customerName}. Дані вірні?`,
    thanksForOrder: `Ваші дані відправлені. Дякуємо ${customerName} за звернення. Менеджер звʼяжеться з Вами найближчим часом.`,
    phoneRequest: 'Введіть ваш номер телефону, та відправте повідомлення',
    bugetQuestion: 'В який, приблизно, бюджет Вам підібрати автомобіль?',
    yearQuestion: 'Яких років Вам підібрати автомобіль?',
    confirmation: `✅ Дані підтверджено. Обрано сегмент підбору ${budget}, ${year}`
  };

  const keyboards = {
    startingKeyboard: [['🚙 Підібрати авто', '🚗 Прорахувати авто', '📞 Звʼяжіться зі мною']],
    contactRequest: [
      [ { text: 'Так', request_contact: true, } ],
      ['Ні, я введу номер вручну'],
      ['/start'],
    ],
    dataConfirmation: [
      ['Так, відправити заявку'],
      ['Ні, повторити введення'],
      ['/start'],
    ],
    enterPhone: [ ['/start'] ],
    surveyQuestion1: [['💰7000$ - 10000$', '💰10000$ - 15000$'], 
    ['💰15000$ - 20000$', '💰+20000']
  ],
    surveyQuestion2: [['📅2005-2010', '📅2010-2015'],
    ['📅2015-2020', '📅2020-2023']],
    phoneRequest: [['Ввести номер']],
    budget: [['💵7000$ - 10000$', '💵10000$ - 15000$'], 
    ['💵15000$ - 20000$', '💵+20000$']]
  }  

export const anketaListiner = async() => {
    bot.on('message', async (msg) => {
        let chatId = msg.chat.id;   
        let customerPhone;
        let customerName;

        switch (msg.text) {
            case '/start':
                bot.sendMessage(chatId, phrases.greetings, {
                    reply_markup: {keyboard: keyboards.startingKeyboard}})
                break;
            
            case '🚙 Підібрати авто':
                bot.sendMessage(chatId, phrases.bugetQuestion, {
                    reply_markup: {keyboard: keyboards.surveyQuestion1}})
                break;
            
            case '💰7000$ - 10000$':
                budget = '7000$ - 10000$';
                bot.sendMessage(chatId, phrases.yearQuestion, {
                    reply_markup: {keyboard: keyboards.surveyQuestion2}})
                break;

            case '💰10000$ - 15000$':

            case '📅2005-2010':
                year = '2005 - 2010'
                bot.sendMessage(chatId, `✅ Дані підтверджено. Обрано сегмент підбору ${budget}, ${year}`, {
                    reply_markup: {
                        keyboard: [[{ text: 'Отримати підбірку', request_contact: true }]],
                        resize_keyboard: true,
                        one_time_keyboard: true,
                      }
                    })
                break;   
        }
        if (msg.contact) {
            if(!(budget || year)) return;
            customerPhone = msg.contact.phone_number;
            customerName = msg.contact.first_name;
            await bot.sendMessage(dataBot.channelId, ` ${customerPhone} ${customerName} ${budget} ${year}`);
            
            const filterCars = async (budget, year) => {
                
                const [minPrice, maxPrice] = budget.split(' - ').map(str => parseInt(str, 10));
                
                const [minYear, maxYear] = year.split(' - ').map(str => parseInt(str, 10));
                
                const filterDataByPriceRange = async (minPrice, maxPrice) => {
                    return allData.filter(column => {
                      const price = parseInt(column[5], 10);
                      return !isNaN(price) && price >= minPrice && price <= maxPrice;
                    });
                  }; 

                  const filterDataByYearRange = async (minYear, maxYear) => {
                    
                    const priceRangeResult =  await filterDataByPriceRange (minPrice, maxPrice)
                    
                    
                    return priceRangeResult.filter(column => {
                      const year = parseInt(column[4], 10);
                      return !isNaN(year) && year >= minYear && year <= maxYear;
                    });
                  }; 
                  const result = await filterDataByYearRange (minYear, maxYear)
                  console.log(result)
                  return result
                }
            

            const filteredCarMessages = await filterCars(budget, year);
            
            const formattedMessages = filteredCarMessages.map((lot, index) => {

            const rowText = 
            `🚗 Варіант Авто ${index - 1}\n` +
            `✅ Марка/модель: ${lot[0]}\n` +
            `✅ Двигун: ${lot[1]}\n` +
            `✅ Привід: ${lot[2]}\n` +
            `✅ Пробіг: ${lot[3]}\n` +
            `✅ Рік: ${lot[4]}\n` +
            `💲 Ціна в США: ${lot[5]}\n`;
            
            return rowText;
            })
            //let carMessage = formattedMessages.join('\n');


            if (filteredCarMessages.length === 0) {
            carMessage = 'sorry no data'
            }

            formattedMessages.forEach( async (lot, index) => {
                await bot.sendMessage(chatId, lot);
                const response = await axios.get(filteredCarMessages[index][6], { responseType: 'arraybuffer' });
                await bot.sendPhoto(chatId, Buffer.from(response.data));

            })

            //await bot.sendMessage(chatId, carMessage);
        }
    })
}

