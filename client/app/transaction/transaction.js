'use strict';

angular.module('cashApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('transaction', {
        url: '/transaction',
        templateUrl: 'app/transaction/transaction.html',
        controller: 'TransactionCtrl'
      });
  });