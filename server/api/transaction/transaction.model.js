'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TransactionSchema = new Schema({
  amount: Number,
  date: Date,
  description: String,
  account: Schema.Types.ObjectId,
  active: Boolean
});

module.exports = mongoose.model('Transaction', TransactionSchema);
