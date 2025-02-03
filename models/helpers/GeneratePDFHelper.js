const PdfMake = require('pdfmake');
const path = require('path');
const fs = require('fs');

const fonts = {
  Maven: {
    normal: path.resolve('./fonts/MavenPro-Regular.ttf'),
    bold: path.resolve('./fonts/MavenPro-Bold.ttf'),
    italics: path.resolve('./fonts/MavenPro-Italic.ttf'),
    bolditalics: path.resolve('./fonts/MavenPro-SemiBold.ttf'),
  },
  Roboto: {
    normal: path.resolve('./fonts/Roboto-Italic.ttf'),
    bold: path.resolve('./fonts/Roboto-Medium.ttf'),
    italics: path.resolve('./fonts/Roboto-Italic.ttf'),
    bolditalics: path.resolve('./fonts/Roboto-MediumItalic.ttf'),
  },
};

exports.generatePDF = async (
  documentDefinition,
  fileName,
  callback,
  errorCallBack
) => {
  try {
    console.log('fileName', fileName);
    const printer = new PdfMake(fonts);
    const pdfDocument = printer.createPdfKitDocument(documentDefinition);
    const chunks = [];
    let result;
    fileName = fileName || `${fileName}-${Date.now()}.pdf`;
    const filePath = path.resolve(`${__dirname}/../../attachments/${fileName}`);
    pdfDocument.pipe(
      fs.createWriteStream(filePath).on('error', (err) => {
        console.log('error in creating file');
        errorCallBack(err.message);
      })
    );
    pdfDocument.on('data', (chunk) => {
      chunks.push(chunk);
    });
    pdfDocument.on('end', () => {
      result = Buffer.concat(chunks);
      const payload = {
        base64File: `data:application/pdf;base64,${result.toString('base64')}`,
        fileName,
      };
      callback(payload);
    });
    pdfDocument.end();
  } catch (e) {
    console.log(e);
  }
};
