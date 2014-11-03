'use strict';

angular.module('cashApp')
  .controller('AccountCtrl', ["$scope", "$http", "$modal", "$upload",  function ($scope, $http, $modal, $upload) {

    // retrieve the accounts
    $http.get("/api/accounts")
    .success(function(data) {
      $scope.accounts = data;
    })
    .error(function(data) {
      console.log("error loading accounts");
    });

    $scope.create = function() {
      var instance = $modal.open({ templateUrl: "createAccount.html",
        controller: 'ModalAccountCtrl',
        resolve: { form: function() { return {}; } }
      });
      instance.result.then(function(data) {
        $http.post("/api/transactions/import", data)
        .success(function(data){
          $scope.accounts.push(data);
        })
        .error(function() {
          console.log("noo!");
        });
      });
    }

    $scope.edit = function (account) {
      var instance = $modal.open({ templateUrl: "editAccount.html",
        controller: 'ModalAccountCtrl',
        resolve: { form: function() { return account; } }
      });
      instance.result.then(function(data) {
        $http.put("/api/accounts/"+account._id, data)
        .success(function(data){ })
        .error(function() {
          console.log("failed to edit account!");
        });
      });
    }

    $scope.deleteAccount = function (account) {
      $http.delete("/api/accounts/" + account._id)
      .success(function () {
        $scope.accounts = $scope.accounts.filter( function (x) { return x._id !== account._id; } )
      });
    }

    $scope.upload = function(account) {
      var instance = $modal.open({ templateUrl: "Upload.html",
        controller: 'AccountUploadCtrl',
        resolve: {
          form: function() { return account; }
        }
      });
      instance.result.then(function(files) {
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          console.log(file);
          $scope.upload = $upload.upload({
            url: '/api/transaction/import',
            data: {file: file},
            file: file
          })      
          .progress(function(evt) {
            console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
          })
        .success(function(data, status, headers, config) {
        });
      }
      });
    }
  }]);

angular.module('cashApp')
  .controller('AccountUploadCtrl', ["$scope", "$modalInstance", "$upload", function ($scope, $modalInstance, $upload) {
    $scope.files=[];

    $scope.onFileSelect = function($files) {
      $scope.files = $files;
    };

    $scope.ok = function() {
      $modalInstance.close($scope.files);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }]);

angular.module('cashApp')
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
