'use strict';

// Here we attach this controller to our testApp module
var clientsCtrl = angular.module('clientsController', ['clientsService', 'Constants', 'smart-table']);

clientsCtrl.controller('ClientsCtrl', function($scope, $route, $timeout, ClientsService, CreateClientsService, SearchService, REST_URL, APPLICATION, dialogs) {
  console.log('ClientsCtrl : loadClients');
  //To load the clients page

  $scope.isLoading = false;
  $scope.rowCollection = [];
  $scope.displayed = [];

  var addClient = function(client) {
    $scope.rowCollection.push(client);
    client.image = APPLICATION.NO_IMAGE_THUMB;
    CreateClientsService.getData(REST_URL.CREATE_CLIENT + '/' + client.id + '/images').then(function(result) {
      client.image = result.data;
    });
  };

  //Success callback
  var allClientsSuccess = function(result) {
    $scope.isLoading = false;

    console.log('SEARCH POS: ' + SearchService.get());

    try {
      $scope.rowCollection = [];
      for(var i=0; i<result.data.length; i++) {
        var client = result.data[i];
        if(SearchService.get() && SearchService.get().indexOf(client.id)>=0) {
          addClient(client);
        } else if(!SearchService.get() && !$route.current.params.status || client.status===$route.current.params.status) {
          addClient(client);
        }
      }
      SearchService.set(undefined);
    } catch (e) {
      console.log(e);
    }
  };

  //failur callback
  var allClientsFail = function() {
    $scope.isLoading = false;
    console.log('Error : Return from allClients service.');
  };

  var loadClients = function getData() {
    $scope.isLoading = true;

    $timeout(function() {
      $scope.rowCollection = [];
      //service to get clients from server
      ClientsService.getData(REST_URL.ALL_CLIENTS).then(allClientsSuccess, allClientsFail);
    }, 2000);
  };

  $scope.closeClient = function(client) {
    var dialog = dialogs.create('/views/Client/grids/closeClientDialog.html', 'ConfirmCloseClientDialog', {client: client}, {size: 'md', keyboard: true, backdrop: true});
    dialog.result.then(function(result) {
      if (result) {
        loadClients();
      }
    });
  };

  $scope.activateClient = function(client) {
    var msg = 'Are You sure want to re-activate client <strong>' + client.name + '</strong>?';
    var dialog = dialogs.create('/views/custom-confirm.html', 'CustomConfirmController', {msg: msg, title: 'Confirm Activate', submitBtn: {value: 'Activate', class: 'btn-success'}}, {size: 'sm', keyboard: true, backdrop: true});
    dialog.result.then(function(result) {
      if (result) {
        $scope.message = '';
        var currentDate = new Date();
        var json = {
          dateFormat: 'dd/MM/yyyy',
          locale: 'en',
          activationDate: currentDate.getDate() + '/' + (currentDate.getMonth() + 1) + '/' + currentDate.getFullYear()
        };
        var url = REST_URL.CREATE_CLIENT + '/' + client.id + '?command=activate';
        CreateClientsService.saveClient(url, json).then(function(result) {
          console.log('Success CreateClientsService command activate', result);
          $scope.type = 'alert-success';
          $scope.message = 'Client has been successfuly activated.';
          loadClients();
        }, function(result) {
          $scope.type = 'error';
          $scope.message = 'Client not activated: ' + result.data.defaultUserMessage;
          $scope.errors = result.data.errors;
        });
      }
    });
  };

  loadClients();
});

clientsCtrl.controller('ClientSelectCtrl', function($scope, $modalInstance, REST_URL, ClientsService, data) {
  $scope.isLoading = true;
  $scope.msg = data.msg;
  $scope.action = data.action;
  $scope.clientId = null;
  $scope.clients = null;

  $scope.select = function() {
    $modalInstance.close($scope.clientId);
  };

  $scope.cancel = function() {
    $modalInstance.dismiss();
  };

  ClientsService.getData(REST_URL.ALL_CLIENTS).then(function(result) {
    $scope.clients = [];

    angular.forEach(result.data, function(client) {
      if( (!client.loanStatus || client.loanStatus==='') && client.status==='Active') {
        $scope.clients.push(client);
      }
    });
    $scope.isLoading = false;
  });
});

