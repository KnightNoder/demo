const orm = require('orm');
const sqlConfig = require('../config/mysqlConfig');
const modelsHelper = require('./readModels.js');
var {pascalCase, snakeCase} = require('change-case');
const debug = require('debug')('lava');

var mw = orm.express('mysql://lava:password@localhost/demo', {
  define: function (db, models, next) {
    var modelSpecs = modelsHelper.readModels();
    // debug(modelSpecs,'m specs');
    Object.keys(modelSpecs).forEach(name => {
      var {model, validations} = modelSpecs[name];
      try {
        models[pascalCase(name)] = db.define(snakeCase(name), model, {validations});
      } catch (err) {
        log.fatal(err);
        throw err;
      }
    });
    next();
  }
});

module.exports = {
  mw
};
