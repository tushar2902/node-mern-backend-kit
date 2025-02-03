const Excel = require('exceljs');
const path = require('path');

exports.generateExcel = async (data, column, sheetName, fileName = null) => {
  const workbook = new Excel.Workbook();
  workbook.created = new Date();
  workbook.modified = new Date();
  // workbook.creator = req.user.firstName + req.user.lastName;
  const worksheet = workbook.addWorksheet(sheetName);

  workbook.alignment = {
    vertical: 'middle',
    horizontal: 'left',
    wrapText: true,
  };
  worksheet.columns = column;
  worksheet.addRows(data);

  fileName = fileName || `file-${Date.now()}.xlsx`;
  const filePath = path.resolve(`${__dirname}/../../attachments/${fileName}`);
  await workbook.xlsx.writeFile(filePath);
  return filePath;
};

exports.readAndWrite = async (data, sheetName, filePath) => {
  const workbook = new Excel.Workbook();
  const worksheet = workbook.getWorksheet(sheetName);
  worksheet.addRows(data);
  await workbook.xlsx.writeFile(filePath);
  return filePath;
};
