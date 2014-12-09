'use strict';

/**
 * @ngdoc overview
 * @name angularjsApp
 * @description
 * # angularjsApp
 *
 * Main module of the application.
 */
var app = angular.module('angularjsApp', [
  'ngRoute',
  'loginController',
  'dashboardController',
  'clientsController',
  'loanProductController',
  'chargesController',
  'createClientController',  
  'userServices',
  'journalService',
  'Constants',
  'ui.bootstrap',
  'angularFileUpload',
  'naif.base64',
  'webcam',
  'accountService',
  'angularTreeview',
  'dialogs.main'
]);

 // Angular supports chaining, so here we chain the config function onto
  // the module we're configuring.
  app.config(['$routeProvider',function($routeProvider) {
    $routeProvider.
      when('/', {
        hclass: 'pre-login',
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      }).
      when('/dashboard', {
        templateUrl: 'views/dashboard.html',
        controller: 'DashboardCtrl',
        data: {
            authorizedRoles: ['admin']
          }
      }).
      when('/clients', {
        templateUrl: 'views/Client/grids/clients.html',
        controller: 'ClientsCtrl',
        data: {
            authorizedRoles: ['admin']
          }
      }).
      when('/loans', {
        templateUrl: 'views/Client/grids/loans.html',
        controller: 'LoansCtrl',
        data: {
            authorizedRoles: ['admin']
          }
      }).
      when('/loansPendingApproval', {
        templateUrl: 'views/Client/grids/loansPendingApprovals.html',
        controller: 'LoansPendingApprovalsCtrl',
        data: {
            authorizedRoles: ['admin']
          }
      }).
      when('/loansAwaitingDisbursement', {
        templateUrl: 'views/Client/grids/loansAwaitingDisbursement.html',
        controller: 'LoansAwaitingDisbursementCtrl',
        data: {
            authorizedRoles: ['admin']
          }
      }).
       when('/loansRejected', {
        templateUrl: 'views/Client/grids/loansRejected.html',
        controller: 'LoansRejectedCtrl',
        data: {
            authorizedRoles: ['admin']
          }
      }).
      when('/loansWrittenOff', {
        templateUrl: 'views/Client/grids/loansWrittenOff.html',
        controller: 'LoansWrittenOffCtrl',
        data: {
            authorizedRoles: ['admin']
          }
      }).
      when('/configuration', {
        templateUrl: 'views/configuration.html',
        data: {
            authorizedRoles: ['admin']
          }
      }).
      when('/loanProducts', {
        templateUrl: 'views/Product/loanProducts.html',
        controller: 'LoanProductsCtrl',
        data: {
            authorizedRoles: ['admin']
          }
      }).
      when('/charges', {
        templateUrl: 'views/Product/charges.html',
        controller: 'ChargesCtrl',
        data: {
            authorizedRoles: ['admin']
          }
      }).
      when('/createloanproduct', {
        templateUrl: 'views/Product/createLoanProduct.html',
        controller: 'LoansWrittenOffCtrl',
        data: {
            authorizedRoles: ['admin']
          }
      }).
      when('/createCharge', {
        templateUrl: 'views/Product/createCharge.html',
        controller: '',
        data: {
            authorizedRoles: ['admin']
          }
      }).when('/editloanproduct/:id', {
          templateUrl: 'views/Product/editloanproduct.html',
          controller: 'EditLoanProductsCtrl',
          data: {
            authorizedRoles: ['admin']
          }
      }).when('/mapAccount/:id', {
          templateUrl: 'views/Product/mapAccount.html',
          controller: 'MapAccountingCtrl',
          data: {
            authorizedRoles: ['admin']
          }
      }).when('/editCharge/:id', {
          templateUrl: 'views/Product/editCharge.html',
          controller: 'EditChargeCtrl',
          data: {
            authorizedRoles: ['admin']
          }
      }).when('/createClient', {
          templateUrl: 'views/Client/basicClientInfo.html',
          controller: 'CreateClientCtrl',
          data: {
            authorizedRoles: ['admin']
          }
      }).when('/editbasicclientinfo/:id', {
          templateUrl: 'views/Client/editBasicClientInfo.html',
          controller: 'EditClientCtrl',
          data: {
            authorizedRoles: ['admin']
          }
      }).when('/editadditionalclientinfo/:id', {
          templateUrl: 'views/Client/additionalClientInfo.html',
          controller: 'CreateClientAdditionalInfoCtrl',
          data: {
            authorizedRoles: ['admin']
          }
      }).when('/editclientidentification/:id', {
          templateUrl: 'views/Client/addClientIdentification.html',
          controller: 'ClientIdentificationCtrl',
          data: {
            authorizedRoles: ['admin']
          }
      }).when('/editnextofkeen/:id', {
          templateUrl: 'views/Client/addNextOfKeen.html',
          controller: 'ClientNextToKeenCtrl',
          data: {
            authorizedRoles: ['admin']
          }
      }).when('/editbusinessdetails/:id', {
          templateUrl: 'views/Client/addBusinessDetails.html',
          controller: 'ClientBusinessActivityCtrl',
          data: {
            authorizedRoles: ['admin']
          }
      }).when('/editnextofkeen/:id/:rowid', {
          templateUrl: 'views/Client/addNextOfKeen.html',
          controller: 'ClientNextToKeenCtrl',
          data: {
            authorizedRoles: ['admin']
          }
      }).when('/accounting', {
          templateUrl: 'views/accounting/chart.html',
          controller: 'AccountingChartCtrl',
          data: {
            authorizedRoles: ['admin']
          }
      }).when('/accounting/chart', {
          templateUrl: 'views/accounting/chart.html',
          controller: 'AccountingChartCtrl',
          data: {
            authorizedRoles: ['admin']
          }
      }).when('/accounting/edit/:id', {
          templateUrl: 'views/accounting/edit.account.html',
          controller: 'AccountingEditCtrl',
          data: {
            authorizedRoles: ['admin']
          }
      }).when('/accounting/create', {
          templateUrl: 'views/accounting/edit.account.html',
          controller: 'AccountingEditCtrl',
          data: {
            authorizedRoles: ['admin']
          }
      }).when('/journalentries', {
          templateUrl: 'views/Journalentries/journalentries.html',
          controller: 'JournalEntriesCtrl',
          data: {
            authorizedRoles: ['admin']
          }
      }).when('/journalentries/details/:id', {
          templateUrl: 'views/Journalentries/journalentriesDetails.html',
          controller: 'JournalEntriesDetailsCtrl',
          data: {
            authorizedRoles: ['admin']
          }
      }).when('/journalentries/create', {
          templateUrl: 'views/Journalentries/createJournalentries.html',
          controller: 'CreateJournalEntriesCtrl',
          data: {
            authorizedRoles: ['admin']
          }
      }).otherwise({
        redirectTo: '/'
      });
  }]);

