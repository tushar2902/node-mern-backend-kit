const XLSX = require('xlsx');

const readExcelData = async (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetList = workbook.SheetNames;
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetList[0]], {
      skipHeader: true,
    });
    return data;
  } catch (error) {
    console.error('Error reading Excel file:', error);
    throw error; // Re-throw to allow further handling
  }
};

exports.readExcelData = readExcelData;
