/* global moment */

'use strict';

// Here we attach this controller to our testApp module
var clientsCtrl = angular.module('clientsController', ['clientsService', 'Constants', 'smart-table']);

clientsCtrl.controller('ClientsCtrl', function($scope, $route, $location, $timeout, ClientsService, CreateClientsService, SearchService, REST_URL, PAGE_URL, APPLICATION, dialogs) {
  console.log('ClientsCtrl : loadClients');
  //To load the clients page

  $scope.isLoading = false;
  $scope.rowCollection = [];
  $scope.displayed = [];
  $scope.pageSize = APPLICATION.PAGE_SIZE;
  $scope.currentPage = $route.current.params.page ? parseInt($route.current.params.page) : 1;
  $scope.pages = [];
  $scope.searchTerm = '';

  var params = $location.search();

  console.log('DEBUG: ' + angular.toJson(params));

  if(params && params.clear) {
     SearchService.clear('ids');
     SearchService.clear('search');
     console.log('DEBUG XX: ' + angular.toJson(SearchService.data('ids')));
     console.log('DEBUG XX: ' + SearchService.data('search'));
     $location.url(PAGE_URL.CLIENTS).replace();
  }

  $scope.goTo = function(p) {
    $scope.currentPage = p;
    loadClients();
  };

  $scope.goNext = function() {
    $scope.currentPage++;
    loadClients();
  };

  $scope.goPrevious = function() {
    $scope.currentPage--;
    loadClients();
  };

  $scope.goLast = function() {
    $scope.currentPage = $scope.pages.length;
    loadClients();
  };

  $scope.goFirst = function() {
    $scope.currentPage = 1;
    loadClients();
  };

  $scope.setPageSize = function(s) {
    $scope.pageSize = s;
    $scope.goFirst();
  };

  $scope.onSearch = function($event) {
    if(!$scope.searchTerm || $scope.searchTerm.trim()==='') {
        SearchService.clear('ids');
        SearchService.clear('search');
    }
    if($event.keyCode===13) {
      loadClients();
    }
  };

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

    try {
      $scope.rowCollection = [];
      $scope.pages = [];

      if(result.data && result.data[0] && result.data[0].clientCount) {
        for(var j=1; j<=Math.ceil(result.data[0].clientCount/$scope.pageSize); j++) {
          $scope.pages.push({page: j, link: '#/clients/p/' + j});
        }
      }

      for(var i=0; i<result.data.length; i++) {
        addClient(result.data[i]);
      }

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
      var offset = $scope.pageSize * ($scope.currentPage-1);
      var status = $route.current.params.status ? $route.current.params.status : '%';

      SearchService.data('search', $scope.searchTerm);

      if(SearchService.data('ids')) {
          $scope.searchTerm = SearchService.data('ids')[0] + '';
      } else if(SearchService.data('search')) {
          $scope.searchTerm = SearchService.data('search');
      }
      var searchTerm = $scope.searchTerm && $scope.searchTerm.length>0 ? '%25' + $scope.searchTerm + '%25': '%25';
      ClientsService.getData(REST_URL.ALL_CLIENTS + '?R_limit=' + $scope.pageSize + '&R_offset=' + offset + '&R_status=' + status + '&R_search=' + searchTerm).then(allClientsSuccess, allClientsFail);
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

  $scope.createNote = function(client) {
    var dialog = dialogs.create('views/Client/dialogs/note.tpl.html', 'ClientsNoteDialogCtrl', {msg: 'General Client Notes', client: client}, {size: 'lg', keyboard: true, backdrop: true});
    dialog.result.then(function() {
      // TODO: do we need this?
    });
  };

  $scope.activateClient = function(client) {
    var msg = 'Are You sure want to re-activate client <strong>' + client.name + '</strong>?';
    var dialog = dialogs.create('/views/custom-confirm.html', 'CustomConfirmController', {msg: msg, title: 'Confirm Activate', submitBtn: {value: 'Activate', class: 'btn-success'}}, {size: 'sm', keyboard: true, backdrop: true});
    dialog.result.then(function(result) {
      if (result) {
        $scope.message = '';
        var json = {
          dateFormat: APPLICATION.DF_MIFOS,
          locale: 'en',
          activationDate: moment().tz(APPLICATION.TIMEZONE).format(APPLICATION.DF_MOMENT)
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
    $modalInstance.close($scope.client.id);
  };

  $scope.cancel = function() {
    $modalInstance.dismiss();
  };

  ClientsService.getData(REST_URL.SEARCH_CLIENTS).then(function(result) {
    $scope.clients = [];

    angular.forEach(result.data, function(client) {
      if( (!client.loanStatus || client.loanStatus.trim()==='' || client.loanStatus.indexOf('Written-Off')>-1 || client.loanStatus.indexOf('Closed')>-1 || client.loanStatus.indexOf('Withdrawn')>-1) && client.status==='Active') {
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
  $scope.paymentCode = 'payment';
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
    $scope.isLoading = false;
  });
});

clientsCtrl.controller('ClientsNewNoteDialogCtrl', function($scope, $location, $modalInstance, REST_URL, dialogs, ClientsService, DataTransferService, data) {
  $scope.isLoading = true;
  $scope.msg = data.msg;
  $scope.action = data.action;
  $scope.client = null;
  $scope.noteType = 'general';
  $scope.clients = null;
  $scope.noteTypes = [
    {
      code: 'followup',
      name: 'Follow up Note'
    },
    {
      code: 'general',
      name: 'General Note'
    }
  ];

  $scope.$watch('noteType', function() {
    if($scope.noteType==='followup') {
      // TODO: check if this is enough or if we need a new report without paging...
      var status = "'Invalid', 'Submitted and awaiting approval', 'Approved', 'Active', 'Withdrawn by client', 'Rejected', 'Closed', 'Written-Off', 'Rescheduled', 'Overpaid', 'ActiveInGoodStanding', 'ActiveInBadStanding'";
      ClientsService.getData(REST_URL.LOANS + '?R_limit=25&R_offset=0&R_search=%&R_status='+status).then(function(result) {
        $scope.clients = result.data;
        $scope.isLoading = false;
      });
    } else {
      ClientsService.getData(REST_URL.SEARCH_CLIENTS).then(function(result) {
        $scope.clients = result.data;
        $scope.isLoading = false;
      });
    }
  });

  $scope.proceed = function() {
    if($scope.noteType==='followup') {
      if($scope.client && $scope.client.clientId && $scope.client.loanId) {
        DataTransferService.set('loan.detail.tab', 'notes');
        DataTransferService.set('loan.id', $scope.client.loanId);
        //DataTransferService.set('client.id', $scope.client.clientId);
        $location.path('/loans/' + $scope.client.clientId + '/details/' + $scope.client.loanId);
      }
    } else {
      var dialog = dialogs.create('views/Client/dialogs/note.tpl.html', 'ClientsNoteDialogCtrl', {msg: 'General Client Notes', client: $scope.client}, {size: 'lg', keyboard: true, backdrop: true});
      dialog.result.then(function() {
        // TODO: do we need this?
      });
    }
    $modalInstance.dismiss();
  };

  $scope.cancel = function() {
    $modalInstance.dismiss();
  };
});

clientsCtrl.controller('ClientsNoteDialogCtrl', function($scope, $modalInstance, $location, APPLICATION, REST_URL, CreateClientsService, DataTransferService, Session, data) {
  $scope.isLoading = false;
  $scope.msg = data.msg;
  $scope.notes = [];
  $scope.client = data.client;
  $scope.sourceOptions = [];
  $scope.datepicker = {};

  $scope.resetNote = function() {
    $scope.note = {created_at: new Date(), client_id: data.client.id, dateFormat: APPLICATION.DF_MIFOS, locale: 'en', staff_username: Session.getValue('username')};
    $scope.source = null;
  };

  $scope.open = function($event, target) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.datepicker[target] = true;
  };

  $scope.selectNote = function(note) {
    $scope.note = note;
    for(var i=0; i<$scope.sourceOptions.length; i++) {
      if($scope.sourceOptions[i].id===parseInt(note.NoteSource_cd_source)) {
        $scope.source = $scope.sourceOptions[i];
        break;
      }
    }
  };

  $scope.removeNote = function(note) {
    CreateClientsService.deleteClient(REST_URL.CLIENT_NOTE_GENERAL + $scope.client.id + '/' + note.id).then(function() {
      if($scope.note.id===note.id) {
        $scope.resetNote();
      }
      $scope.reloadNotes();
    }, function(result) {
      $scope.type = 'error';
      $scope.message = 'Cannot save client notes: ' + result.data.defaultUserMessage;
      $scope.errors = result.data.errors;
    });
  };

  $scope.showFollowup = function() {
    if($scope.loan && $scope.loan.clientId===$scope.client.id) {
      var loanId = $scope.loan.loanId ? $scope.loan.loanId : $scope.loan.id;
      DataTransferService.set('loan.detail.tab', 'notes');
      DataTransferService.set('loan.id', loanId);
      $location.path('/loans/' + $scope.loan.clientId + '/details/' + loanId);
      $modalInstance.dismiss();
    } else {
        console.log('DEBUG X: ' + angular.toJson($scope.client));
        console.log('DEBUG X: ' + angular.toJson($scope.loan));
    }
  };

  $scope.showMessage = function() {
    if($scope.client && $scope.client.loanId) {
        CreateClientsService.getData(REST_URL.LOANS_CREATE + '/' + $scope.client.loanId).then(function(result) {
            $scope.loan = result.data;
            $scope.messageVisible = true;
        }, function(result) {
            console.log('ERROR: ' + angular.toJson(result));
        });
    }
  };

  $scope.save = function() {
    if($scope.note.created_at) {
      $scope.note.created_at = moment($scope.note.created_at).tz(APPLICATION.TIMEZONE).format(APPLICATION.DF_MOMENT);
    }
    if($scope.note.called_at) {
      $scope.note.called_at = moment($scope.note.called_at).tz(APPLICATION.TIMEZONE).format(APPLICATION.DF_MOMENT);
    }
    if($scope.note.visited_at) {
      $scope.note.visited_at = moment($scope.note.visited_at).tz(APPLICATION.TIMEZONE).format(APPLICATION.DF_MOMENT);
    }
    if($scope.source) {
      $scope.note.NoteSource_cd_source = $scope.source.id;
    }

    $scope.note.dateFormat = APPLICATION.DF_MIFOS;
    $scope.note.locale = 'en';

    if($scope.note.id) {
      // update
      CreateClientsService.updateClient(REST_URL.CLIENT_NOTE_GENERAL + $scope.client.id, angular.toJson($scope.note)).then(function() {
        //$modalInstance.dismiss();
        $scope.showMessage();
      }, function(result) {
        $scope.type = 'error';
        $scope.message = 'Cannot save client notes: ' + result.data.defaultUserMessage;
        $scope.errors = result.data.errors;
      });
    } else {
      // create
      CreateClientsService.saveClient(REST_URL.CLIENT_NOTE_GENERAL + $scope.client.id, angular.toJson($scope.note)).then(function() {
        //$modalInstance.dismiss();
        $scope.showMessage();
      }, function(result) {
        $scope.type = 'error';
        $scope.message = 'Cannot save client notes: ' + result.data.defaultUserMessage;
        $scope.errors = result.data.errors;
      });
    }
  };

  $scope.cancel = function() {
    $modalInstance.dismiss();
  };

  $scope.reloadNotes = function() {
    CreateClientsService.getData(REST_URL.CLIENT_NOTE_GENERAL + $scope.client.id + '?genericResultSet=true').then(function(result) {
      var columns = [];
      for(var i=0; i<result.data.columnHeaders.length; i++) {
        columns.push(result.data.columnHeaders[i].columnName);
        if(result.data.columnHeaders[i].columnName==='NoteSource_cd_source') {
          $scope.sourceOptions = result.data.columnHeaders[i].columnValues;
          break;
        }
      }
      $scope.notes = [];
      angular.forEach(result.data.data, function(row) {
        var note = {};
        for(var j=0; j<columns.length; j++) {
          note[columns[j]] = row.row[j];
        }
        $scope.notes.push(note);
      });
    }, function(result) {
      $scope.type = 'error';
      $scope.message = 'Cannot retrieve client notes: ' + result.data.defaultUserMessage;
      $scope.errors = result.data.errors;
    });
  };

  $scope.resetNote();
  $scope.reloadNotes();
});

clientsCtrl.controller('ClientsUploadDialogCtrl', function($scope, $modalInstance, $upload, $timeout, APPLICATION, REST_URL, CreateClientsService, ClientsService, data) {
  $scope.isLoading = true;
  $scope.msg = data.msg;
  $scope.client = null;
  $scope.doc = {};
  $scope.extra = {};
  $scope.clients = null;
  $scope.file = null;
  $scope.docTypes = [];

  $scope.$watch('client', function() {
    if($scope.client) {
      $scope.docTypes = null;
      CreateClientsService.getData(REST_URL.CREATE_CLIENT + '/' + $scope.client.id + '/identifiers/template').then(function(result) {
        $scope.docTypes = result.data.allowedDocumentTypes;
        if($scope.docTypes && $scope.docTypes.length>0) {
          $scope.doc.documentTypeId = $scope.docTypes[0].id;
        }
      }, function() {
        // TODO: do we need this?
      });
    }
  });

  $scope.onFileSelect = function($files) {
    if ($files[0].size / 1024 > 2048) {
      $scope.type = 'error';
      $scope.message = 'File is too large! File size must be less then or equal to 2MB';
      $scope.file = null;
    } else {
      $scope.file = $files[0];
    }
  };

  $scope.open = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.opened = true;
  };

  $scope.upload = function() {
    if($scope.file) {

      $scope.isLoading = true;

      CreateClientsService.saveClient(REST_URL.CREATE_CLIENT + '/' + $scope.client.id + '/identifiers', angular.toJson($scope.doc)).then(function(result) {
        var clientId = result.data.clientId;
        var resourceId = result.data.resourceId;

        var formData = {};
        formData.name = 'client_id_' + clientId;

        $scope.doc = {};
        //console.log('UPLOAD: ' + angular.toJson(result));

        // extra
        $scope.extra.identifier_id = resourceId;
        $scope.extra.locale = 'en';
        $scope.extra.dateFormat = APPLICATION.DF_MIFOS;
        if ($scope.extra.issue_date) {
          $scope.extra.issue_date = moment($scope.extra.issue_date).tz(APPLICATION.TIMEZONE).format(APPLICATION.DF_MOMENT);
        }

        CreateClientsService.saveClient(REST_URL.CREATE_CLIENT_IDENTIFICATION + clientId, angular.toJson($scope.extra)).then(function() {
          $scope.extra = {};

          // upload
          $upload.upload({
            url: APPLICATION.host + 'api/v1/client_identifiers/' + resourceId + '/documents',
            data: formData,
            file: $scope.file
          }).then(function() {
            $scope.type = 'alert-success';
            $scope.errors = [];
            $scope.message = 'Document uploaded';
            $scope.isLoading = false;

            $timeout($scope.cancel, 3000);
          }, function(r) {
            $scope.type = 'error';
            $scope.message = 'Document attachment not uploaded!';
            $scope.errors = r.data.errors;
            $scope.isLoading = false;

            $timeout($scope.cancel, 3000);
          });
        }, function(r) {
          $scope.type = 'error';
          $scope.message = 'Document Extras not saved!';
          $scope.errors = r.data.errors;
          $scope.isLoading = false;

          $timeout($scope.cancel, 3000);
        });
      }, function(result) {
        $scope.type = 'error';
        $scope.message = 'Document not saved!';
        $scope.errors = result.data.errors;
        $scope.isLoading = false;

        $timeout($scope.cancel, 3000);
      });
    }
  };

  $scope.cancel = function() {
    $scope.client = null;
    $scope.docTypes = [];
    $scope.file = null;
    $scope.isLoading = false;
    $modalInstance.dismiss();
  };

  // TODO: consider using another approach here; quick fix
  //ClientsService.getData(REST_URL.ALL_CLIENTS + '?R_limit=5000&R_offset=0&R_status=%&R_search=%').then(function(result) {
  ClientsService.getData(REST_URL.SEARCH_CLIENTS).then(function(result) {
    $scope.clients = result.data;
    $scope.isLoading = false;
  });
});

clientsCtrl.controller('ClientSearchCtrl', function($rootScope, $scope, $route, $location, REST_URL, ClientsService, SearchService, AUTH_EVENTS) {
  $scope.selected = null;
  $scope.clients = null;
  $scope.selectedClients = [];

  $scope.go = function() {
    var ids = [];

    for(var i=0; i<$scope.selectedClients.length; i++) {
      ids.push($scope.selectedClients[i].file_no);
    }
    $scope.clear();

    var path = '/clients';
    SearchService.data('ids', ids);

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

  $scope.searchFilter = function( criteria ) {
    criteria = criteria.toLowerCase();
    return function( item ) {
      return item.name.toLowerCase().indexOf(criteria)>-1 || item.file_no.toLowerCase().indexOf(criteria) > -1;
    };
  };

  $scope.onSelect = function ($item, $model /** , $label */) {
    $scope.clear();
    $scope.selectedClients.push($model);
    $scope.go();
  };

  $scope.onKeypress = function($event) {
    if ($event.which === 13) {
      $scope.go();
    }
  };

  $scope.load = function(/** val */) {
    $scope.isLoading = true;
    return ClientsService.getData(REST_URL.SEARCH_CLIENTS).then(function(result) {
      $scope.clients = result.data;
      $scope.isLoading = false;
      return result.data;
    }, function() {
      $scope.isLoading = false;
    });
  };
  $rootScope.$on('clientCreated', function() {
    $scope.load();
  });
  $scope.$on(AUTH_EVENTS.loginSuccess, function() {
    if(!$scope.clients || $scope.clients.length===0) {
      $scope.load();
    }
  });

  if($location.path()!=='/') {
    if(!$scope.clients || $scope.clients.length===0) {
      $scope.load();
    }
  }
});

clientsCtrl.controller('ConfirmCloseClientDialog', function($scope, $modalInstance, APPLICATION, REST_URL, ClientsService, AuthService, CreateClientsService, data) {
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

    var json = {
      dateFormat: APPLICATION.DF_MIFOS,
      locale: 'en',
      closureDate: moment().tz(APPLICATION.TIMEZONE).format(APPLICATION.DF_MOMENT),
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
  $scope.hasPermission = function(permission) {
    console.log('PERMISSION: ' + permission);
    return AuthService.hasPermission(permission);
  };

});


clientsCtrl.controller('LoansCtrl', function($scope, $route, $location, $timeout, ClientsService, SearchService, CreateClientsService, REST_URL, APPLICATION) {
  console.log('LoansCtrl : Loans');
  //To load the loans page

  $scope.isLoading = false;
  $scope.rowCollection = [];
  $scope.displayed = [];
  $scope.pageSize = APPLICATION.PAGE_SIZE;
  $scope.currentPage = $route.current.params.page ? parseInt($route.current.params.page) : 1;
  $scope.pages = [];

  $scope.onSearch = function($event) {
    if(!$scope.searchTerm || $scope.searchTerm.trim()==='') {
      SearchService.clear('search');
    }
    if($event.keyCode===13) {
      loadLoans();
    }
  };

  $scope.goTo = function(p) {
    $scope.currentPage = p;
    loadLoans();
  };

  $scope.goNext = function() {
    $scope.currentPage++;
    loadLoans();
  };

  $scope.goPrevious = function() {
    $scope.currentPage--;
    loadLoans();
  };

  $scope.goLast = function() {
    $scope.currentPage = $scope.pages.length;
    loadLoans();
  };

  $scope.goFirst = function() {
    $scope.currentPage = 1;
    loadLoans();
  };

  $scope.setPageSize = function(s) {
    $scope.pageSize = s;
    $scope.goFirst();
  };

  //Success callback
  var allLoansSuccess = function(result) {
    $scope.isLoading = false;
    try {
      $scope.rowCollection = [];
      $scope.pages = [];

      if(result.data && result.data[0] && result.data[0].loanCount) {
        for(var j=1; j<=Math.ceil(result.data[0].loanCount/$scope.pageSize); j++) {
          $scope.pages.push({page: j, link: '#/loans/p/' + j});
        }
      }

      angular.forEach(result.data, function(loan) {
        loan.image = APPLICATION.NO_IMAGE_THUMB;

        $scope.rowCollection.push(loan);
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
      var offset = $scope.pageSize * ($scope.currentPage-1);
      var status = '%';

      SearchService.data('search', $scope.searchTerm);

      if(SearchService.data('search')) {
         $scope.searchTerm = SearchService.data('search');
      }
      var searchTerm = $scope.searchTerm && $scope.searchTerm.length>0 ? '%25' + $scope.searchTerm + '%25': '%25';
      if($route.current.params.loanStatus==='total') {
        status = "'ActiveInGoodStanding','ActiveInBadStanding'";
      } else if($route.current.params.loanStatus==='bad') {
        status = "'ActiveInBadStanding'";
      } else {
        status = "'Invalid', 'Submitted and awaiting approval', 'Approved', 'Active', 'Withdrawn by client', 'Rejected', 'Closed', 'Written-Off', 'Rescheduled', 'Overpaid', 'ActiveInGoodStanding', 'ActiveInBadStanding'";
      }
      ClientsService.getData(REST_URL.LOANS + '?R_limit=' + $scope.pageSize + '&R_offset=' + offset + '&R_status=' + status+ '&R_search=' + searchTerm).then(allLoansSuccess, allLoansFail);
    }, 2000);
  };

  $scope.showLoanDetails = function(loan) {
    $location.url('/loans/' + loan.clientId + '/details/' + loan.loanId);
  };

  loadLoans();
});

clientsCtrl.controller('LoansClosedCtrl', function($scope, $route, $location, $timeout, ClientsService, CreateClientsService, REST_URL, APPLICATION) {
  console.log('LoansClosedCtrl : Loans');
  //To load the loans page

  $scope.isLoading = false;
  $scope.rowCollection = [];
  $scope.displayed = [];
  $scope.pageSize = APPLICATION.PAGE_SIZE;
  $scope.currentPage = $route.current.params.page ? parseInt($route.current.params.page) : 1;
  $scope.pages = [];

  $scope.onKeyboard = function($event) {
    if($event.keyCode===37) {
      $scope.goPrevious();
    } else if($event.keyCode===30) {
      $scope.goNext();
    }
  };

  $scope.onSearch = function($event) {
    if($event.keyCode===13) {
      loadLoans();
    }
  };

  $scope.goTo = function(p) {
    $scope.currentPage = p;
    loadLoans();
  };

  $scope.goNext = function() {
    $scope.currentPage++;
    loadLoans();
  };

  $scope.goPrevious = function() {
    $scope.currentPage--;
    loadLoans();
  };

  $scope.goLast = function() {
    $scope.currentPage = $scope.pages.length;
    loadLoans();
  };

  $scope.goFirst = function() {
    $scope.currentPage = 1;
    loadLoans();
  };

  $scope.setPageSize = function(s) {
    $scope.pageSize = s;
    $scope.goFirst();
  };

  //Success callback
  var allLoansSuccess = function(result) {
    $scope.isLoading = false;
    try {
      $scope.rowCollection = result.data;

      $scope.pages = [];

      if(result.data && result.data[0] && result.data[0].loanCount) {
        for(var j=1; j<=Math.ceil(result.data[0].loanCount/$scope.pageSize); j++) {
          $scope.pages.push({page: j, link: '#/loansClosed/p/' + j});
        }
      }

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
      var offset = $scope.pageSize * ($scope.currentPage-1);
      var searchTerm = $scope.searchTerm && $scope.searchTerm.length>0 ? '%25' + $scope.searchTerm + '%25': '%25';
      ClientsService.getData(REST_URL.LOANS_CLOSED + '?R_limit=' + $scope.pageSize + '&R_offset=' + offset + '&R_search=' + searchTerm).then(allLoansSuccess, allLoansFail);
    }, 2000);
  };

  $scope.showLoanDetails = function(loan) {
    $location.url('/loans/' + loan.clientId + '/details/' + loan.loanId);
  };

  loadLoans();
});

clientsCtrl.controller('LoansPendingApprovalsCtrl', function($scope, $route, $timeout, LoanService, CreateClientsService, APPLICATION, REST_URL, $location, dialogs) {
  console.log('LoansPendingApprovalsCtrl : LoansPendingApprovals');
  //To load the LoansPendingApprovals page

  $scope.isLoading = false;
  $scope.rowCollection = [];
  $scope.displayed = [];
  $scope.pageSize = APPLICATION.PAGE_SIZE;
  $scope.currentPage = $route.current.params.page ? parseInt($route.current.params.page) : 1;
  $scope.pages = [];

  $scope.onKeyboard = function($event) {
    if($event.keyCode===37) {
      $scope.goPrevious();
    } else if($event.keyCode===30) {
      $scope.goNext();
    }
  };

  $scope.onSearch = function($event) {
    if($event.keyCode===13) {
      loadLoansPendingApprovals();
    }
  };

  $scope.goTo = function(p) {
    $scope.currentPage = p;
    loadLoansPendingApprovals();
  };

  $scope.goNext = function() {
    $scope.currentPage++;
    loadLoansPendingApprovals();
  };

  $scope.goPrevious = function() {
    $scope.currentPage--;
    loadLoansPendingApprovals();
  };

  $scope.goLast = function() {
    $scope.currentPage = $scope.pages.length;
    loadLoansPendingApprovals();
  };

  $scope.goFirst = function() {
    $scope.currentPage = 1;
    loadLoansPendingApprovals();
  };

  $scope.setPageSize = function(s) {
    $scope.pageSize = s;
    $scope.goFirst();
  };

  //Success callback
  var allLoansPendingApprovalsSuccess = function(result) {
    $scope.isLoading = false;
    try {
      $scope.rowCollection = result.data;

      $scope.pages = [];

      if(result.data && result.data[0] && result.data[0].loanCount) {
        for(var j=1; j<=Math.ceil(result.data[0].loanCount/$scope.pageSize); j++) {
          $scope.pages.push({page: j, link: '#/loansPendingApproval/p/' + j});
        }
      }
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
      var offset = $scope.pageSize * ($scope.currentPage-1);
      var searchTerm = $scope.searchTerm && $scope.searchTerm.length>0 ? '%25' + $scope.searchTerm + '%25': '%25';
      //service to get LoansPendingApprovals from server
      LoanService.getData(REST_URL.LOANS_PENDING_APPROVALS + '?R_limit=' + $scope.pageSize + '&R_offset=' + offset + '&R_search=' + searchTerm).then(allLoansPendingApprovalsSuccess, allLoansPendingApprovalsFail);
    }, 2000);
  };

  $scope.editLoan = function(loan) {
    //$location.url('/loans/' + loan.clientId + '/form/create/' + loan.loanId);
    $location.url('/loans/view/' + loan.loanId);
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

clientsCtrl.controller('LoansActionDialogCtrl', function($scope, $modalInstance, APPLICATION, REST_URL, AuthService, ClientsService, CreateClientsService, dialogs, data) {
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
        var json = {
          dateFormat: APPLICATION.DF_MIFOS,
          locale: 'en',
          rejectedOnDate: moment().tz(APPLICATION.TIMEZONE).format(APPLICATION.DF_MOMENT),
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
    var json = {
      dateFormat: APPLICATION.DF_MIFOS,
      locale: 'en',
      approvedOnDate: moment().tz(APPLICATION.TIMEZONE).format(APPLICATION.DF_MOMENT)
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


clientsCtrl.controller('LoansAwaitingDisbursementCtrl', function($scope, $route, $timeout, LoanService, APPLICATION, REST_URL, $location, dialogs) {
  console.log('LoansAwaitingDisbursementCtrl : LoansAwaitingDisbursement');
  //To load the LoansAwaitingDisbursement page

  $scope.isLoading = false;
  $scope.rowCollection = [];
  $scope.displayed = [];
  $scope.pageSize = APPLICATION.PAGE_SIZE;
  $scope.currentPage = $route.current.params.page ? parseInt($route.current.params.page) : 1;
  $scope.pages = [];

  $scope.onKeyboard = function($event) {
    if($event.keyCode===37) {
      $scope.goPrevious();
    } else if($event.keyCode===30) {
      $scope.goNext();
    }
  };

  $scope.onSearch = function($event) {
    if($event.keyCode===13) {
      loadLoansPendingApprovals();
    }
  };

  $scope.goTo = function(p) {
    $scope.currentPage = p;
    loadLoansPendingApprovals();
  };

  $scope.goNext = function() {
    $scope.currentPage++;
    loadLoansPendingApprovals();
  };

  $scope.goPrevious = function() {
    $scope.currentPage--;
    loadLoansPendingApprovals();
  };

  $scope.goLast = function() {
    $scope.currentPage = $scope.pages.length;
    loadLoansPendingApprovals();
  };

  $scope.goFirst = function() {
    $scope.currentPage = 1;
    loadLoansPendingApprovals();
  };

  $scope.setPageSize = function(s) {
    $scope.pageSize = s;
    $scope.goFirst();
  };

  //Success callback
  var allLoansAwaitingDisbursementSuccess = function(result) {
    $scope.isLoading = false;
    try {
      $scope.rowCollection = result.data;

      $scope.pages = [];

      if(result.data && result.data[0] && result.data[0].loanCount) {
        for(var j=1; j<=Math.ceil(result.data[0].loanCount/$scope.pageSize); j++) {
          $scope.pages.push({page: j, link: '#/loansAwaitingDisbursement/p/' + j});
        }
      }
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
      var offset = $scope.pageSize * ($scope.currentPage-1);
      var searchTerm = $scope.searchTerm && $scope.searchTerm.length>0 ? '%25' + $scope.searchTerm + '%25': '%25';
      LoanService.getData(REST_URL.LOANS_AWAITING_DISBURSEMENT + '?R_limit=' + $scope.pageSize + '&R_offset=' + offset + '&R_search=' + searchTerm).then(allLoansAwaitingDisbursementSuccess, allLoansAwaitingDisbursemensFail);
    }, 2000);
  };

  $scope.editLoan = function(loan) {
    //$location.url('/loans/' + loan.clientId + '/form/create/' + loan.loanId);
    $location.url('/loans/view/' + loan.loanId);
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


clientsCtrl.controller('LoansDisburseActionDialogCtrl', function($scope, $modalInstance, APPLICATION, REST_URL, ClientsService, CreateClientsService, AuthService, dialogs, data) {
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
    var json = {
      dateFormat: APPLICATION.DF_MIFOS,
      locale: 'en',
      actualDisbursementDate: moment($scope.baseLoan.actualDisbursementDate).tz(APPLICATION.TIMEZONE).format(APPLICATION.DF_MOMENT)
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

clientsCtrl.controller('LoansRejectedCtrl', function($scope, $route, $timeout, ClientsService, APPLICATION, REST_URL) {
  console.log('LoansRejectedCtrl : LoansRejected');
  //To load the LoansRejected page

  $scope.isLoading = false;
  $scope.rowCollection = [];
  $scope.displayed = [];
  $scope.pageSize = APPLICATION.PAGE_SIZE;
  $scope.currentPage = $route.current.params.page ? parseInt($route.current.params.page) : 1;
  $scope.pages = [];

  $scope.onKeyboard = function($event) {
    if($event.keyCode===37) {
      $scope.goPrevious();
    } else if($event.keyCode===30) {
      $scope.goNext();
    }
  };

  $scope.onSearch = function($event) {
    if($event.keyCode===13) {
      loadLoansRejected();
    }
  };

  $scope.goTo = function(p) {
    $scope.currentPage = p;
    loadLoansRejected();
  };

  $scope.goNext = function() {
    $scope.currentPage++;
    loadLoansRejected();
  };

  $scope.goPrevious = function() {
    $scope.currentPage--;
    loadLoansRejected();
  };

  $scope.goLast = function() {
    $scope.currentPage = $scope.pages.length;
    loadLoansRejected();
  };

  $scope.goFirst = function() {
    $scope.currentPage = 1;
    loadLoansRejected();
  };

  $scope.setPageSize = function(s) {
    $scope.pageSize = s;
    $scope.goFirst();
  };

  //Success callback
  var allLoansRejectedSuccess = function(result) {
    $scope.isLoading = false;
    try {
      $scope.rowCollection = result.data;

      $scope.pages = [];

      if(result.data && result.data[0] && result.data[0].loanCount) {
        for(var j=1; j<=Math.ceil(result.data[0].loanCount/$scope.pageSize); j++) {
          $scope.pages.push({page: j, link: '#/loansRejected/p/' + j});
        }
      }
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

        var offset = $scope.pageSize * ($scope.currentPage-1);
        var searchTerm = $scope.searchTerm && $scope.searchTerm.length>0 ? '%25' + $scope.searchTerm + '%25': '%25';
        //service to get allLoansAwaitingDisbursemensFail from server
        ClientsService.getData(REST_URL.LOANS_REJECTED + '?R_limit=' + $scope.pageSize + '&R_offset=' + offset + '&R_search=' + searchTerm).then(allLoansRejectedSuccess, allLoansRejectedFail);
      }, 2000
      );
  };

  loadLoansRejected();
});

clientsCtrl.controller('LoansWrittenOffCtrl', function($scope, $route, $timeout, $location, ClientsService, APPLICATION, REST_URL) {
  console.log('LoansWrittenOffCtrl : LoansWrittenOff');
  //To load the LoansWrittenOff page

  $scope.isLoading = false;
  $scope.rowCollection = [];
  $scope.displayed = [];
  $scope.pageSize = APPLICATION.PAGE_SIZE;
  $scope.currentPage = $route.current.params.page ? parseInt($route.current.params.page) : 1;
  $scope.pages = [];

  $scope.onKeyboard = function($event) {
    if($event.keyCode===37) {
      $scope.goPrevious();
    } else if($event.keyCode===30) {
      $scope.goNext();
    }
  };

  $scope.onSearch = function($event) {
    if($event.keyCode===13) {
      loadLoansWrittenOff();
    }
  };

  $scope.goTo = function(p) {
    $scope.currentPage = p;
    loadLoansWrittenOff();
  };

  $scope.goNext = function() {
    $scope.currentPage++;
    loadLoansWrittenOff();
  };

  $scope.goPrevious = function() {
    $scope.currentPage--;
    loadLoansWrittenOff();
  };

  $scope.goLast = function() {
    $scope.currentPage = $scope.pages.length;
    loadLoansWrittenOff();
  };

  $scope.goFirst = function() {
    $scope.currentPage = 1;
    loadLoansWrittenOff();
  };

  $scope.setPageSize = function(s) {
    $scope.pageSize = s;
    $scope.goFirst();
  };

  //Success callback
  var allLoansWrittenOffSuccess = function(result) {
    $scope.isLoading = false;
    try {
      $scope.rowCollection = result.data;

      $scope.pages = [];

      if(result.data && result.data[0] && result.data[0].loanCount) {
        for(var j=1; j<=Math.ceil(result.data[0].loanCount/$scope.pageSize); j++) {
          $scope.pages.push({page: j, link: '#/loansWrittenOff/p/' + j});
        }
      }
    } catch (e) {
    }
  };

  //failur callback
  var allLoansWrittenOffFail = function() {
    $scope.isLoading = false;
    console.log('Error : Return from LoansWrittenOff service.');
  };


  $scope.showLoan = function(loan) {
    $location.url('/loans/' + loan.id + '/details/' + loan.loanId);
  };

  var loadLoansWrittenOff = function getData() {
    $scope.isLoading = true;

    $timeout(function() {
      $scope.rowCollection = [];

      var offset = $scope.pageSize * ($scope.currentPage-1);
      var searchTerm = $scope.searchTerm && $scope.searchTerm.length>0 ? '%25' + $scope.searchTerm + '%25': '%25';
      //service to get LoansWritten from server
      ClientsService.getData(REST_URL.LOANS_WRITTEN_OFF + '?R_limit=' + $scope.pageSize + '&R_offset=' + offset + '&R_search=' + searchTerm).then(allLoansWrittenOffSuccess, allLoansWrittenOffFail);
    }, 2000);
  };

  loadLoansWrittenOff();
});