clientsCtrl.controller('ClientsRepaymentDialogCtrl', function($scope, $location, $modalInstance, REST_URL, ClientsService, DataTransferService, data) {
  $scope.isLoading = true;
  $scope.msg = data.msg;
  $scope.action = data.action;
  $scope.client = null;
  $scope.paymentCode = null;
  $scope.clients = null;
  $scope.paymentOptions = [
    {
      code: 'prepay',
      name: 'Prepay loan'
    },
    {
      code: 'payment',
      name: 'Make loan payment'
    }
  ];

  $scope.proceed = function() {
    $modalInstance.dismiss();
    $location.path('/loans/' + $scope.client.id + '/details/' + $scope.client.loanId);

    DataTransferService.set('loan.payment.code', $scope.paymentCode);
    //$scope.$broadcast('loan.show.dialog', $scope.paymentCode);
  };

  $scope.cancel = function() {
    $modalInstance.dismiss();
  };

  ClientsService.getData(REST_URL.CLIENTS_LOAN_REPAYMENT).then(function(result) {
    $scope.clients = result.data;

    /**
    angular.forEach(result.data, function(client) {
      if( client.loanStatus && client.status==='Active') {
        $scope.clients.push(client);
      }
    });
     */
    $scope.isLoading = false;
  });
});

clientsCtrl.controller('ClientSearchCtrl', function($scope, $route, $location, REST_URL, ClientsService, SearchService) {
  $scope.isLoading = true;
  $scope.selected = null;
  $scope.clients = null;
  $scope.selectedClients = [];

  $scope.go = function() {
    var ids = [];

    for(var i=0; i<$scope.selectedClients.length; i++) {
      ids.push($scope.selectedClients[i].id);
    }
    $scope.clear();

    var path = '/clients';
    SearchService.set(ids);

    /**
    if(ids.length===1) {
      path = '/editbasicclientinfo/' + ids[0];
    } else {
      path = '/clients';
      SearchService.set(ids);
    }
     */
    if($location.path()===path) {
      $route.reload();
    } else {
      $location.path(path);
    }
  };

  $scope.clear = function() {
    $scope.selected = null;
    $scope.selectedClients = [];
  };

  $scope.onSelect = function ($item, $model /** , $label */) {
    $scope.clear();
    $scope.selectedClients.push($model);
    $scope.go();
    /**
    $scope.clear();

    var path = '/editbasicclientinfo/' + $model.id;

    if($location.path()===path) {
      $route.reload();
    } else {
      $location.path(path);
    }
     */
  };

  var check = function(client, property, val) {
    if(client && client[property]) {
      return client[property].toLowerCase().indexOf(val.toLowerCase())>=0;
    }

    return false;
  };

  $scope.onKeypress = function($event) {
    if ($event.which === 13) {
      $scope.go();
    }
  };

  $scope.search = function(val) {
    $scope.selectedClients = [];

    if(val && val!=='') {
      var criteria = val.split(' ');

      //console.log('SEARCH: ' + angular.toJson(criteria));

      for(var i=0; i<$scope.clients.length; i++) {
        var client = $scope.clients[i];
        for(var j=0; j<criteria.length; j++) {
          var criterium = criteria[j];
          //console.log('SEARCH: ' + criterium + ' - ' + check(client, 'name', criterium));
          if(check(client, 'name', criterium) ||
              check(client, 'middlename', criterium) ||
              check(client, 'file_no', criterium) ||
              check(client, 'activation_date', criterium) ||
              check(client, 'date_of_birth', criterium) ||
              check(client, 'mobile_no', criterium) ||
              check(client, 'gender', criterium)) {
            $scope.selectedClients.push(client);
            break;
          }
        }
      }
    }

    return $scope.selectedClients;
  };

  $scope.load = function(/** val */) {
    return ClientsService.getData(REST_URL.SEARCH_CLIENTS).then(function(result) {
      $scope.clients = result.data;
      $scope.isLoading = false;
      return result.data;
    });
  };

  $scope.load();
});

