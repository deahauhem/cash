'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AccountSchema = new Schema({
  name: String,
  bank: String,
  accountNumber: String,
  accountBsb: String,
  active: Boolean
});

module.exports = mongoose.model('Account', AccountSchema);
