/* global moment */

'use strict';


angular.module('angularjsApp').controller('LoansDetailsCtrl', function($route, REST_URL, LoanService, DataTransferService, $timeout, $scope, dialogs, Utility) {
  console.log('LoansDetailsCtrl');
  $scope.clientId = $route.current.params.clientId;
  $scope.loanId = $route.current.params.loanId;
  $scope.step = 'create';
  $scope.isLoading = true;
  $scope.itemsByPage = 10;

  function updateActiveState(statusCode) {
    var STATUS_CODE = {
      '100': 'loansPendingApproval',
      '200': 'loansAwaitingDisbursement',
      '300': 'loans',
      '400': 'closed',
      '500': 'loansRejected',
      '600': 'closed',
      '601': 'loansWrittenOff',
      '602': 'loans',
      '700': 'loans',
      '800': 'loans',
      '900': 'loans'
    };
    $timeout(function() {
      $scope.active = STATUS_CODE[statusCode + ''];
    });
  }

  $scope.tabs = [
    {name: 'account', view: 'views/loans/details/loans.details.account.tpl.html', title: 'Loan Details', active: true, disabled: false},
    {name: 'summary', view: 'views/loans/details/loans.details.summary.tpl.html', title: 'Loan Summary', active: false, disabled: false},
    {name: 'repayment', view: 'views/loans/details/loans.details.repayment.tpl.html', title: 'Repayment Schedule', active: false, disabled: false},
    {name: 'transaction', view: 'views/loans/details/loans.details.transaction.tpl.html', title: 'Transaction History', active: false, disabled: false},
    {name: 'charges', view: 'views/loans/details/loans.details.charges.tpl.html', title: 'Charges', active: false, disabled: false},
    {name: 'penalty', view: 'views/loans/details/loans.details.penalty.tpl.html', title: 'Late Payment Interest', active: false, disabled: true},
    {name: 'collateral', view: 'views/loans/details/loans.details.collateral.tpl.html', title: 'Collateral', active: false, disabled: false},
    {name: 'guarantor', view: 'views/loans/details/loans.details.guarantor.tpl.html', title: 'Guarantor Info', active: false, disabled: false},
    {name: 'notes', view: 'views/loans/details/loans.details.notes.tpl.html', title: 'Follow Up Notes', active: false, disabled: false}
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

  function updateLoanDetails(cb) {
    cb = cb || angular.noop;
    $scope.isLoading = true;
    LoanService.getData(REST_URL.LOANS_CREATE + '/' + $scope.loanId + '?associations=all').then(function(result) {
      $scope.loanDetails = result.data;
      _.map($scope.loanDetails.repaymentSchedule.periods, function(period) {
        if (period.obligationsMetOnDate && period.dueDate) {
          period._daysLate = moment(period.obligationsMetOnDate).diff(period.dueDate, 'days');
        } else {
          period._daysLate = 0;
        }
        return period;
      });
      LoanService.getData(REST_URL.LOANS_EXTRA_DETAILS + $scope.loanId).then(function(result) {
        if (result && result.data && result.data.length) {
          _.extend($scope.loanDetails, result.data[0]);
        }
        window.loanDetails = angular.copy($scope.loanDetails);
        var paymentCount = _.filter($scope.loanDetails.repaymentSchedule.periods, function(p) {
          return p.complete;
        }).length;

        var currentTime = (new Date()).getTime();
        var missedPaymentCount = _.filter($scope.loanDetails.repaymentSchedule.periods, function(p) {
          if (p.complete) {
            return p.totalPaidLateForPeriod > 0;
          } else {
            return p.period && (currentTime > (new Date(p.dueDate)).getTime());
          }
        }).length;

        var lastScheduledPayment = _.max($scope.loanDetails.repaymentSchedule.periods, 'period');

        $scope.loanDetails.additionalLoanInfo = {
          paymentCount: paymentCount,
          missedPaymentCount: missedPaymentCount,
          maturityDate: lastScheduledPayment.dueDate
        };
        initCharges();
      });
      updateActiveState(result.data.status.id || 300 || 800 || 900);
      $scope.isLoading = false;
      cb();
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
    } else if (tab.name === 'guarantor') {
      initGuarantor();
    }
  };
  $scope.transactionTab = {};
  function initTransactions() {
    $scope.transactionTab.hideAccrualTransactions = false;
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
    $scope.penaltyTab = {};
    $scope.penaltyTab.loading = true;
    LoanService.getData(REST_URL.LOANS_CREATE + '/' + $scope.loanId + '/charges').then(function(result) {
      var charges = result.data;

      $scope.chargesTab.charges = _.filter(charges, function(charge) {
        return !charge.penalty;
      });
      $scope.penaltyTab.charges = _.filter(charges, function(charge) {
        return charge.penalty;
      });
      var penaltyTab = _.find($scope.tabs, function(tab) {
        return tab.name === 'penalty';
      });
      console.log($scope.penaltyTab.charges);
      penaltyTab.disabled = !$scope.penaltyTab.charges.length;

      $scope.chargesTab.loading = false;
      $scope.penaltyTab.loading = false;
    });
  }

  function initGuarantor() {
    $scope.guarantorTab = {};
    $scope.guarantorTab.loading = true;
    LoanService.getData(REST_URL.LOANS_GUARANTOR_DETAILS + $scope.loanId + '?genericResultSet=true').then(function(result) {
      $scope.guarantorTab.data = result.data;
      $scope.guarantorTab.data.columnHeaders = _.indexBy(result.data.columnHeaders, 'columnName');
      LoanService.getData(REST_URL.LOANS_GUARANTOR_DETAILS + $scope.loanId + '?genericResultSet=false').then(function(result) {
        if (result && result.data && result.data.length) {
          $timeout(function() {
            $scope.guarantorTab.guarantor = result.data[0];
          });
        }
        $scope.guarantorTab.loading = false;
      });
    });
  }

  $scope.openGuarantorDialog = function() {
    var dialog = dialogs.create('/views/loans/details/dialogs/loans.details.guarantor.dialog.html', 'LoanDeatilsGuarantorDialog', {guarantor: $scope.guarantorTab.guarantor, loan: $scope.loanDetails, data: $scope.guarantorTab.data}, {size: 'lg', keyboard: true, backdrop: true});
    dialog.result.then(function() {
      initGuarantor();
    });
  };
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
  $scope.openTransactionDialog = function(action, transaction) {
    var dialog = dialogs.create('/views/loans/details/dialogs/loans.details.repayment.dialog.html', 'LoanDeatilsRepaymentDialog', {loan: $scope.loanDetails, action: action, transaction: transaction}, {size: 'lg', keyboard: true, backdrop: true});
    dialog.result.then(function() {
      updateLoanDetails(filterTransactions);
    });
  };
  $scope.openWriteOffDialog = function() {
    var dialog = dialogs.create('/views/loans/details/dialogs/loans.details.writeoff.dialog.html', 'LoanDeatilsWriteOffDialog', {loan: $scope.loanDetails}, {size: 'md', keyboard: true, backdrop: true});
    dialog.result.then(function() {
      updateLoanDetails();
    });
  };
  $scope.toggleWatchlist = function() {
    $scope.isLoading = true;
    var command = $scope.loanDetails.watchlist ? 'unwatch' : 'watch';
    LoanService.saveLoan(REST_URL.LOANS_CREATE + '/' + $scope.loanDetails.id + '/transactions?command=' + command).then(function() {
      $scope.isLoading = false;
      updateLoanDetails();
    }, function(result) {
      $scope.isLoading = false;
      $scope.message = 'Cannot change watchlist:' + result.data.defaultUserMessage;
      $scope.type = 'error';
      $scope.errors = result.data.errors;
    });
  };
  $scope.undoWriteOff = function() {
    $scope.isLoading = true;
    LoanService.saveLoan(REST_URL.LOANS_CREATE + '/' + $scope.loanDetails.id + '/transactions?command=undoWriteOff').then(function() {
      $scope.isLoading = false;
      updateLoanDetails();
    }, function(result) {
      $scope.isLoading = false;
      $scope.message = 'Cannot undo write off:' + result.data.defaultUserMessage;
      $scope.type = 'error';
      $scope.errors = result.data.errors;
    });
  };
  $scope.openDisbursalUndoDialog = function() {
    var dialog = dialogs.create('/views/loans/details/dialogs/loans.details.disbursalundo.dialog.html', 'LoanDetailsDisbursalUndoDialog', {loan: $scope.loanDetails}, {size: 'md', keyboard: true, backdrop: true});
    dialog.result.then(function() {
      updateLoanDetails();
    });
  };
  $scope.openRescheduleDialog = function() {
    var dialog = dialogs.create('/views/loans/details/dialogs/loans.details.reschedule.dialog.html', 'LoanDetailsRescheduleDialog', {loan: $scope.loanDetails}, {size: 'md', keyboard: true, backdrop: true});
    dialog.result.then(function() {
      updateLoanDetails();
    });
  };

  if (DataTransferService.get('loan.payment.code')) {
    $timeout(function() {
      //console.log('DIALOG: ' + DataTransferService.get('loan.payment.code'));
      $scope.openTransactionDialog(DataTransferService.get('loan.payment.code'));
      DataTransferService.set('loan.payment.code', null);
    }, 2000);
  } else if (DataTransferService.get('loan.detail.tab')) {
    $scope.selectTab(DataTransferService.get('loan.detail.tab'));
  }
});

angular.module('angularjsApp').controller('LoanDeatilsRepaymentDialog', function($route, APPLICATION, REST_URL, LoanService, $timeout, $scope, $modalInstance, dialogs, data, Utility) {
  $scope.loan = data.loan;
  $scope.action = data.action;
  $scope.transaction = data.transaction;
  $scope.formData = {};
  $scope.isLoading = true;
  var url = REST_URL.LOANS_CREATE + '/' + $scope.loan.id + '/transactions/template?command=repayment';
  if ($scope.action === 'prepay') {
    url = REST_URL.LOANS_CREATE + '/' + $scope.loan.id + '/transactions/template?command=prepayLoan';
  }
  if ($scope.action === 'adjust') {
    url = REST_URL.LOANS_CREATE + '/' + $scope.loan.id + '/transactions/' + $scope.transaction.id;
  }

  LoanService.getData(url).then(function(result) {
    $scope.data = result.data;
    $timeout(function() {
      if (result.data.date && result.data.date.length) {
        //$scope.formData.transactionDate = new Date(result.data.date);
        console.log('DEBUG T: ' + angular.toJson(result.data.date));
        $scope.formData.transactionDate = Utility.toLocalDate(result.data.date);
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
    data.dateFormat = APPLICATION.DF_MIFOS;
    if (typeof data.transactionDate === 'object') {
      //data.transactionDate = moment(data.transactionDate).tz(APPLICATION.TIMEZONE).format(APPLICATION.DF_MOMENT);
      data.transactionDate = Utility.toServerDate(data.transactionDate);
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
    if ($scope.transaction && $scope.transaction.id) {
      LoanService.saveLoan(REST_URL.LOANS_CREATE + '/' + $scope.loan.id + '/transactions/' + $scope.transaction.id, data).then(handleSuccess, handleFail);
    } else {
      LoanService.saveLoan(REST_URL.LOANS_CREATE + '/' + $scope.loan.id + '/transactions?command=repayment', data).then(handleSuccess, handleFail);
    }
  };
  $scope.cancel = function() {
    $modalInstance.dismiss();
  };
});

angular.module('angularjsApp').controller('LoanDeatilsRepaymentWeekDialog', function(REST_URL, LoanService, $scope, $modalInstance) {
  $scope.isLoading = true;

  LoanService.getData('api/v1/runreports/Repayments Due This Week').then(function(result) {
    $scope.payments = result.data;
    $scope.principalTotal = 0;
    $scope.interestTotal = 0;
    $scope.feesTotal = 0;
    $scope.lpiTotal = 0;
    $scope.paymentTotal = 0;
    angular.forEach($scope.payments, function(payment) {
      $scope.principalTotal = $scope.principalTotal + payment.principal_amount;
      $scope.interestTotal = $scope.interestTotal + payment.interest_amount;
      $scope.feesTotal = $scope.feesTotal + payment.fee_charges_amount;
      $scope.lpiTotal = $scope.lpiTotal + payment.penalty_charges_charged_derived;
      $scope.paymentTotal = $scope.paymentTotal + payment.principal_amount + payment.interest_amount + payment.fee_charges_amount + payment.penalty_charges_charged_derived;
    });
    $scope.isLoading = false;
  });

  $scope.cancel = function() {
    $modalInstance.dismiss();
  };
});

angular.module('angularjsApp').controller('LoanDeatilsDueVsCollectedDialog', function(REST_URL, LoanService, $scope, $modalInstance, dateFilter) {


  $scope.formData = {};
  $scope.formData.startDate = new Date();
  $scope.formData.startDate.setDate($scope.formData.startDate.getDate() - 7);
  $scope.formData.endDate = new Date();

  $scope.getData = function() {
    $scope.isLoading = true;
    var startDate = dateFilter($scope.formData.startDate, 'yyyy-MM-dd');
    var endDate = dateFilter($scope.formData.endDate, 'yyyy-MM-dd');
    LoanService.getData('api/v1/runreports/DueVsCollectedScreenResult?R_startDate=' + startDate + '&R_endDate=' + endDate).then(function(result) {
      $scope.data = result.data;
      $scope.totalDue = 0;
      $scope.totalCollected = 0;
      $scope.totalDiff = 0;
      $scope.totalDiffPercent = 0;
      _.each($scope.data, function(row) {
        $scope.totalDue += row['P+I+F due'];
        $scope.totalCollected += row['P+I+F collected'];
      });
      $scope.totalDiff += $scope.totalDue - $scope.totalCollected;
      $scope.totalDiffPercent += ($scope.totalCollected / $scope.totalDue) * 100;
      $scope.isLoading = false;
    });
  };
  $scope.getData();

  $scope.cancel = function() {
    $modalInstance.dismiss();
  };
});

angular.module('angularjsApp').controller('LoanDeatilsWriteOffDialog', function($route, APPLICATION, REST_URL, LoanService, $timeout, $scope, $modalInstance, dialogs, data, Utility) {
  $scope.loan = data.loan;
  $scope.action = data.action;
  $scope.formData = {};
  $scope.isLoading = true;
  var url = REST_URL.LOANS_CREATE + '/' + $scope.loan.id + '/transactions/template?command=writeoff';
  LoanService.getData(url).then(function(result) {
    $scope.data = result.data;
    $timeout(function() {
      if (result.data.date && result.data.date.length) {
        //$scope.formData.transactionDate = new Date(result.data.date);
        console.log('DEBUG WO: ' + angular.toJson(result.data.date));
        $scope.formData.transactionDate = Utility.toLocalDate(result.data.date);
      }
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
    if (!$scope.loanDetailsFormWriteOff.$valid) {
      $scope.type = 'error';
      $scope.message = 'Highlighted fields are required';
      $scope.errors = [];
      return;
    }

    var data = angular.copy($scope.formData);
    data.locale = 'en';
    data.dateFormat = APPLICATION.DF_MIFOS;
    if (typeof data.transactionDate === 'object') {
      //data.transactionDate = moment(data.transactionDate).tz(APPLICATION.TIMEZONE).format(APPLICATION.DF_MOMENT);
      data.transactionDate = Utility.toServerDate(data.transactionDate);
    }
    function handleSuccess() {
      $scope.type = 'alert-success';
      $scope.message = 'Loan write off was processed successfully';
      $scope.errors = [];
      LoanService.saveLoan(REST_URL.CREATE_CLIENT + '/' + $scope.loan.clientId + '?command=close', {locale: 'en', dateFormat: APPLICATION.DF_MIFOS, closureDate: Utility.toServerDate(new Date()), closureReasonId: '15'}).then(function() {
        $timeout(function() {
          $modalInstance.close();
        }, 2000);
      }, function() {
        $timeout(function() {
          $modalInstance.close();
        }, 2000);
      });
    }
    function handleFail(result) {
      $scope.message = 'Cant write off loan: ' + result.data.defaultUserMessage;
      $scope.type = 'error';
      $scope.errors = result.data.errors;
    }
    LoanService.saveLoan(REST_URL.LOANS_CREATE + '/' + $scope.loan.id + '/transactions?command=writeoff', data).then(handleSuccess, handleFail);
  };
  $scope.cancel = function() {
    $modalInstance.dismiss();
  };
});

angular.module('angularjsApp').controller('LoanDetailsDisbursalUndoDialog', function($route, APPLICATION, REST_URL, LoanService, $timeout, $scope, $modalInstance, dialogs, data) {
  $scope.loan = data.loan;
  $scope.action = data.action;
  $scope.formData = {};
  $scope.isLoading = false;

  $scope.open = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.opened = true;
  };

  $scope.submit = function() {
    $scope.message = '';
    $scope.errors = [];
    if (!$scope.loanDetailsFormDisbursalUndo.$valid) {
      $scope.type = 'error';
      $scope.message = 'Highlighted fields are required';
      $scope.errors = [];
      return;
    }

    function handleSuccess() {
      $scope.type = 'alert-success';
      $scope.message = 'Loan disbursal undo was processed successfully';
      $scope.errors = [];
      $timeout(function() {
        $modalInstance.close();
      }, 2000);
    }
    function handleFail(result) {
      $scope.message = 'Cannot undo loan disbursal: ' + result.data.defaultUserMessage;
      $scope.type = 'error';
      $scope.errors = result.data.errors;
    }
    LoanService.saveLoan(REST_URL.LOANS_CREATE + '/' + $scope.loan.id + '?command=undoDisbursal', $scope.formData).then(handleSuccess, handleFail);
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

angular.module('angularjsApp').controller('LoanDeatilsGuarantorDialog', function($route, APPLICATION, REST_URL, LoanService, $timeout, $scope, $modalInstance, dialogs, data) {
  $scope.loan = data.loan;
  $scope.guarantor = data.guarantor || {};
  $scope.data = data.data;
  if ($scope.guarantor.dateOfBirth) {
    $scope.guarantor.dateOfBirth = new Date($scope.guarantor.dateOfBirth);
  }
  $scope.datepicker = {};
  $scope.cancel = function() {
    $modalInstance.dismiss();
  };

  $scope.saveGuarantor = function() {
    if (!$scope.loanFormGuarantor.$valid) {
      $scope.type = 'error';
      $scope.message = 'Highlighted fields are required';
      $scope.errors = [];
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
      $timeout(function() {
        $modalInstance.close();
      }, 2000);
    }
    function saveGuarantorFail(result) {
      $scope.message = 'Cant save guarantor:' + result.data.defaultUserMessage;
      $scope.type = 'error';
      $scope.errors = result.data.errors;
    }
    if ($scope.guarantor.loan_id) {
      LoanService.updateLoan(REST_URL.LOANS_GUARANTOR_DETAILS + $scope.loan.id + '?tenantidentifier=default', angular.toJson(json)).then(saveGuarantorSuccess, saveGuarantorFail);
    } else {
      LoanService.saveLoan(REST_URL.LOANS_GUARANTOR_DETAILS + $scope.loan.id + '?tenantidentifier=default', angular.toJson(json)).then(saveGuarantorSuccess, saveGuarantorFail);
    }
  };
  $scope.open = function($event, target) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.datepicker[target] = true;
  };
});


angular.module('angularjsApp').controller('LoanDetailsNoteCtrl', function($scope, $timeout, REST_URL, LoanService, DataTransferService, dialogs) {
  $scope.notesTab = {};
  $scope.notesTab.itemsByPage = 10;
  $scope.notesTab.loading = true;

  function updateNotes() {
    $scope.notesTab.loading = true;
    LoanService.getData(REST_URL.NOTES + $scope.loanId + '').then(function(result) {
      $scope.rowCollection = result.data;
      $scope.notesTab.loading = false;
    });
  }

  updateNotes();

  $scope.openNoteDialog = function(note) {
    var dialog = dialogs.create('views/loans/details/dialogs/loans.details.note.dialog.tpl.html', 'LoanDeatilsNoteDialog', {note: note, loan: $scope.loanDetails, data: $scope.notesTab.data}, {size: 'md', keyboard: true, backdrop: true});
    dialog.result.then(function() {
      updateNotes();
    });
  };
  $scope.removeNote = function(note) {
    var msg = 'You are about to remove Note created by <strong>' + note.createdByUserName + '</strong>';
    var dialog = dialogs.create('/views/custom-confirm.html', 'CustomConfirmController', {msg: msg}, {size: 'sm', keyboard: true, backdrop: true});
    dialog.result.then(function(result) {
      if (result) {
        var index = $scope.rowCollection.indexOf(note);
        LoanService.removeLoan(REST_URL.NOTES + $scope.loanDetails.id + '/' + note.id).then(function() {
          $scope.type = 'alert-success';
          $scope.message = 'Note removed successfully.';
          $scope.errors = [];
          if (index >= -1) {
            $scope.rowCollection.splice(index, 1);
          } else {
            updateNotes();
          }
        }, function(result) {
          $scope.message = 'Cant remove note:' + result.data.defaultUserMessage;
          $scope.type = 'error';
          $scope.errors = result.data.errors;
        });
      }
    });
  };
  if (DataTransferService.get('loan.detail.tab')) {
    $scope.openNoteDialog();
    DataTransferService.set('loan.detail.tab', null);
  }
});


angular.module('angularjsApp').controller('LoanDeatilsNoteDialog', function(REST_URL, LoanService, DataTransferService, $timeout, $scope, $modalInstance, Session, APPLICATION, data) {
  $scope.loan = data.loan;
  $scope.note = data.note || {};
  $scope.data = data.data;

  if ($scope.note.followUpDate) {
    $scope.note.followUpDate = new Date($scope.note.followUpDate);
  }
  if (!$scope.note.createdDate) {
    $scope.note.createdDate = new Date();
  } else {
    $scope.note.createdDate = new Date($scope.note.createdDate);
  }

  $scope.datepicker = {};
  $scope.cancel = function() {
    $modalInstance.dismiss();
  };

  $scope.saveNote = function() {
    if (!$scope.noteForm.$valid) {
      $scope.type = 'error';
      $scope.message = 'Highlighted fields are required';
      $scope.errors = [];
      return;
    }
    var json = angular.copy($scope.note);
    json.locale = 'en';
    json.dateFormat = APPLICATION.DF_MIFOS;
    if (typeof json.followUpDate === 'object') {
      json.followUpDate = moment(json.followUpDate).format(APPLICATION.DF_MOMENT);
    }
    if (typeof json.createdDate === 'object') {
      json.createdDate = moment(json.createdDate).tz(APPLICATION.TIMEZONE).format(APPLICATION.DF_MOMENT);
    }
    if (!json.created_by) {
      json.createdByUsername = Session.getValue(APPLICATION.username);
    }
    function saveNoteSuccess() {
      $scope.type = 'alert-success';
      $scope.message = 'Note saved successfully.';
      $scope.errors = [];
      $timeout(function() {
        $modalInstance.close();
      }, 2000);
    }
    function saveNoteFail(result) {
      $scope.message = 'Cant save note:' + result.data.defaultUserMessage;
      $scope.type = 'error';
      $scope.errors = result.data.errors;
    }
    var loanId;
    if ($scope.loan) {
      loanId = $scope.loan.id;
    }
    if (!loanId) {
      loanId = DataTransferService.get('loan.id');
      DataTransferService.set('loan.id', null);
    }
    if ($scope.note.id) {
      LoanService.updateLoan(REST_URL.NOTES + loanId + '/' + $scope.note.id, angular.toJson(json)).then(saveNoteSuccess, saveNoteFail);
    } else {
      LoanService.saveLoan(REST_URL.NOTES + loanId, angular.toJson(json)).then(saveNoteSuccess, saveNoteFail);
    }
  };
  $scope.open = function($event, target) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.datepicker[target] = true;
  };
});