clientsCtrl.controller('ConfirmCloseClientDialog', function($scope, $modalInstance, REST_URL, ClientsService, CreateClientsService, data) {
  $scope.client = data.client;
  $scope.info = {};
  var $url = REST_URL.CREATE_CLIENT_TEMPLATE + '?commandParam=close';
  ClientsService.getData($url).then(function(result) {
    if (result.data && result.data.narrations) {
      $scope.closureReasons = result.data.narrations;
    }
  }, function() {
    console.log('Cant recieve closure reasons data');
  });
  $scope.closeClient = function() {
    $scope.message = '';

    var currentDate = new Date();
    var json = {
      dateFormat: 'dd/MM/yyyy',
      locale: 'en',
      closureDate: currentDate.getDate() + '/' + (currentDate.getMonth() + 1) + '/' + currentDate.getFullYear(),
      closureReasonId: $scope.info.closureReason
    };
    var url = REST_URL.CREATE_CLIENT + '/' + $scope.client.id + '?command=close';
    CreateClientsService.saveClient(url, json).then(function(result) {
      console.log('Success CreateClientsService command close', result);
      $modalInstance.close(true);
    }, function(result) {
      $scope.type = 'error';
      $scope.message = 'Account not removed: ' + result.data.defaultUserMessage;
      $scope.errors = result.data.errors;
    });
  };

  $scope.cancel = function() {
    $modalInstance.close(false);
  };

});


clientsCtrl.controller('LoansCtrl', function($scope, $route, $location, $timeout, ClientsService, CreateClientsService, REST_URL, APPLICATION) {
  console.log('LoansCtrl : Loans');
  //To load the loans page

  $scope.isLoading = false;
  $scope.rowCollection = [];
  $scope.displayed = [];

  //Success callback
  var allLoansSuccess = function(result) {
    $scope.isLoading = false;
    try {
      $scope.rowCollection = [];
      angular.forEach(result.data, function(loan) {
        loan.image = APPLICATION.NO_IMAGE_THUMB;
        var added = false;
        //console.log('LoansCtrl : ' + $location.path() + ' - ' + $route.current.params.loanStatus + ' - ' + loan.loanStatus + ' - ' + loan.status);
        if($location.path().indexOf('/loans/borrowers')===0) {
          // /loans/borrowers
          if($route.current.params.loanStatus==='total' && (loan.loanStatus==='ActiveInGoodStanding' || loan.loanStatus==='ActiveInBadStanding')) {
            $scope.rowCollection.push(loan);
            added = true;
          } else if($route.current.params.loanStatus==='bad' && loan.loanStatus==='ActiveInBadStanding') {
            $scope.rowCollection.push(loan);
            added = true;
          }
        } else if($location.path()==='/loans') {
          // /loans
          $scope.rowCollection.push(loan);
          added = true;
        }

        if(added) {
          CreateClientsService.getData(REST_URL.CREATE_CLIENT + '/' + loan.clientId + '/images').then(function(result) {
            loan.image = result.data;
          });
        }
      });
    } catch (e) {
    }
  };

  //failur callback
  var allLoansFail = function() {
    $scope.isLoading = false;
    console.log('Error : Return from allLoansFail service.');
  };

  var loadLoans = function getData() {
    $scope.isLoading = true;

    $timeout(function() {
      $scope.rowCollection = [];
      //service to get loans from server
      ClientsService.getData(REST_URL.LOANS).then(allLoansSuccess, allLoansFail);
    }, 2000);
  };

  $scope.showLoanDetails = function(loan) {
    $location.url('/loans/' + loan.clientId + '/details/' + loan.loanId);
  };

  loadLoans();
});