//Function to set the default headers for each request made to the rest api
app.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.headers.common['X-Mifos-Platform-TenantId'] = 'default';
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        $httpProvider.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
    }
]);

//function to be called when the application gets running
app.run(function ($rootScope, $location, AUTH_EVENTS, AuthService, Session, APPLICATION,PAGE_URL) {
  //total number of records in single page
  $rootScope.itemsByPage = APPLICATION.PAGE_SIZE;
  //total number of page in single page
  $rootScope.displayedPages = APPLICATION.DISPLAYED_PAGES;
  $rootScope.page = {
      setHclass: function(hclass) {
          this.hclass = hclass;
      }
  };

  //TODO: we need to find a way to remove from root scope
  $rootScope.pdfExport = function(ignoreColumns){
    var cols = [];
    if(ignoreColumns !== undefined && ignoreColumns.indexOf(',') !== -1){
      cols = ignoreColumns.split(',');
    }
    if(ignoreColumns !== undefined && ignoreColumns.indexOf(',') === -1){
      cols = [ignoreColumns];
    }

      $('.table').tableExport({type:'pdf',
          ignoreColumn: cols, 
          escape:'false',
          pdfFontSize:7,
          pdfLeftMargin:5
      });  
  };
  
  //TODO: we need to find a way to remove from root scope
  $rootScope.xlsExport = function(ignoreColumns){
       var cols = [];
      if(ignoreColumns !== undefined && ignoreColumns.indexOf(',') !== -1){
         cols = ignoreColumns.split(',');
      }
      if(ignoreColumns !== undefined && ignoreColumns.indexOf(',') === -1){
        cols = [ignoreColumns];
      }

      $('.table').tableExport({type:'excel',
          ignoreColumn: cols, 
          escape:'false'
      });  
  };

  //TODO default template for the batch request processing
  $rootScope.batchAPITemplate = function(requestno,requestUrl,requestMethod,jsonData){
      var cols = '{ "requestId":'+requestno+',"relativeUrl":"'+requestUrl+'","method":"'+requestMethod+'",'+
    '"headers":[ {"name":"Content-type","value":"application/json; charset=utf-8"},{"name":"X-Mifos-Platform-TenantId","value":"default"}],'+
    '"body":"'+jsonData+'"}';  
    return cols;
  };

  $rootScope.$on('$routeChangeSuccess', function(event, current) {
        $rootScope.page.setHclass(current.$$route.hclass);
  });

  //To update after view reloaded
  $rootScope.$on('$includeContentLoaded', function() {
    console.log('includeContentLoaded: includeContentLoaded success!');
      //get top navigation menu
        var $topNavigation = angular.element('#main-navbar-collapse .nav.navbar-nav:first');
        //find all li tags (menus) from top UL
        var $liEle = $topNavigation.find('li');
        //check length
        if ($liEle.length > 0) {
          //travers to each menu item to remove selected menu class
          $liEle.each(function() {
              var $li=$(this);
              $li.removeClass('active');
          });
        }
        var SPLIT_LOCATION_PATH = $location.path().split('/');
        var LOCATION_PATH = '/'+SPLIT_LOCATION_PATH[1];
        //add active /selection class for open view menu item      
        switch(LOCATION_PATH){
          case PAGE_URL.CLIENTS:
          case PAGE_URL.LOANS:
          case PAGE_URL.LOANSAWAITINGDISBURSEMENT:
          case PAGE_URL.LOANSPENDINGAPPROVAL:
          case PAGE_URL.LOANSREJECTED:
          case PAGE_URL.LOANSWRITTENOFF:
          case PAGE_URL.CREATE_CLIENT:
          case PAGE_URL.EDIT_BASIC_CLIENT_INFORMATION:
          case PAGE_URL.EDIT_CLIENT_ADDITIONAL_INFO:
          case PAGE_URL.EDIT_CLIENT_IDENTIFICATION:
          case PAGE_URL.EDIT_CLIENT_NEXT_OF_KEEN:
          case PAGE_URL.EDIT_CLIENT_BUSINESS_DETAILS:
            $topNavigation.find('.clients').parent().addClass('active');
            break;
          case PAGE_URL.CONFIGURATION:
          case PAGE_URL.LOANPRODUCTS:
          case PAGE_URL.CHARGES:
          case PAGE_URL.CREATELOANPRODUCT:
          case PAGE_URL.CREATECHARGE:
          case PAGE_URL.EDITLOANPRODUCT:
          case PAGE_URL.EDITCHARGE:
          case PAGE_URL.MAPACCOUNTING:
            $topNavigation.find('.configuration').parent().addClass('active');
            break;  
          case PAGE_URL.ACCOUNTING:
          case PAGE_URL.JOURNALENTRIES:
            $topNavigation.find('.accounting').parent().addClass('active');
            break;
          default:
            $topNavigation.find('.home').parent().addClass('active');
        }
  });

  $rootScope.$on('$stateChangeStart', function (event, next) {    
    var authorizedRoles = next.data.authorizedRoles;
    if (!AuthService.isAuthorized(authorizedRoles)) {
      event.preventDefault();
      if (AuthService.isAuthenticated()) {
        // user is not allowed
        $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
      } else {
        // user is not logged in
        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
      }
    }
  });

  //hendled notAuthenticated event
  $rootScope.$on(AUTH_EVENTS.notAuthenticated, function () {
    $location.url(PAGE_URL.ROOT);
  });
  $rootScope.$on(AUTH_EVENTS.sessionTimeout, function () {
    $location.url(PAGE_URL.ROOT);
  });  

  if(Session.getValue(APPLICATION.authToken) !== null){
    if($location.path()===PAGE_URL.ROOT || $location.path()===''){
      $location.url(PAGE_URL.DASHBOARD);
    }
  }else{
    //TODO - Need to remove else block once all the functionality will be implemented
    $location.url(PAGE_URL.ROOT);
  }
});

