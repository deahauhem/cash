'use strict';

var _ = require('lodash');
var Transaction = require('./transaction.model');

// Get list of transactions
exports.index = function(req, res) {
  Transaction.find(function (err, transactions) {
    if(err) { return handleError(res, err); }
    return res.json(200, transactions);
  });
};

// Get a single transaction
exports.show = function(req, res) {
  Transaction.findById(req.params.id, function (err, transaction) {
    if(err) { return handleError(res, err); }
    if(!transaction) { return res.send(404); }
    return res.json(transaction);
  });
};

// Creates a new transaction in the DB.
exports.create = function(req, res) {
  Transaction.create(req.body, function(err, transaction) {
    if(err) { return handleError(res, err); }
    return res.json(201, transaction);
  });
};

// Updates an existing transaction in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Transaction.findById(req.params.id, function (err, transaction) {
    if (err) { return handleError(res, err); }
    if(!transaction) { return res.send(404); }
    var updated = _.merge(transaction, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, transaction);
    });
  });
};

// Deletes a transaction from the DB.
exports.destroy = function(req, res) {
  Transaction.findById(req.params.id, function (err, transaction) {
    if(err) { return handleError(res, err); }
    if(!transaction) { return res.send(404); }
    transaction.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

exports.importNab = function(req, res) {
  var csv = require('csv');
  var through = require('through');
  var moment = require('moment');
  var stream = require('stream');
  var busboy = require('connect-busboy');

  /* nabParser: need to write this for all different banks 
   * Should break this out into a separate file as well
   */
  var nabParser = function(record) {
    if (record.length > 6) {
      return {
        amount: parseFloat(record[1]),
        date: moment(record[0]),
        description: record[5],
        active: true
      };
    }
  } 
  var mongoTransactionWritableStream = function() {
    stream.Writable.call(this, {objectMode: true});
  }
  util.inherits(mongoTransactionWritableStream, stream.Writable);

  mongoTransactionWritableStream._write = function(chunk, encoding, callback) {
    Transaction.create(record, function(err, transaction) {
      if(err) { 
        callback(handleError(res, err)); 
      }
      callback(); 
    });
  }

  req.busboy.on('file', 
    function(fieldname, file, filename, encoding, mimetype) {
// do some checking for file names and field names and the like
      file
      .pipe(csv.parse())
      .pipe(csv.transform(nabParser))
      .pipe(mongoTransactionWritableStream);
    }
  );
  req.pipe(req.busboy);
  res.redirect("/account");
}


function handleError(res, err) {
  return res.send(500, err);
}
