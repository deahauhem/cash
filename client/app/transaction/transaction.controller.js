'use strict';

angular.module('cashApp')
  .controller('TransactionCtrl', ["$scope", "$http", "$stateParams", function ($scope, $http, $stateParams) {
    $scope.message = 'Hello';
    $scope.$stateParams = $stateParams.account;
    $scope.account = $stateParams.account;
    $scope.transactions = [];
  }]);