clientsCtrl.controller('LoansClosedCtrl', function($scope, $location, $timeout, ClientsService, CreateClientsService, REST_URL, APPLICATION) {
  console.log('LoansClosedCtrl : Loans');
  //To load the loans page

  $scope.isLoading = false;
  $scope.rowCollection = [];
  $scope.displayed = [];

  //Success callback
  var allLoansSuccess = function(result) {
    $scope.isLoading = false;
    try {
      $scope.rowCollection = result.data;
      angular.forEach($scope.rowCollection, function(loan) {
          loan.image = APPLICATION.NO_IMAGE_THUMB;
          CreateClientsService.getData(REST_URL.CREATE_CLIENT + '/' + loan.clientId + '/images').then(function(result) {
              loan.image = result.data;
          });
      });
    } catch (e) {
    }
  };

  //failur callback
  var allLoansFail = function() {
    $scope.isLoading = false;
    console.log('Error : Return from allLoansFail service.');
  };

  var loadLoans = function getData() {
    $scope.isLoading = true;

    $timeout(function() {
      $scope.rowCollection = [];
      //service to get loans from server
      ClientsService.getData(REST_URL.LOANS_CLOSED).then(allLoansSuccess, allLoansFail);
    }, 2000);
  };

  $scope.showLoanDetails = function(loan) {
    $location.url('/loans/' + loan.clientId + '/details/' + loan.loanId);
  };

  loadLoans();
});

clientsCtrl.controller('LoansPendingApprovalsCtrl', function($scope, $timeout, LoanService, CreateClientsService, REST_URL, $location, dialogs) {
  console.log('LoansPendingApprovalsCtrl : LoansPendingApprovals');
  //To load the LoansPendingApprovals page

  $scope.isLoading = false;
  $scope.rowCollection = [];
  $scope.displayed = [];
  //Success callback
  var allLoansPendingApprovalsSuccess = function(result) {
    $scope.isLoading = false;
    try {
      $scope.rowCollection = result.data;
    } catch (e) {
    }
  };

  //failur callback
  var allLoansPendingApprovalsFail = function() {
    $scope.isLoading = false;
    console.log('Error : Return from allLoansPendingApprovalsFail service.');
  };

  var loadLoansPendingApprovals = function getData() {
    $scope.isLoading = true;

    $timeout(function() {
      $scope.rowCollection = [];
      //service to get LoansPendingApprovals from server
      LoanService.getData(REST_URL.LOANS_PENDING_APPROVALS).then(allLoansPendingApprovalsSuccess, allLoansPendingApprovalsFail);
    }, 2000);
  };

  $scope.editLoan = function(loan) {
    $location.url('/loans/' + loan.clientId + '/form/create/' + loan.loanId);
  };

  $scope.removeLoan = function(loan) {
    var msg = 'You are about to remove Loan for client: <strong>' + loan.name + '</strong>';
    var dialog = dialogs.create('/views/custom-confirm.html', 'CustomConfirmController', {msg: msg}, {size: 'sm', keyboard: true, backdrop: true});
    dialog.result.then(function(result) {
      if (result) {
        LoanService.removeLoan(REST_URL.LOANS_CREATE + '/' + loan.loanId).then(function() {
          $scope.type = 'alert-success';
          $scope.message = 'Loan removed successfuly';
          $scope.errors = [];
          loadLoansPendingApprovals();
        }, function(result) {
          $scope.type = 'error';
          $scope.message = 'Loan not rejected: ' + result.data.defaultUserMessage;
          $scope.errors = result.data.errors;
        });
      }
    });
  };

  $scope.openActionDialog = function(loan) {
    var dialog = dialogs.create('/views/Client/grids/loans.dialog.action.html', 'LoansActionDialogCtrl', {loan: loan}, {size: 'md', keyboard: true, backdrop: true});
    dialog.result.then(function(result) {
      if (result) {
        loadLoansPendingApprovals();
      }
    });
  };

  loadLoansPendingApprovals();
});

