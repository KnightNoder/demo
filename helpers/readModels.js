const debug = require('debug')('lava');
const fs = require('fs');
const path = require('path');

function readModels() {
  const models = {};
  const modelDir = path.join(path.dirname(__dirname), 'models');
  const modelRegex = new RegExp(/^(.*)Model\.js$/);
  fs.readdirSync(modelDir).forEach((file) => {
    debug('importing model from:', file);
    const match = modelRegex.exec(file);
    const fileModule = path.join(path.dirname(__dirname), 'models', file);
    if (!match) {
      debug('ignoring non-model file:', file);
      return;
    }
    const name = match[1];

    models[name] = require(fileModule);
  });
  debug(models);
  return models;
}


module.exports = {
  readModels
};