app.config(function ($httpProvider) {
  $httpProvider.interceptors.push([
    '$injector',
    function ($injector) {
      return $injector.get('AuthInterceptor');
    }
  ]);
});

app.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
  return {
    responseError: function (response) { 
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
        403: AUTH_EVENTS.notAuthorized,
        419: AUTH_EVENTS.sessionTimeout,
        440: AUTH_EVENTS.sessionTimeout
      }[response.status], response);
      return $q.reject(response);
    }
  };
});

app.controller('ApplicationController', function ($scope, $location, USER_ROLES, AuthService) {  
  $scope.currentUser = null;
  $scope.userRoles = USER_ROLES;
  $scope.isAuthorized = AuthService.isAuthorized;
 
  $scope.setCurrentUser = function (user) {
    $scope.currentUser = user;
  };

  $scope.changeView = function (view) {
    $location.path(view);
  };
});

//Factory to manage the session related things for the application
app.factory('Session', function(APPLICATION) {
  

  var Session = {
    create: function(sessionId, userName, userRole){
      var data = {};
      data[APPLICATION.authToken] = sessionId;
      data[APPLICATION.username] = userName;
      data[APPLICATION.role] = userRole;
      window.localStorage.setItem('ang_session', JSON.stringify(data));
    },
    setValue: function(key, value) { 
      var data = {};
      try {
        data =  JSON.parse(window.localStorage.getItem(APPLICATION.sessionName));
      } catch (e) {
        console.log('Error to get session data from local storage');
        return null;
      }
      data[key] = value;
      window.localStorage.setItem('ang_session', JSON.stringify(data)); 
    },
    getValue: function(key) { 
      var data = {};
      try {
        data =  JSON.parse(window.localStorage.getItem(APPLICATION.sessionName));
        return data[key];
      } catch (e) {
        console.log('Error to get session data from local storage');
        return null;
      }
      
    },
    remove: function(){
      var data = {};
      window.localStorage.setItem(APPLICATION.sessionName, JSON.stringify(data));
    }
  };
  
  return Session; 
});