clientsCtrl.controller('LoansActionDialogCtrl', function($scope, $modalInstance, REST_URL, AuthService, ClientsService, CreateClientsService, dialogs, data) {
  console.log('LoansActionDialogCtrl', $scope);
  $scope.baseLoan = data.loan;
  $scope.info = {};
  $scope.data = {};
  ClientsService.getData(REST_URL.LOANS_CREATE + '/' + $scope.baseLoan.loanId + '/charges').then(function(result) {
    if (result.data) {
      $scope.data.charges = result.data;
    }
  }, function() {
    console.log('Cant recieve charges data');
  });
  ClientsService.getData(REST_URL.LOANS_CREATE + '/' + $scope.baseLoan.loanId).then(function(result) {
    if (result.data) {
      $scope.loan = result.data;
    }
  }, function() {
    console.log('Cant recieve loan data');
  });

  $scope.cancel = function() {
    $modalInstance.close(false);
  };
  $scope.reject = function() {
    var dialog = dialogs.create('/views/Client/grids/submitLoanActionDialog.html', 'SubmitLoanActionDialogCtrl', {type: 'reject'}, {size: 'md', keyboard: true, backdrop: true});
    dialog.result.then(function(result) {
      if (result) {
        var currentDate = new Date();
        var json = {
          dateFormat: 'dd/MM/yyyy',
          locale: 'en',
          rejectedOnDate: currentDate.getDate() + '/' + (currentDate.getMonth() + 1) + '/' + currentDate.getFullYear(),
          note: result.note
        };
        CreateClientsService.saveClient(REST_URL.LOANS_CREATE + '/' + $scope.baseLoan.loanId + '?command=reject', json).then(function(result) {
          $scope.type = 'alert-success';
          $scope.message = 'Loan rejected successfuly';
          $scope.errors = result.data.errors;
          $modalInstance.close(true);
        }, function(result) {
          $scope.type = 'error';
          $scope.message = 'Loan not rejected: ' + result.data.defaultUserMessage;
          $scope.errors = result.data.errors;
        });
      }
    });
  };
  $scope.approve = function() {
    var currentDate = new Date();
    var json = {
      dateFormat: 'dd/MM/yyyy',
      locale: 'en',
      approvedOnDate: currentDate.getDate() + '/' + (currentDate.getMonth() + 1) + '/' + currentDate.getFullYear()
    };
    CreateClientsService.saveClient(REST_URL.LOANS_CREATE + '/' + $scope.baseLoan.loanId + '?command=approve', json).then(function(result) {
      $scope.type = 'alert-success';
      $scope.message = 'Loan approved successfuly';
      $scope.errors = result.data.errors;
      $modalInstance.close(true);
    }, function(result) {
      $scope.type = 'error';
      $scope.message = 'Loan not approved: ' + result.data.defaultUserMessage;
      $scope.errors = result.data.errors;
    });
  };

    $scope.hasPermission = AuthService.hasPermission;

});

clientsCtrl.controller('SubmitLoanActionDialogCtrl', function($scope, $modalInstance, data) {
  $scope.dialogType = data.type;
  $scope.datepicker = {};
  $scope.data = {};
  if ($scope.dialogType === 'approve') {
    $scope.title = 'Approve Loan';
    $scope.messageLabel = 'Note';
  } else if ($scope.dialogType === 'disburse') {
    $scope.title = 'Disburse Loan';
    $scope.messageLabel = 'Note';
  } else if ($scope.dialogType === 'undoApproval') {
    $scope.title = 'Undo Approval Loan';
    $scope.messageLabel = 'Note';
  } else {
    $scope.title = 'Reject Loan';
    $scope.messageLabel = 'Reason';
  }
  $scope.open = function($event, target) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.datepicker[target] = true;
  };
  $scope.ok = function() {
    if (!$scope.submitLoanActionForm.$valid) {
      $scope.type = 'error';
      $scope.message = 'Highlighted fields are required';
      $scope.errors = [];
      $('html, body').animate({scrollTop: 0}, 800);
      return;
    }
    $modalInstance.close(angular.copy($scope.data));
  };
  $scope.cancel = function() {
    $modalInstance.close(false);
  };
});


