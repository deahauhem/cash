var csv = require('csv');
var through = require('through');
//var moment = require('moment');
var stream = require('stream');
var busboy = require('connect-busboy');
var util = require('util');
var Transaction = require('./transaction.model');


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
}; 


exports.importNab = function(req, res) {

  req.busboy.on('file', 
    function(fieldname, file, filename, encoding, mimetype) {
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

