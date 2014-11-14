var csv = require('csv');
var through = require('through');
//var moment = require('moment');
var stream = require('stream');
var busboy = require('connect-busboy');
var util = require('util');
var Transaction = require('./transaction.model');
var Account = require('../account/account.model');


// use a stream to put transactions into the database
var mongoTransactionWritableStream = new stream.Writable({objectMode: true});

mongoTransactionWritableStream._write = function(record, encoding, callback) {
  Transaction.create(record, function(err, transaction) {
    if (err) { 
      callback(handleError(res, err)); 
    }
    callback(); 
  });
}

// key: bank name
// value function(accountId) => through stream
var parsers = {
  nab: function(accountId) {
    return through(function(record) {
      console.log(record);
      if (record.length > 6) {
        this.queue({
          amount: parseFloat(record[1]),
          date: new Date(record[0]),
          description: record[5],
          active: true,
          account: accountId
        });
      }
    });
  }
}
var createParser = function(bank, account, callback) {
  var searchTerms = {bank: bank, name: account};
  console.log(searchTerms);
  Account.findOne(searchTerms, function(err, account) {
    // should be only one account due to database constraints
    if (err) { callback(1, "Error occurred during account lookup"); }
    if (!account) { callback(2, "No such account"); } 
    var result = function(record) {
      if (record.length > 6) {
        this.queue({
          amount: parseFloat(record[1]),
          date: new Date(record[0]),
          description: record[5],
          active: true
        });
      }
    };
    callback(false, result);
  });
}

exports.import = function(req, res) {
  console.log({bank: req.params.bank, name:req.params.account});
  createParser(req.params.bank, req.params.account, function(err, result) {
    if (err) { handleError(res, "Could not import:" + result); }
    if (!result instanceof Function)  { 
      handleError(res, "error: could not create parser");
    }
    var bankParser = result;

    req.busboy.on('file', 
      function(fieldname, file, filename, encoding, mimetype) {
        if (fieldname === "file") {
          file 
          .pipe(csv.parse())
          .pipe(bankParser)
          .pipe(mongoTransactionWritableStream);
      }
    }
  );

  })

  req.pipe(req.busboy);
  res.redirect("/account");
}

// legacy

/* nabParser: need to write this for all different banks 
 * Should break this out into a separate file as well
 */
var nabParser = function(record) {
  if (record.length > 6) {
    this.queue({
      amount: parseFloat(record[1]),
      date: new Date(record[0]),
      description: record[5],
      active: true
    });
  }
} 

exports.importNab = function(req, res) {

  req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      if (fieldname === "file") {
        file
        .pipe(csv.parse())
        .pipe(through(nabParser))
        .pipe(mongoTransactionWritableStream);
      }
    }
  );
  req.pipe(req.busboy);
  res.redirect("/account");
}
function handleError(res, err) {
  console.log(err);
  return res.send(500, err);
}
