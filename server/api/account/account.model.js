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
AccountSchema.index({name: 1, bank: -1}, {unique: 1});

module.exports = mongoose.model('Account', AccountSchema);
