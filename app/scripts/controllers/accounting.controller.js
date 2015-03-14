'use strict';

angular.module('angularjsApp').controller('AccountingChartCtrl', function($scope, REST_URL, AccountService, $timeout, $location, dialogs) {
  console.log('AccountingChartCtrl');
  $scope.isLoading = false;
  $scope.itemsByPage = 10;
  $scope.isTreeview = false;

  //Success callback
  var loadAccountsSuccess = function(result) {
    $scope.isLoading = false;
    try {
      $scope.rowCollection = result.data;
      $scope.treedata = buildTreeData(result.data);
    } catch (e) {
    }
  };

  //failur callback
  var loadAccountsFail = function(result) {
    $scope.isLoading = false;
    console.log('Error : Return from AccountService service.' + result);
  };

  var loadAccounts = function getData() {
    $scope.isLoading = true;
    $timeout(
      function() {
        $scope.rowCollection = [];
        //service to get accounts from server
        AccountService.getData(REST_URL.ACCOUNT_LIST).then(loadAccountsSuccess, loadAccountsFail);
      }, 2000);
  };

  loadAccounts();

  function buildTreeData(data) {
    var map = {}, item, result = {};
    for (var i = 0; i < data.length; i += 1) {
      item = data[i];
      item.children = [];
      item.collapsed = true;
      item.name =  item.name + ' (' + item.glCode + ')';
      map[item.id] = i;
      if (item.parentId && item.parentId !== '0') {
        data[map[item.parentId]].children.push(item);
      } else {
        if (!result[item.type.value]) {
          result[item.type.value] = {name: item.type.value + ' (' + item.glCode.substr(0, 1) + '0000)', children: [], collapsed: true};
        }
        result[item.type.value].children.push(item);
      }
    }
    return result;
  }

  $scope.treeview = {};
  $scope.treeview.selectNodeLabel = function(selectedNode) {
    if ($scope.treeview.currentNode && $scope.treeview.currentNode.selected) {
      $scope.treeview.currentNode.selected = undefined;
    }
    selectedNode.selected = 'selected';
    $scope.treeview.currentNode = selectedNode;
    $scope.treeview.currentNode.collapsed = !$scope.treeview.currentNode.collapsed;
  };

  $scope.editAccount = function(account) {
    $location.path('/accounting/edit/' + account.id);
  };
  $scope.removeAccount = function(account) { 
    var msg = 'You are about to remove Account <strong>' + account.name + '</strong>';
    var dialog = dialogs.create('/views/custom-confirm.html', 'CustomConfirmController', {msg: msg}, {size: 'sm', keyboard: true, backdrop: true});
    dialog.result.then(function(result) {
      if (result) {
        var index = $scope.rowCollection.indexOf(account);
        AccountService.removeAccount(REST_URL.ACCOUNT_BY_ID + account.id).then(function() {
          if (index >= -1) {
            $scope.rowCollection.splice(index, 1);
          }
        }, function(result) {
          $scope.type = 'error';
          $scope.message = 'Account not removed: ' + result.data.defaultUserMessage;
          $scope.errors = result.data.errors;
          $('html, body').animate({scrollTop: 0}, 800);
        });
      }
    });
  };
});

angular.module('angularjsApp').controller('AccountingEditCtrl', function($scope, REST_URL, AccountService, CurrencyService, $timeout, $route) {
  console.log('AccountingEditCtrl');
  $scope.isLoading = false;
  $scope.id = $route.current.params.id;
  $scope.data = {};

  //Success callback
  var loadAccountSuccess = function(result) {
    $scope.isLoading = false;
    try {
      $scope.rowCollection = result.data;
      $scope.account = {
        name: result.data.name,
        currencyCode: result.data.currencyCode,
        glCode: result.data.glCode,
        manualEntriesAllowed: result.data.manualEntriesAllowed,
        type: result.data.type.id,
        parentId: result.data.parentId,
        usage: result.data.usage.id,
        description: result.data.description
      };
      if (result.data.tagId) {
        $scope.account.tagId = result.data.tagId;
      }
      $scope.data = _.extend({}, result.data);
    } catch (e) {
      console.log(e);
    }
  };

  // Watch for account type updates and fill account header accounts for selected type
  $scope.$watch('account.type', function(newVal) {
    var type = _.find($scope.data.accountTypeOptions, function(typeOption) {
      var eq = false;
      try {
        eq = parseInt(typeOption.id) === parseInt(newVal);
      } catch (e) {
        console.log('Can\'t parse accountTypeId', e);
      }
      return eq;
    });
    $scope.headerAccountOptions = [];
    if (!type) {
      return;
    }
    var accounts = $scope.data[type.value.toLowerCase() + 'HeaderAccountOptions'];
    if (accounts && accounts.length) {
      if ($scope.id) {
        accounts = _.filter(accounts, function(account) {
          return parseInt(account.id) !== parseInt($scope.id);
        });
      }
      $scope.headerAccountOptions = accounts;
    }
  });

  //failur callback
  var loadAccountFail = function(result) {
    $scope.isLoading = false;
    console.log('Error : Return from AccountService service.' + result);
  };

  var loadAccount = function getData() {
    $scope.isLoading = true;

    $timeout(
      function() {
        var url = REST_URL.ACCOUNT_TEMPLATE;
        if ($scope.id) {
          url = REST_URL.ACCOUNT_BY_ID + $scope.id + '?template=true';
        }
        //service to get accounts from server
        AccountService.getData(url).then(loadAccountSuccess, loadAccountFail);
      }, 2000);
  };

  $scope.saveAccount = function() {
    if ($scope.accountform.$valid) {
      var saveAccountSuccess = function(result) {
        console.log('Success : Return from AccountService service.');
        $scope.type = 'alert-success';
        $scope.message = 'Account saved successfully';
        $scope.errors = [];
        if (!$scope.id) {
          loadAccount();// load updatedData
        } else {
          $scope.id = result.data.resourceId;
        }
      };

      var saveAccountFail = function(result) {
        console.log('Error : Return from AccountService service.');
        $scope.type = 'error';
        $scope.message = 'Account not saved: ' + result.data.defaultUserMessage;
        $scope.errors = result.data.errors;
        $('html, body').animate({scrollTop: 0}, 800);
      };

      $scope.message = undefined; //hide alert message if exist
      if ($scope.id) {
        AccountService.updateAccount(REST_URL.ACCOUNT_UPDATE_BY_ID + $scope.id, angular.copy($scope.account)).then(saveAccountSuccess, saveAccountFail);
      } else {
        AccountService.saveAccount(REST_URL.ACCOUNT_CREATE, angular.copy($scope.account)).then(saveAccountSuccess, saveAccountFail);
      }
    } else {
      $scope.accountform.invalidate = true;
      $scope.type = 'error';
      $scope.message = 'Highlighted fields are required';
      $('html, body').animate({scrollTop: 0}, 800);
    }
  };

  loadAccount();

  CurrencyService.getData(REST_URL.CURRENCY_LIST).then(function(result) {
    //$scope.formData.base = result.data.base;
    $scope.currencyOptions = result.data.selectedCurrencyOptions;
  }, function() {
    // TODO: error handling
  });
});
