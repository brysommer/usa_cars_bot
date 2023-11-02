import { getSpreadsheetData } from "./filedata.js";
import { dataBot } from './values.js';

const spreadsheetId = dataBot.googleSheetId;
const sheetName = "auto";

const getData = async (spreadsheetId, sheetName) => {
    const allData = await getSpreadsheetData(spreadsheetId, sheetName);
    
    if (allData && allData.values && Array.isArray(allData.values)) {
        const result = allData.values
            .filter(row => row.length > 0)
            .map(row => row.filter(value => value !== "") || []);
  
        return result;
    } else {
        return [];
    }
};

const filterCars = async (budget, year) => {   
    const [minPrice, maxPrice] = budget.split(' - ').map(str => parseInt(str, 10));
    const [minYear, maxYear] = year.split(' - ').map(str => parseInt(str, 10));

    const filterDataByPriceRange = async (minPrice, maxPrice) => {
        const allData = await getData(spreadsheetId, sheetName);
        return allData.filter(column => {
            const price = parseInt(column[5], 10);
            return !isNaN(price) && price >= minPrice && price <= maxPrice;
        });
    }; 

    const filterDataByYearRange = async (minYear, maxYear) => {
        const priceRangeResult =  await filterDataByPriceRange (minPrice, maxPrice);

        return priceRangeResult.filter(column => {
            const year = parseInt(column[4], 10);
            return !isNaN(year) && year >= minYear && year <= maxYear;
        });
    };

    const result = await filterDataByYearRange (minYear, maxYear);

    return result;
};

export {
  getData,
  filterCars
}