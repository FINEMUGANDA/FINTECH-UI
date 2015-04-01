/* global moment */

'use strict';

angular.module('angularjsApp').controller('LoansFormCtrl', function($route, $scope) {
  console.log('LoansFormCtrl');
  $scope.clientId = $route.current.params.clientId;
  $scope.loanId = $route.current.params.loanId;
  $scope.step = 'create';

  $scope.tabs = [
    {name: 'create', view: 'views/loans/loans.form.create.tpl.html', title: 'Loan Application', active: true, disabled: true},
//    {name: 'charges', view: 'views/loans/loans.form.charges.tpl.html', title: 'Charges', active: false, disabled: true},
    {name: 'collateral', view: 'views/loans/loans.form.collateral.tpl.html', title: 'Collateral', active: false, disabled: true},
    {name: 'guarantor', view: 'views/loans/loans.form.guarantor.tpl.html', title: 'Guarantor', active: false, disabled: true}
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
});

angular.module('angularjsApp').controller('LoansFormCreateCtrl', function($route, $scope, APPLICATION, REST_URL, LoanService, $timeout, $location, Utility) {
  console.log('LoansFormCreateCtrl', $scope);
  $scope.loan = {};

  LoanService.getData(REST_URL.LOANS_PRODUCTS).then(function(result) {
    $scope.loanProducts = result.data;
  });

  function loadProductTemplate(productId, useTemplateData) {
    LoanService.getData(REST_URL.LOANS_TEMPLATES + '?templateType=individual&clientId=' + $scope.clientId + '&productId=' + productId).then(function(result) {
      var data = result.data;
      console.log('loadProductTemplate...', result.data);
      $scope.data = data;
      $scope.chargesCollection = data.charges;
      $scope.showDetails = true;
      if (useTemplateData) {
        $timeout(function() {
          $scope.loan.principal = data.principal;
          $scope.loan.numberOfRepayments = data.numberOfRepayments;
          $scope.loan.interestRatePerPeriod = data.interestRatePerPeriod;
          $scope.loan.repaymentEvery = data.repaymentEvery;
          $scope.loan.charges = _.map(data.charges, function(charge) {
            return _.pick(charge, ['amount', 'chargeId', 'chargeTimeType', 'chargeCalculationType']);
          });

          $scope.loan.loanTermFrequency = data.termFrequency;
          $scope.loan.loanTermFrequencyType = data.termPeriodFrequencyType.id;
          $scope.loan.repaymentFrequencyType = data.repaymentFrequencyType.id;
          $scope.loan.amortizationType = data.amortizationType.id;
          $scope.loan.interestCalculationPeriodType = data.interestCalculationPeriodType.id;
          $scope.loan.interestType = data.interestType.id;
          $scope.loan.transactionProcessingStrategyId = data.transactionProcessingStrategyId;

          if (data.timeline && data.timeline.expectedDisbursementDate) {
            //var expectedDisbursementDate = angular.copy(data.timeline.expectedDisbursementDate);
            //expectedDisbursementDate[1] = expectedDisbursementDate[1]-1;
            //$scope.loan.expectedDisbursementDate = moment.tz(expectedDisbursementDate, APPLICATION.TIMEZONE).format(APPLICATION.DF_MOMENT);
            $scope.loan.expectedDisbursementDate = Utility.toLocalDate(data.timeline.expectedDisbursementDate);
          }
        });
      }

      var $url = REST_URL.GROUP_TEMPLATE_RESOURCE + '?staffInSelectedOfficeOnly=true&officeId=' + $scope.data.clientOfficeId;
      LoanService.getData($url).then(function(officers) {
        $scope.data.officerOptions = officers.data;
      }, function(result) {
        $scope.type = 'error';
        $scope.message = 'Cant retrieve client officers options' + result.data.defaultUserMessage;
        $scope.errors = result.data.errors;
      });
    }, function(result) {
      $scope.type = 'error';
      $scope.message = 'Cant retrieve additional client info options' + result.data.defaultUserMessage;
      $scope.errors = result.data.errors;
    });
  }
  $scope.$watch('loan.productId', function(newVal, oldVal) {
    if (newVal > 0 && (oldVal || !$scope.loanId)) {
      console.log('Changed productId...');
      loadProductTemplate(newVal, true);
    }
  });

  if ($scope.loanId) {
    LoanService.getData(REST_URL.LOANS_CREATE + '/' + $scope.loanId).then(function(result) {
      var data = result.data;
      $scope.data = data;
      $scope.showDetails = true;
      $timeout(function() {
        $scope.loan.principal = data.principal;
        $scope.loan.loanOfficerId = data.loanOfficerId;
        $scope.loan.numberOfRepayments = data.numberOfRepayments;
        $scope.loan.interestRatePerPeriod = data.interestRatePerPeriod;
        $scope.loan.repaymentEvery = data.repaymentEvery;

        $scope.loan.loanTermFrequency = data.termFrequency;
        $scope.loan.loanTermFrequencyType = data.termPeriodFrequencyType.id;
        $scope.loan.repaymentFrequencyType = data.repaymentFrequencyType.id;
        $scope.loan.amortizationType = data.amortizationType.id;
        $scope.loan.interestCalculationPeriodType = data.interestCalculationPeriodType.id;
        $scope.loan.interestType = data.interestType.id;
        $scope.loan.transactionProcessingStrategyId = data.transactionProcessingStrategyId;
        $scope.loan.productId = data.loanProductId;
        loadProductTemplate(data.loanProductId);

        if (data.timeline) {
          if (data.timeline.expectedDisbursementDate) {
            //var expectedDisbursementDate = angular.copy(data.timeline.expectedDisbursementDate);
            //expectedDisbursementDate[1] = expectedDisbursementDate[1]-1;
            //$scope.loan.expectedDisbursementDate = moment.tz(expectedDisbursementDate, APPLICATION.TIMEZONE).format(APPLICATION.DF_MOMENT);
            $scope.loan.expectedDisbursementDate = Utility.toLocalDate(data.timeline.expectedDisbursementDate);
          }
          if (data.timeline.submittedOnDate) {
            //var submittedOnDate = angular.copy(data.timeline.submittedOnDate);
            //submittedOnDate[1] = submittedOnDate[1]-1;
            //$scope.loan.submittedOnDate = moment.tz(submittedOnDate, APPLICATION.TIMEZONE).format(APPLICATION.DF_MOMENT);
            $scope.loan.submittedOnDate = Utility.toLocalDate(data.timeline.submittedOnDate);
          }
        }
        LoanService.getData(REST_URL.LOANS_EXTRA_DETAILS + $scope.loanId).then(function(result) {
          if (result && result.data && result.data.length) {
            $scope.loanDetails = result.data[0];
            $scope.isAvailableLoanDetails = true;
          }
        });
      });
    }, function(result) {
      $scope.type = 'error';
      $scope.message = 'Cant retrieve additional client info options' + result.data.defaultUserMessage;
      $scope.errors = result.data.errors;
    });
  }
  $scope.datepicker = {};

  $scope.open = function($event, target) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.datepicker[target] = true;
  };
  $scope.saveLoan = function() {
    console.log('Saving loan...', $scope.loan);
    if (!$scope.loanFormCreate.$valid) {
      $scope.type = 'error';
      $scope.message = 'Highlighted fields are required';
      $scope.errors = [];
      $('html, body').animate({scrollTop: 0}, 800);
      return;
    }
    var data = angular.copy($scope.loan);
    data.locale = 'en';
    data.dateFormat = APPLICATION.DF_MIFOS;
    data.loanType = 'individual';
    data.clientId = $scope.clientId;

    if (typeof data.submittedOnDate === 'object') {
      console.log('DEBUG S: ' + data.submittedOnDate + ' - ' + Utility.toServerDate(data.submittedOnDate));
      //data.submittedOnDate = moment(data.submittedOnDate).tz(APPLICATION.TIMEZONE).format(APPLICATION.DF_MOMENT);
      data.submittedOnDate = Utility.toServerDate(data.submittedOnDate);
    }
    if (typeof data.expectedDisbursementDate === 'object') {
      console.log('DEBUG E: ' + data.expectedDisbursementDate + ' - ' + Utility.toServerDate(data.expectedDisbursementDate));
      //data.expectedDisbursementDate = moment(data.expectedDisbursementDate).tz(APPLICATION.TIMEZONE).format(APPLICATION.DF_MOMENT);
      data.expectedDisbursementDate = Utility.toServerDate(data.expectedDisbursementDate);
    }

    function saveLoanSuccess(result) {
      console.log('Saved successfuly...', result);

      var loanDetails = angular.copy($scope.loanDetails);
      var resultSuccess = function() {
        $scope.type = 'alert-success';
        $scope.message = 'Loan saved successfuly';
        $scope.errors = [];
        $location.url('/loans/' + $scope.clientId + '/form/collateral/' + result.data.loanId);
      };
      var resultFail = function() {
        $scope.type = 'error';
        $scope.message = 'Cant save loan details';
        $scope.errors = [];
      };
      var url = REST_URL.LOANS_EXTRA_DETAILS + result.data.loanId;
      if ($scope.isAvailableLoanDetails) {
        LoanService.updateLoan(url, loanDetails).then(resultSuccess, resultFail);
      } else {
        LoanService.saveLoan(url, loanDetails).then(resultSuccess, resultFail);
      }
    }

    function saveLoanFail(result) {
      console.log('Cant save loan...', result);
      $scope.type = 'error';
      $scope.message = 'Cant save loan: ' + result.data.defaultUserMessage;
      $scope.errors = result.data.errors;
    }
    if ($scope.loanId) {
      LoanService.updateLoan(REST_URL.LOANS_CREATE + '/' + $scope.loanId, data).then(saveLoanSuccess, saveLoanFail);
    } else {
      LoanService.saveLoan(REST_URL.LOANS_CREATE, data).then(saveLoanSuccess, saveLoanFail);
    }
  };
});

