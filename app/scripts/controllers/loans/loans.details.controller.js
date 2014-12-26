'use strict';


angular.module('angularjsApp').controller('LoansDetailsCtrl', function($route, REST_URL, LoanService, $timeout, $scope, dialogs) {
  console.log('LoansDetailsCtrl');
  $scope.clientId = $route.current.params.clientId;
  $scope.loanId = $route.current.params.loanId;
  $scope.step = 'create';
  $scope.isLoading = true;

  $scope.tabs = [
    {name: 'account', view: 'views/loans/details/loans.details.account.html', title: 'Loan Details', active: true, disabled: false},
    {name: 'summary', view: 'views/loans/details/loans.details.summary.html', title: 'Loan Summary', active: false, disabled: false},
    {name: 'repayment', view: 'views/loans/details/loans.details.repayment.html', title: 'Repayment Schedule', active: false, disabled: false},
    {name: 'transaction', view: 'views/loans/details/loans.details.transaction.html', title: 'Transaction History', active: false, disabled: false},
    {name: 'charges', view: 'views/loans/details/loans.details.charges.html', title: 'Charges', active: false, disabled: false},
    {name: 'collateral', view: 'views/loans/details/loans.details.collateral.html', title: 'Collateral', active: false, disabled: false},
    {name: 'guarantor', view: 'views/loans/details/loans.details.guarantor.html', title: 'Guarantor Info', active: false, disabled: true},
    {name: 'notes', view: 'views/loans/details/loans.details.notes.html', title: 'Notes', active: false, disabled: true}
  ];

  $scope.selectTab = function(name) {
    _.each($scope.tabs, function(tab) {
      tab.active = tab.name === name;
      if (tab.active) {
        $scope.currentTab = tab;
      }
    });
    if (!$scope.currentTab) {
      $scope.currentTab = $scope.tabs[0];
      $scope.currentTab.active = true;
    }
  };

  $scope.selectTab($route.current.params.tab);
  function updateLoanDetails() {
    $scope.isLoading = true;
    LoanService.getData(REST_URL.LOANS_CREATE + '/' + $scope.loanId + '?associations=all').then(function(result) {
      $scope.loanDetails = result.data;
      $scope.isLoading = false;
    });
  }
  updateLoanDetails();

  $scope.$watch('transactionTab.hideAccrualTransactions', function() {
    filterTransactions();
  });
  $scope.initTab = function(tab) {
    if (!tab || !tab.name) {
      return;
    }
    if (tab.name === 'transaction') {
      initTransactions();
    } else if (tab.name === 'charges') {
      initCharges();
    }
  };

  function initTransactions() {
    $scope.transactionTab = {};
    $scope.transactionTab.hideAccrualTransactions = true;
    filterTransactions();
  }

  function filterTransactions() {
    $timeout(function() {
      if (!$scope.loanDetails || !$scope.loanDetails.transactions) {
        return;
      }
      $scope.transactionTab.rowCollection = _.filter(angular.copy($scope.loanDetails.transactions), function(transaction) {
        if ($scope.transactionTab.hideAccrualTransactions) {
          return !transaction.type.accrual;
        }
        return true;
      });
    });
  }

  function initCharges() {
    $scope.chargesTab = {};
    $scope.chargesTab.loading = true;
    LoanService.getData(REST_URL.LOANS_CREATE + '/' + $scope.loanId + '/charges').then(function(result) {
      $scope.chargesTab.charges = result.data;
      $scope.chargesTab.loading = false;
    });
  }


  $scope.openCollateralDialog = function(collateral) {
    var dialog = dialogs.create('/views/loans/details/dialogs/loans.details.collateral.dialog.html', 'LoanDeatilsCollateralDialog', {collateral: collateral, loan: $scope.loanDetails}, {size: 'md', keyboard: true, backdrop: true});
    dialog.result.then(function(result) {
      console.log(result);
    });
  };
  $scope.removeCollateral = function(collateral) {
    var msg = 'You are about to remove Collateral <strong>' + collateral.type.name + '</strong>';
    var dialog = dialogs.create('/views/custom-confirm.html', 'CustomConfirmController', {msg: msg}, {size: 'sm', keyboard: true, backdrop: true});
    dialog.result.then(function(result) {
      if (result) {
        var index = $scope.loanDetails.collateral.indexOf(collateral);
        LoanService.removeLoan(REST_URL.LOANS_CREATE + '/' + $scope.loanDetails.id + '/collaterals/' + collateral.id).then(function() {
          $scope.type = 'alert-success';
          $scope.message = 'Collateral removed successfully.';
          $scope.errors = [];
          if (index >= -1) {
            $scope.loanDetails.collateral.splice(index, 1);
          } else {
            LoanService.getData(REST_URL.LOANS_CREATE + '/' + $scope.loanDetails.id + '/collaterals').then(function(result) {
              $scope.loan.collateral = result.data;
            });
          }
        }, function(result) {
          $scope.message = 'Cant remove collateral:' + result.data.defaultUserMessage;
          $scope.type = 'error';
          $scope.errors = result.data.errors;
        });
      }
    });
  };
  $scope.openTransactionDialog = function(action) {
    var dialog = dialogs.create('/views/loans/details/dialogs/loans.details.repayment.dialog.html', 'LoanDeatilsRepaymentDialog', {loan: $scope.loanDetails, action: action}, {size: 'lg', keyboard: true, backdrop: true});
    dialog.result.then(function() {
      updateLoanDetails();
    });
  };
});

