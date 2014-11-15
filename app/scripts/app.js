'use strict';

/**
 * @ngdoc overview
 * @name angularjsApp
 * @description
 * # angularjsApp
 *
 * Main module of the application.
 */
var app = angular.module('angularjsApp', ['ngRoute', 'loginController','dashboardController','clientsController','userServices','Constants']);

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
        templateUrl: 'views/clients.html',
        controller: 'ClientsCtrl',
        data: {
            authorizedRoles: ['admin']
          }
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);

app.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.headers.common['X-Mifos-Platform-TenantId'] = 'default';
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        $httpProvider.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
    }
]);


app.run(function ($rootScope, $location, AUTH_EVENTS, AuthService, Session, APPLICATION,PAGE_URL) {
  
  $rootScope.page = {
      setHclass: function(hclass) {
          this.hclass = hclass;
      }
  }

  $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
        $rootScope.page.setHclass(current.$$route.hclass);
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
  $rootScope.$on(AUTH_EVENTS.notAuthenticated, function (event, next) {
    $location.url(PAGE_URL.ROOT);
  });
  $rootScope.$on(AUTH_EVENTS.sessionTimeout, function (event, next) {
    $location.url(PAGE_URL.ROOT);
  });  

  if(Session.getValue(APPLICATION.authToken) != null){
    $location.url(PAGE_URL.DASHBOARD);
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
})

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
})

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

app.directive('showValidation', [function() {
    return {
        restrict: "A",
        require:'form',
        link: function(scope, element, attrs, formCtrl) {
            element.find('.form-group').each(function() {
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
