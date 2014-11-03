'use strict';

angular.module('cashApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('transaction', {
        url: '/transaction/:account',
        templateUrl: 'app/transaction/transaction.html',
        controller: 'TransactionCtrl'
      });
  });
