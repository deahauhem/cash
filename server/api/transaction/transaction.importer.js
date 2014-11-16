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
      console.log("err: " + err);
      callback(handleError(res, err)); 
    } else {
      callback(); 
    }
  });
}

// key: bank name
// value function(accountId) => through stream
var parsers = {
  "NAB": function(accountId) {
    return through(function(record) {
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
    var result = parsers[bank];
    callback(false, result);
  });
}
function handleError(res, err) {
  console.log(err);
  return res.send(500, err);
}

module.exports = function(router) {
  router.post('/import/:bank/:account', function(req, res) {
    createParser(req.params.bank, req.params.account, function(err, result) {
      if (err) { handleError(res, "Could not import:" + result); }
      if (!result instanceof Function)  { 
        handleError(res, "error: could not create parser");
      }
      var bankParser = result;

      req.busboy.on('file', 
        function(fieldname, file, filename, encoding, mimetype) {
          console.log('parsing file ' + filename);
          file.pipe(csv.parse())
          .pipe(bankParser(req.params.account))
          .pipe(through(function(r){console.log(r);}))
          .pipe(mongoTransactionWritableStream);
          res.redirect("/");
        }
      );
      req.pipe(req.busboy);
    })
  });
}