clientsCtrl.controller('LoansAwaitingDisbursementCtrl', function($scope, $timeout, LoanService, REST_URL, $location, dialogs) {
  console.log('LoansAwaitingDisbursementCtrl : LoansAwaitingDisbursement');
  //To load the LoansAwaitingDisbursement page

  $scope.isLoading = false;
  $scope.rowCollection = [];
  $scope.displayed = [];
  //Success callback
  var allLoansAwaitingDisbursementSuccess = function(result) {
    $scope.isLoading = false;
    try {
      $scope.rowCollection = result.data;
    } catch (e) {
    }
  };

  //failur callback
  var allLoansAwaitingDisbursemensFail = function() {
    $scope.isLoading = false;
    console.log('Error : Return from allLoansAwaitingDisbursemensFail service.');
  };

  var loadLoansPendingApprovals = function getData() {
    $scope.isLoading = true;

    $timeout(function() {
      $scope.rowCollection = [];
      //service to get allLoansAwaitingDisbursemensFail from server
      LoanService.getData(REST_URL.LOANS_AWAITING_DISBURSEMENT).then(allLoansAwaitingDisbursementSuccess, allLoansAwaitingDisbursemensFail);
    }, 2000);
  };

  $scope.editLoan = function(loan) {
    $location.url('/loans/' + loan.clientId + '/form/create/' + loan.loanId);
  };
  $scope.removeLoan = function(loan) {
    var msg = 'You are about to remove Loan for client: <strong>' + loan.name + '</strong>';
    var dialog = dialogs.create('/views/custom-confirm.html', 'CustomConfirmController', {msg: msg}, {size: 'sm', keyboard: true, backdrop: true});
    dialog.result.then(function(result) {
      if (result) {
        LoanService.removeLoan(REST_URL.LOANS_CREATE + '/' + loan.loanId).then(function() {
          $scope.type = 'alert-success';
          $scope.message = 'Loan removed successfuly';
          $scope.errors = [];
          loadLoansPendingApprovals();
        }, function(result) {
          $scope.type = 'error';
          $scope.message = 'Loan not removed: ' + result.data.defaultUserMessage;
          $scope.errors = result.data.errors;
        });
      }
    });
  };
  $scope.openActionDialog = function(loan) {
    var dialog = dialogs.create('/views/Client/grids/loans.dialog.disburse.action.html', 'LoansDisburseActionDialogCtrl', {loan: loan}, {size: 'md', keyboard: true, backdrop: true});
    dialog.result.then(function(result) {
      if (result) {
        loadLoansPendingApprovals();
      }
    });
  };

  loadLoansPendingApprovals();
});


