const fs = require('fs');
const path = require('path');

const basename = path.basename(__filename);
const db = {};

fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js'
  )
  .forEach((file) => {
    const model = require(path.join(__dirname, file));
    const modelName = model.modelName || path.parse(file).name;
    db[modelName] = model;
  });

module.exports = db;
