'use strict';

var _ = require('lodash');
var Statement = require('./statement.model');

// Get list of statements
exports.index = function(req, res) {
  Statement.find(function (err, statements) {
    if(err) { return handleError(res, err); }
    return res.json(200, statements);
  });
};

// Get a single statement
exports.show = function(req, res) {
  Statement.findById(req.params.id, function (err, statement) {
    if(err) { return handleError(res, err); }
    if(!statement) { return res.send(404); }
    return res.json(statement);
  });
};

// Creates a new statement in the DB.
exports.create = function(req, res) {
  Statement.create(req.body, function(err, statement) {
    if(err) { return handleError(res, err); }
    return res.json(201, statement);
  });
};

// Updates an existing statement in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Statement.findById(req.params.id, function (err, statement) {
    if (err) { return handleError(res, err); }
    if(!statement) { return res.send(404); }
    var updated = _.merge(statement, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, statement);
    });
  });
};

// Deletes a statement from the DB.
exports.destroy = function(req, res) {
  Statement.findById(req.params.id, function (err, statement) {
    if(err) { return handleError(res, err); }
    if(!statement) { return res.send(404); }
    statement.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}