clientsCtrl.controller('LoansDisburseActionDialogCtrl', function($scope, $modalInstance, REST_URL, ClientsService, CreateClientsService, AuthService, dialogs, data) {
  console.log('LoansActionDialogCtrl', $scope);
  $scope.baseLoan = data.loan;
  $scope.baseLoan.actualDisbursementDate = new Date();
  $scope.info = {};
  $scope.data = {};
  $scope.datepicker = {};
  $scope.open = function($event, target) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.datepicker[target] = true;
  };
  ClientsService.getData(REST_URL.LOANS_CREATE + '/' + $scope.baseLoan.loanId + '/charges').then(function(result) {
    if (result.data) {
      $scope.data.charges = result.data;
    }
  }, function() {
    console.log('Cant recieve charges data');
  });
  ClientsService.getData(REST_URL.LOANS_CREATE + '/' + $scope.baseLoan.loanId).then(function(result) {
    if (result.data) {
      $scope.loan = result.data;
    }
  }, function() {
    console.log('Cant recieve loan data');
  });

  $scope.cancel = function() {
    $modalInstance.close(false);
  };
  $scope.undoApproval = function() {
    var dialog = dialogs.create('/views/Client/grids/submitLoanActionDialog.html', 'SubmitLoanActionDialogCtrl', {type: 'undoApproval'}, {size: 'md', keyboard: true, backdrop: true});
    dialog.result.then(function(result) {
      if (result) {
        var json = {
          note: result.note
        };
        CreateClientsService.saveClient(REST_URL.LOANS_CREATE + '/' + $scope.baseLoan.loanId + '?command=undoApproval', json).then(function(result) {
          $scope.type = 'alert-success';
          $scope.message = 'Loan rejected successfuly';
          $scope.errors = result.data.errors;
          $modalInstance.close(true);
        }, function(result) {
          $scope.type = 'error';
          $scope.message = 'Loan not rejected: ' + result.data.defaultUserMessage;
          $scope.errors = result.data.errors;
        });
      }
    });
  };
  $scope.disburse = function() {
    var actualDisbursementDate = new Date($scope.baseLoan.actualDisbursementDate);
    var json = {
      dateFormat: 'dd/MM/yyyy',
      locale: 'en',
      actualDisbursementDate: actualDisbursementDate.getDate() + '/' + (actualDisbursementDate.getMonth() + 1) + '/' + actualDisbursementDate.getFullYear()
    };
    CreateClientsService.saveClient(REST_URL.LOANS_CREATE + '/' + $scope.baseLoan.loanId + '?command=disburse', json).then(function(result) {
      $scope.type = 'alert-success';
      $scope.message = 'Loan disbursed successfuly';
      $scope.errors = result.data.errors;
      $modalInstance.close(true);
    }, function(result) {
      $scope.type = 'error';
      $scope.message = 'Loan not disursed: ' + result.data.defaultUserMessage;
      $scope.errors = result.data.errors;
    });
  };
  $scope.hasPermission = function(permission) {
    return AuthService.hasPermission(permission);
  };

});

clientsCtrl.controller('LoansRejectedCtrl', function($scope, $timeout, ClientsService, REST_URL) {
  console.log('LoansRejectedCtrl : LoansRejected');
  //To load the LoansRejected page

  $scope.isLoading = false;
  $scope.rowCollection = [];
  $scope.displayed = [];
  //Success callback
  var allLoansRejectedSuccess = function(result) {
    $scope.isLoading = false;
    try {
      $scope.rowCollection = result.data;
    } catch (e) {
    }
  };

  //failur callback
  var allLoansRejectedFail = function() {
    $scope.isLoading = false;
    console.log('Error : Return from LoansRejected service.');
  };

  var loadLoansRejected = function getData() {
    $scope.isLoading = true;

    $timeout(
      function() {
        $scope.rowCollection = [];
        //service to get allLoansAwaitingDisbursemensFail from server
        ClientsService.getData(REST_URL.LOANS_REJECTED).then(allLoansRejectedSuccess, allLoansRejectedFail);
      }, 2000
      );
  };

  loadLoansRejected();
});

clientsCtrl.controller('LoansWrittenOffCtrl', function($scope, $timeout, ClientsService, REST_URL) {
  console.log('LoansWrittenOffCtrl : LoansWrittenOff');
  //To load the LoansWrittenOff page

  $scope.isLoading = false;
  $scope.rowCollection = [];
  $scope.displayed = [];
  //Success callback
  var allLoansWrittenOffSuccess = function(result) {
    $scope.isLoading = false;
    try {
      $scope.rowCollection = result.data;
    } catch (e) {
    }
  };

  //failur callback
  var allLoansWrittenOffFail = function() {
    $scope.isLoading = false;
    console.log('Error : Return from LoansWrittenOff service.');
  };

  var loadLoansWrittenOff = function getData() {
    $scope.isLoading = true;

    $timeout(function() {
      $scope.rowCollection = [];
      //service to get LoansWritten from server
      ClientsService.getData(REST_URL.LOANS_WRITTEN_OFF).then(allLoansWrittenOffSuccess, allLoansWrittenOffFail);
    }, 2000);
  };

  loadLoansWrittenOff();
});