angular.module('angularjsApp').controller('LoansFormChargesCtrl', function($route, $scope, REST_URL, $timeout, LoanService, dialogs) {
  console.log('LoansFormCreateCtrl');
  $scope.rowCollection = [];
  $scope.loan = {};
  $scope.isLoading = false;

  $scope.filterChargeOptions = function(chargeOptions) {
    if (!chargeOptions || !$scope.loan.currency || !$scope.loanProduct) {
      return [];
    }
    var result = _.filter(chargeOptions, function(charge) {
      return _.every([
        charge.currency.code === $scope.loanProduct.currency.code,
        !_.find($scope.rowCollection, function(existingCharge) {
          var result = false;
          try {
            result = parseInt(existingCharge.chargeId) === parseInt(charge.id);
          } catch (e) {
            console.log('Cant parse charge id', e);
          }
          return result;
        })
      ]);
    });
    return result;
  };

  LoanService.getData(REST_URL.LOANS_CREATE + '/' + $scope.loanId).then(function(result) {
    $scope.loan = result.data;
    LoanService.getData(REST_URL.LOANS_PRODUCTS + '/' + $scope.loan.loanProductId).then(function(result) {
      $scope.loanProduct = result.data;
    });
  });

  LoanService.getData(REST_URL.LOANS_CREATE + '/' + $scope.loanId + '/charges/template').then(function(result) {
    $scope.data = result.data;
  });
  function updateLoanCharges() {
    LoanService.getData(REST_URL.LOANS_CREATE + '/' + $scope.loanId + '/charges').then(function(result) {
      $scope.rowCollection = result.data;
    });
  }
  updateLoanCharges();

  $scope.$watch('charge.chargeId', function(chargeId) {
    if (!chargeId) {
      return;
    }
    $scope.currentCharge = _.find($scope.data.chargeOptions, function(item) {
      var result = false;
      try {
        result = parseInt(item.id) === parseInt(chargeId);
      } catch (e) {
        console.log('Cant parse charge id...');
      }
      return result;
    });
    if (!$scope.currentCharge) {
      console.log('Charge amount is not founded!');
    } else {
      $scope.charge.amount = $scope.currentCharge.amount;
    }
  });

  $scope.addCharge = function() {
    if (!$scope.loanFormAddCharge.$valid) {
      $scope.type = 'error';
      $scope.message = 'Highlighted fields are required';
      $scope.errors = [];
      $('html, body').animate({scrollTop: 0}, 800);
      return;
    }
    var data = angular.copy($scope.charge);
    data.locale = 'en';
    LoanService.saveLoan(REST_URL.LOANS_CREATE + '/' + $scope.loanId + '/charges', data).then(function() {
      $scope.type = 'alert-success';
      $scope.message = 'Charge added successfully.';
      $scope.errors = [];
      $scope.charge = {};
      updateLoanCharges();
    }, function(result) {
      $scope.message = 'Cant add charge:' + result.data.defaultUserMessage;
      $scope.type = 'error';
      $scope.errors = result.data.errors;
    });
  };
  $scope.removeCharge = function(charge) {
    var msg = 'You are about to remove Charge <strong>' + charge.name + '</strong>';
    var dialog = dialogs.create('/views/custom-confirm.html', 'CustomConfirmController', {msg: msg}, {size: 'sm', keyboard: true, backdrop: true});
    dialog.result.then(function(result) {
      if (result) {
        var index = $scope.rowCollection.indexOf(charge);
        LoanService.removeLoan(REST_URL.LOANS_CREATE + '/' + $scope.loanId + '/charges/' + charge.id).then(function() {
          $scope.type = 'alert-success';
          $scope.message = 'Charge removed successfully.';
          $scope.errors = [];
          if (index >= -1) {
            $scope.rowCollection.splice(index, 1);
          } else {
            updateLoanCharges();
          }
        }, function(result) {
          $scope.message = 'Cant remove charge:' + result.data.defaultUserMessage;
          $scope.type = 'error';
          $scope.errors = result.data.errors;
        });
      }
    });

  };

});

