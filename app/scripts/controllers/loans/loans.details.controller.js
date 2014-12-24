'use strict';


angular.module('angularjsApp').controller('LoansDetailsCtrl', function($route, REST_URL, LoanService, $timeout, $scope) {
  console.log('LoansDetailsCtrl');
  $scope.clientId = $route.current.params.clientId;
  $scope.loanId = $route.current.params.loanId;
  $scope.step = 'create';

  $scope.tabs = [
    {name: 'account', view: 'views/loans/details/loans.details.account.html', title: 'Loan Details', active: true, disabled: true},
    {name: 'summary', view: 'views/loans/details/loans.details.summary.html', title: 'Loan Summary', active: false, disabled: true},
    {name: 'repayment', view: 'views/loans/details/loans.details.repayment.html', title: 'Repayment Schedule', active: false, disabled: true},
    {name: 'transaction', view: 'views/loans/details/loans.details.transaction.html', title: 'Transaction History', active: false, disabled: true},
    {name: 'charges', view: 'views/loans/details/loans.details.charges.html', title: 'Charges', active: false, disabled: true},
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

  $scope.enableTabs = function() {
    _.each($scope.tabs, function(tab) {
      tab.disabled = false;
    });
  };
  if ($scope.loanId) {
    $scope.enableTabs();
  }
  $scope.selectTab($route.current.params.tab);

  LoanService.getData(REST_URL.LOANS_CREATE + '/' + $scope.loanId + '?associations=all').then(function(result) {
    $scope.loanDetails = result.data;
  });
});
