'use strict';

angular.module('cashApp')
  .controller('AccountCtrl', ["$scope", "$http", "$modal", "$log", function ($scope, $http, $modal, $log) {
    $http.get("/api/accounts")
    .success( function(data) {
      $scope.accounts = data;
    })
    .error( function(data) {
      console.log("error loading accounts");
    })
    ;
    $scope.create = function() {
      var instance = $modal.open({ templateUrl: "myModalContent.html",
        controller: 'ModalAccountCtrl',
	resolve: {
	  form: function() {
	      return {};
	  }
        }
      });
      instance.result.then(function(data) {
        postAccount(data);
      });
    }
    $scope.edit = function (account) {
      console.log(account);

      var instance = $modal.open({ templateUrl: "myModalContent.html",
        controller: 'ModalAccountCtrl',
	resolve: {
	  form: function() {
	      return account;
	  }
        }
      });
      instance.result.then(function(data) {
	  $http.put("/api/accounts/"+account._id, data)
	  .success(function(data){
	  })
	  .error(function() {
	    console.log("noo!");
	  });
      });
    }
    $scope.deleteAccount = function (account) {
      $http.delete("/api/accounts/" + account._id)
      .success(function() {
        $scope.accounts = $scope.accounts.filter(function(x){ return x._id !== account._id;})
      });
    }
    function postAccount(data) {
      $http.post("/api/accounts", data)
      .success(function(data){
        $scope.accounts.push(data);
      })
      .error(function() {
        console.log("noo!");
      });
    }
  }])
  .controller('ModalAccountCtrl', ["$scope", "$modalInstance", "form",  function ($scope, $modalInstance, form) {
    $scope.form = form;
  
    console.log($scope);
    $scope.ok = function () {
      $modalInstance.close($scope.form);
    };
  
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }]);
