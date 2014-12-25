'use strict';


angular.module('angularjsApp').controller('LoansDetailsCtrl', function($route, REST_URL, LoanService, $timeout, $scope) {
  console.log('LoansDetailsCtrl');
  $scope.clientId = $route.current.params.clientId;
  $scope.loanId = $route.current.params.loanId;
  $scope.step = 'create';

  $scope.tabs = [
    {name: 'account', view: 'views/loans/details/loans.details.account.html', title: 'Loan Details', active: true, disabled: false},
    {name: 'summary', view: 'views/loans/details/loans.details.summary.html', title: 'Loan Summary', active: false, disabled: false},
    {name: 'repayment', view: 'views/loans/details/loans.details.repayment.html', title: 'Repayment Schedule', active: false, disabled: false},
    {name: 'transaction', view: 'views/loans/details/loans.details.transaction.html', title: 'Transaction History', active: false, disabled: false},
    {name: 'charges', view: 'views/loans/details/loans.details.charges.html', title: 'Charges', active: false, disabled: false},
    {name: 'collateral', view: 'views/loans/details/loans.details.collateral.html', title: 'Collateral', active: false, disabled: true},
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

  LoanService.getData(REST_URL.LOANS_CREATE + '/' + $scope.loanId + '?associations=all').then(function(result) {
    $scope.loanDetails = result.data;
  });

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
      console.log(result.data);
      $scope.chargesTab.charges = result.data;
      $scope.chargesTab.loading = false;
    });
  }
});