angular.module('angularjsApp').controller('LoanDeatilsRepaymentDialog', function($route, REST_URL, LoanService, $timeout, $scope, $modalInstance, dialogs, data) {
  $scope.loan = data.loan;
  $scope.action = data.action;
  $scope.formData = {};
  $scope.isLoading = true;
  var url = REST_URL.LOANS_CREATE + '/' + $scope.loan.id + '/transactions/template?command=repayment';
  if ($scope.action === 'prepay') {
    url = REST_URL.LOANS_CREATE + '/' + $scope.loan.id + '/transactions/template?command=prepayLoan';
  }

  LoanService.getData(url).then(function(result) {
    $scope.data = result.data;
    $timeout(function() {
      if (result.data.date && result.data.date.length) {
        $scope.formData.transactionDate = new Date(result.data.date);
      }
      $scope.formData.transactionAmount = result.data.amount;
      $scope.isLoading = false;
    });
  });

  $scope.open = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.opened = true;
  };

  $scope.submit = function() {
    $scope.message = '';
    $scope.errors = [];
    if (!$scope.loanDetailsFormPrepay.$valid) {
      $scope.type = 'error';
      $scope.message = 'Highlighted fields are required';
      $scope.errors = [];
      return;
    }

    var data = angular.copy($scope.formData);
    data.locale = 'en';
    data.dateFormat = 'dd/MM/yyyy';
    if (typeof data.transactionDate === 'object') {
      var transactionDate = data.transactionDate;
      data.transactionDate = transactionDate.getDate() + '/' + (transactionDate.getMonth() + 1) + '/' + transactionDate.getFullYear();
    }
    function handleSuccess() {
      $scope.type = 'alert-success';
      $scope.message = 'Loan updated successfully.';
      $scope.errors = [];
      $timeout(function() {
        $modalInstance.close();
      }, 2000);
    }
    function handleFail(result) {
      $scope.message = 'Cant prepay loan:' + result.data.defaultUserMessage;
      $scope.type = 'error';
      $scope.errors = result.data.errors;
    }
    LoanService.saveLoan(REST_URL.LOANS_CREATE + '/' + $scope.loan.id + '/transactions?command=repayment', data).then(handleSuccess, handleFail);
  };
  $scope.cancel = function() {
    $modalInstance.dismiss();
  };
});

angular.module('angularjsApp').controller('LoanDeatilsCollateralDialog', function($route, REST_URL, LoanService, $timeout, $scope, $modalInstance, dialogs, data) {
  $scope.collateral = {};
  $scope.loan = data.loan;
  $scope.cancel = function() {
    $modalInstance.dismiss();
  };

  LoanService.getData(REST_URL.LOANS_CREATE + '/' + $scope.loan.id + '/collaterals/template').then(function(result) {
    $scope.data = result.data;
    if (data.collateral) {
      $timeout(function() {
        $scope.collateral.collateralTypeId = data.collateral.type.id;
        $scope.collateral.description = data.collateral.description;
        $scope.collateral.value = data.collateral.value;
        $scope.collateralId = data.collateral.id;
      });
    }
  });
  function updateLoanCollaterals() {
    LoanService.getData(REST_URL.LOANS_CREATE + '/' + $scope.loan.id + '/collaterals').then(function(result) {
      $scope.loan.collateral = result.data;
    });
  }
  updateLoanCollaterals();

  $scope.filterCollaterals = function(items) {
    return _.filter(items, function(item) {
      try {
        return parseInt($scope.collateral.collateralTypeId) === parseInt(item.id) || !_.find($scope.loan.collateral, function(collateral) {
          return collateral.type.id === item.id;
        });
      } catch (e) {
        console.log('Cant parse Collateral ID');
      }
    });
  };

  $scope.saveCollateral = function() {
    if (!$scope.loanDetailsFormCollateral.$valid) {
      $scope.type = 'error';
      $scope.message = 'Highlighted fields are required';
      $scope.errors = [];
      return;
    }
    var data = angular.copy($scope.collateral);
    data.locale = 'en';
    function handleSuccess() {
      $scope.type = 'alert-success';
      $scope.message = 'Collateral added successfully.';
      $scope.errors = [];
      $scope.collateral = {};
      updateLoanCollaterals();
      $modalInstance.close(true);
    }
    function handleFail(result) {
      $scope.message = 'Cant add collateral:' + result.data.defaultUserMessage;
      $scope.type = 'error';
      $scope.errors = result.data.errors;
    }
    if ($scope.collateralId) {
      LoanService.updateLoan(REST_URL.LOANS_CREATE + '/' + $scope.loan.id + '/collaterals/' + $scope.collateralId, data).then(handleSuccess, handleFail);
    } else {
      LoanService.saveLoan(REST_URL.LOANS_CREATE + '/' + $scope.loan.id + '/collaterals', data).then(handleSuccess, handleFail);
    }
  };
});