angular.module('angularjsApp').controller('LoansFormCollateralCtrl', function($route, $location, $scope, REST_URL, $timeout, LoanService, dialogs) {
  console.log('LoansFormCreateCtrl');
  $scope.rowCollection = [];
  $scope.loan = {};
  $scope.isLoading = false;

  $scope.filterCollateralOptions = function(collateralOptions) {
    if (!collateralOptions) {
      return [];
    }
    return _.filter(collateralOptions, function(collateral) {
      return !_.find($scope.rowCollection, function(existingCollateral) {
        var result = false;
        try {
          result = parseInt(existingCollateral.type.id) === parseInt(collateral.id);
        } catch (e) {
          console.log('Cant parse collateral id', e);
        }
        return result;
      });
    });
  };

  $scope.resetCollateral = function() {
    $scope.collateral = {};
  };

  $scope.goGuarantor = function() {
    if($scope.saveCollateral()) {
      $location.path('/loans/' + $scope.clientId + '/form/guarantor/' + $scope.loanId);
    } else {
      $scope.type = 'error';
      $scope.message = 'Highlighted fields are required';
      $scope.errors = [];
    }
  };

  LoanService.getData(REST_URL.LOANS_CREATE + '/' + $scope.loanId).then(function(result) {
    $scope.loan = result.data;
    LoanService.getData(REST_URL.LOANS_PRODUCTS + '/' + $scope.loan.loanProductId).then(function(result) {
      $scope.loanProduct = result.data;
    });
  });

  LoanService.getData(REST_URL.LOANS_CREATE + '/' + $scope.loanId + '/collaterals/template').then(function(result) {
    $scope.data = result.data;
  });
  function updateLoanCollaterals() {
    LoanService.getData(REST_URL.LOANS_CREATE + '/' + $scope.loanId + '/collaterals').then(function(result) {
      $scope.rowCollection = result.data;
      if($scope.rowCollection && $scope.rowCollection.length>0) {
        $scope.collateral = $scope.rowCollection[0];
        $scope.collateral.collateralTypeId = $scope.collateral.type.id;
      }
    });
  }
  updateLoanCollaterals();

  $scope.saveCollateral = function() {
    if (!$scope.loanFormCollateral.$valid) {
      $scope.type = 'error';
      $scope.message = 'Highlighted fields are required';
      $scope.errors = [];
      $('html, body').animate({scrollTop: 0}, 800);
      return false;
    }
    var data = angular.copy($scope.collateral);
    data.locale = 'en';
    LoanService.saveLoan(REST_URL.LOANS_CREATE + '/' + $scope.loanId + '/collaterals', data).then(function() {
      $scope.type = 'alert-success';
      $scope.message = 'Collateral added successfully.';
      $scope.errors = [];
      $scope.collateral = {};
      updateLoanCollaterals();
    }, function(result) {
      $scope.message = 'Cant add charge:' + result.data.defaultUserMessage;
      $scope.type = 'error';
      $scope.errors = result.data.errors;
    });
    return true;
  };

  $scope.removeCollateral = function(collateral) {
    var msg = 'You are about to remove Collateral <strong>' + collateral.type.name + '</strong>';
    var dialog = dialogs.create('/views/custom-confirm.html', 'CustomConfirmController', {msg: msg}, {size: 'sm', keyboard: true, backdrop: true});
    dialog.result.then(function(result) {
      if (result) {
        var index = $scope.rowCollection.indexOf(collateral);
        LoanService.removeLoan(REST_URL.LOANS_CREATE + '/' + $scope.loanId + '/collaterals/' + collateral.id).then(function() {
          $scope.type = 'alert-success';
          $scope.message = 'Collateral removed successfully.';
          $scope.errors = [];
          if (index >= -1) {
            $scope.rowCollection.splice(index, 1);
          } else {
            updateLoanCollaterals();
          }
        }, function(result) {
          $scope.message = 'Cant remove collateral:' + result.data.defaultUserMessage;
          $scope.type = 'error';
          $scope.errors = result.data.errors;
        });
      }
    });

  };

});

