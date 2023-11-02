import { getSpreadsheetData } from "./filedata.js";
import { dataBot } from './values.js';

// STATUS RANGE
// ====================
const spreadsheetId = dataBot.googleSheetId;
const sheetName = "auto";
// ======================

const findYearInColumn = async () => {
  try {
    const array = await getArrayFromColumn(spreadsheetId, sheetName, columnName);
    //console.log(array);
    // Now you can work with the array data here
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const getData = async (spreadsheetId, sheetName) => {
    const allData = await getSpreadsheetData(spreadsheetId, sheetName);
  
    if (allData && allData.values && Array.isArray(allData.values)) {
      const result = allData.values
        .filter(row => row.length > 0)
        .map(row => row.filter(value => value !== "") || []);
  
      return result;
    } else {
      console.error("Invalid data");
      return [];
    }
  };

const carArray = await getData(dataBot.googleSheetId, dataBot.googleSheetName)  
  

  
  const filterDataByPrice = async (data, minPrice) => {
    return data.filter(row => {
      const price = parseInt(row[5], 10);
      return !isNaN(price) && price > minPrice;
    });
  };
  
  const allData = await getData(spreadsheetId, sheetName);

  //const highPriceData = filterDataByPrice(allData, 20000);
  //console.log(highPriceData);

  const filterDataByYear = async (data, minYear) => {
    return data.filter(row => {
        const price = parseInt(row[4], 10);
        return !isNaN(price) && price > minYear;
    });
  };

  const resultData = await filterDataByPrice(allData, 10000);
  let yeaFilteredData = await filterDataByYear(resultData, 100);
  //console.log(yeaFilteredData)

  yeaFilteredData = Array.isArray(yeaFilteredData) ? yeaFilteredData : [];

  const formattedMessages = yeaFilteredData.map((column, index) => {
    const rowNumber = index + 1;
    if (index === 0) return ''; // Skip the first row

    const rowText = 
      `🚗 Варіант Авто ${rowNumber - 1}\n` +
      `✅ Марка/модель: ${column[0]}\n` +
      `✅ Двигун: ${column[1]}\n` +
      `✅ Привід: ${column[2]}\n` +
      `✅ Пробіг: ${column[3]}\n` +
      `✅ Рік: ${column[4]}\n` +
      `💲 Ціна в США: ${column[5]}\n` +
      `✅ Фото: ${column[6]}\n`;
    return rowText;
});

export {
  getData,
  formattedMessages,
  yeaFilteredData,
  allData
}