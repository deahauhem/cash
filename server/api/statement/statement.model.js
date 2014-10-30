'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var StatementSchema = new Schema({
  name: String,
  financialInstitution: String,
  importDate: Date,
  issueDate: Date,
  active: Boolean
});

module.exports = mongoose.model('Statement', StatementSchema);