angular.module('angularjsApp').controller('LoansFormGuarantorCtrl', function($route, $location, $scope, APPLICATION, REST_URL, $timeout, LoanService) {
  console.log('LoansFormCreateCtrl');
  $scope.rowCollection = [];
  $scope.loan = {};
  $scope.datepicker = {};
  $scope.isLoading = false;

  LoanService.getData(REST_URL.LOANS_CREATE + '/' + $scope.loanId).then(function(result) {
    $scope.loan = result.data;
    LoanService.getData(REST_URL.LOANS_PRODUCTS + '/' + $scope.loan.loanProductId).then(function(result) {
      $scope.loanProduct = result.data;
    });
  });

  LoanService.getData(REST_URL.LOANS_GUARANTOR_DETAILS + $scope.loanId + '?genericResultSet=true').then(function(result) {
    $scope.data = result.data;
    $scope.data.columnHeaders = _.indexBy(result.data.columnHeaders, 'columnName');
  });
  LoanService.getData(REST_URL.LOANS_GUARANTOR_DETAILS + $scope.loanId + '?genericResultSet=false').then(function(result) {
    if (result && result.data && result.data.length) {
      $timeout(function() {
        $scope.guarantor = result.data[0];
        var date = new Date(result.data[0].dateOfBirth[0], result.data[0].dateOfBirth[1] - 1, result.data[0].dateOfBirth[2]);
        $scope.guarantor.dateOfBirth = date;
//        $scope.guarantor.dateOfBirth = result.data[0].dateOfBirth[2] + '/' + result.data[0].dateOfBirth[1] + '/' + result.data[0].dateOfBirth[0];
      });
    }
  });

  $scope.saveGuarantor = function() {
    if (!$scope.loanFormGuarantor.$valid) {
      $scope.type = 'error';
      $scope.message = 'Highlighted fields are required';
      $scope.errors = [];
      $('html, body').animate({scrollTop: 0}, 800);
      return;
    }
    var json = angular.copy($scope.guarantor);
    json.locale = 'en';
    json.dateFormat = APPLICATION.DF_MIFOS;
    if (typeof json.dateOfBirth === 'object') {
      json.dateOfBirth = moment(json.dateOfBirth).format(APPLICATION.DF_MOMENT);
    }
    function saveGuarantorSuccess() {
      $scope.type = 'alert-success';
      $scope.message = 'Guarantor saved successfully.';
      $scope.errors = [];
      $scope.charge = {};
      $location.path('/clients');
//      updateLoanCharges();
    }
    function saveGuarantorFail(result) {
      $scope.message = 'Cant save guarantor:' + result.data.defaultUserMessage;
      $scope.type = 'error';
      $scope.errors = result.data.errors;
    }
    if ($scope.guarantor.loan_id) {
      LoanService.updateLoan(REST_URL.LOANS_GUARANTOR_DETAILS + $scope.loanId + '?tenantidentifier=default', angular.toJson(json)).then(saveGuarantorSuccess, saveGuarantorFail);
    } else {
      LoanService.saveLoan(REST_URL.LOANS_GUARANTOR_DETAILS + $scope.loanId + '?tenantidentifier=default', angular.toJson(json)).then(saveGuarantorSuccess, saveGuarantorFail);
    }
  };
  $scope.open = function($event, target) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.datepicker[target] = true;
  };

});
