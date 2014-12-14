'use strict';

angular.module('angularjsApp').controller('LoansFormCtrl', function($route, $scope) {
  console.log('LoansFormCtrl');
  $scope.clientId = $route.current.params.clientId;
  $scope.step = 'create';

  $scope.tabs = [
    {name: 'create', view: 'views/loans/loans.form.create.html', title: 'Loan Application', active: true, disabled: true},
    {name: 'charges', view: 'views/loans/loans.form.charges.html', title: 'Charges', active: false, disabled: true},
    {name: 'collateral', view: 'views/loans/loans.form.collateral.html', title: 'Collateral', active: false, disabled: true},
    {name: 'guarantor', view: 'views/loans/loans.form.guarantor.html', title: 'Guarantor', active: false, disabled: true}
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

});
angular.module('angularjsApp').controller('LoansFormCreateCtrl', function($route, $scope, REST_URL, LoanService, $timeout) {
  console.log('LoansFormCreateCtrl', $scope);
  $scope.loan = {};
  LoanService.getData(REST_URL.LOANS_PRODUCTS).then(function(result) {
    $scope.loanProducts = result.data;
  });
  $scope.$watch('loan.productId', function(newVal) {
    if (newVal > 0) {
      LoanService.getData(REST_URL.LOANS_TEMPLATES + '?templateType=individual&clientId=' + $scope.clientId + '&productId=' + newVal).then(function(result) {
        var data = result.data;
        $scope.data = data;
        $scope.showDetails = true;
        $timeout(function() {
          $scope.loan.principal = data.principal;
          $scope.loan.numberOfRepayments = data.numberOfRepayments;
          $scope.loan.interestRatePerPeriod = data.interestRatePerPeriod;
          $scope.loan.repaymentEvery = data.repaymentEvery;

          $scope.loan.loanTermFrequency = data.termFrequency;
          $scope.loan.loanTermFrequencyType = data.termPeriodFrequencyType.id;
          $scope.loan.repaymentFrequencyType = data.repaymentFrequencyType.id;
          $scope.loan.amortizationType = data.amortizationType.id;
          $scope.loan.interestCalculationPeriodType = data.interestCalculationPeriodType.id;
          $scope.loan.interestType = data.interestType.id;
//          $scope.loan.interestRateFrequencyType = data.interestRateFrequencyType.id;
          $scope.loan.transactionProcessingStrategyId = data.transactionProcessingStrategyId;

          if (data.timeline && data.timeline.expectedDisbursementDate) {
            var expectedDisbursementDate = new Date(data.timeline.expectedDisbursementDate);
            $scope.loan.expectedDisbursementDate = expectedDisbursementDate.getDate() + '/' + (expectedDisbursementDate.getMonth() + 1) + '/' + expectedDisbursementDate.getFullYear();
          }
        });
      }, function(result) {
        $scope.type = 'error';
        $scope.message = 'Cant retrieve additional client info options' + result.data.defaultUserMessage;
        $scope.errors = result.data.errors;
      });
    }
  });
  $scope.datepicker = {};

  $scope.open = function($event, target) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.datepicker[target] = true;
  };
  $scope.saveLoan = function() {
    console.log('Saving loan...', $scope.loan);
    var data = angular.copy($scope.loan);
    data.locale = 'en';
    data.dateFormat = 'dd/MM/yyyy';
    data.loanType = 'individual';
    data.clientId = $scope.clientId;
    var submittedDate = new Date(data.submittedOnDate);
    data.submittedOnDate = submittedDate.getDate() + '/' + (submittedDate.getMonth() + 1) + '/' + submittedDate.getFullYear();
    var expectedDisbursementDate = new Date($scope.loan.expectedDisbursementDate);
    data.expectedDisbursementDate = expectedDisbursementDate.getDate() + '/' + (expectedDisbursementDate.getMonth() + 1) + '/' + expectedDisbursementDate.getFullYear();

    LoanService.saveLoan(REST_URL.LOANS_CREATE, data).then(function(result) {
      console.log('Saved successfuly...', result);
      $scope.type = 'alert-success';
      $scope.message = 'Loan saved successfuly';
      $scope.errors = [];
    }, function(result) {
      console.log('Cant save loan...', result);
      $scope.type = 'error';
      $scope.message = 'Cant save loan: ' + result.data.defaultUserMessage;
      $scope.errors = result.data.errors;
    });
  };
});