//Directive for the validation of each mandatory field
app.directive('showValidation', [function() {
    return {
        restrict: 'A',
        require:'form',
        link: function(scope, element) {
            element.find('.validate').each(function() {
                var $formGroup=$(this);
                var $inputs = $formGroup.find('input[ng-model],textarea[ng-model],select[ng-model]');

                if ($inputs.length > 0) {
                    $inputs.each(function() {
                        var $input=$(this);
                        scope.$watch(function() {
                            return $input.hasClass('ng-invalid');
                        }, function(isInvalid) {
                            var $spanEle = $formGroup.find('span');
                            if ($spanEle.length > 0) {
                              $spanEle.each(function() {
                                  var $span=$(this);
                                  $span.toggleClass('glyphicon-remove', isInvalid);
                                  $span.toggleClass('glyphicon-ok', !isInvalid);    
                              });
                            }
                            $formGroup.toggleClass('has-success', !isInvalid);
                            $formGroup.toggleClass('has-error', isInvalid);
                        });
                    });
                }
            });
        }
    };
}]);

//Directive to validate the field for only numbers as the input
 app.directive('onlyDigits', function () {
    return {
      require: 'ngModel',
      restrict: 'A',
      link: function (scope, element, attr, ctrl) {
        function inputValue(val) {
          if (val) {
            var digits = val.replace(/[^0-9.]/g, '');

            if (digits !== val) {
              ctrl.$setViewValue(digits);
              ctrl.$render();
            }
            return parseFloat(digits);
          }
          return undefined;
        }            
        ctrl.$parsers.push(inputValue);
      }
    };
});

//color code status for each data tables
app.filter('status', [ function() {
    var STATUS_COLOR_CODE = {'0': 'status bad',//red
      '100': 'status on-hold',//yellow
      '200': 'status on-hold',//yellow
      '300': 'status active',//green
      '400': 'status closed',//grey
      '500': 'status closed',//grey
      '600': 'status closed',//grey
      '601': 'status closed',//grey
      '602': 'status active',//green
      '700': 'status active',//green
      '800': 'status active',//green
      '900': 'status active'//green
    };
    return function(statusCode) {
      return STATUS_COLOR_CODE[statusCode];
    };
}]);

//Populate data values into table
app.filter('getDropdownValues', [ function() {
    return function(id, dataValues){    
      for(var i=0; i<dataValues.length; i++){
        if(id===dataValues[i].id){
          return dataValues[i].value;
        }
      } 
  };
}]);

//Populate data names into table
app.filter('getDropdownNames', [ function() {
    return function(id, dataValues){    
      for(var i=0; i<dataValues.length; i++){
        if(id===dataValues[i].id){
          return dataValues[i].name;
        }
      } 
  };
}]);

//Convert months into monthly in repaymentFrequencyType
app.filter('getRepaymentFrequencyType', [ function() {
    var value; 
    return function(name){
      value = name;
      if(name==='Months'){
        value = 'Monthly';
      }
      return value;
  };
}]);

//Give type value on charges grid
app.filter('getChargeType', [ function() {
    var value; 
    return function(type){
      value = 'Charge';
      if(type){
        value = 'Penalty';
      }
      return value;
  };
}]);

//color code status for each data tables
app.filter('checkEmptyString', [ function() {
    return function(value) {
      return value==='';
    };
}]);