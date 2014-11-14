'use strict';

var express = require('express');
var controller = require('./transaction.controller');
var importer = require('./transaction.importer');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

router.get('/byaccount/:bank/:account', controller.showByAccount);
router.post('/import/:bank/:account', importer.import);

module.exports = router;
