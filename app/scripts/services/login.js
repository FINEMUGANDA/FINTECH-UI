'use strict';

var userServices = angular.module('userServices', ['delegatorServices']);

userServices.factory('AuthService', function($rootScope, $http, $filter, Remote, Session, ReportService, REST_URL, APPLICATION, AUTH_EVENTS) {
    var userPermissions = {};
    var reportPermissions = {};
    var service = {
        authentication: function(url) {
            // TODO: put all the business logic here instead of the controller!
            console.log('Authentication service...');
            delete $http.defaults.headers.common.Authorization;
            var promise = Remote.post(url);
            return promise;
        },
        logout: function() {
            userPermissions = {};
            reportPermissions = {};
            Remote.cancelAuthorization();
            Session.remove();
            $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
        },
        isAuthenticated: function () {
            // TODO: deprecated; this is not fine grained enough; remove once we are done with tests
            return !!Session.getValue(APPLICATION.authToken);
        },
        isAuthorized: function (authorizedRoles) {
            // TODO: deprecated; this is not fine grained enough; remove once we are done with tests
            if (!angular.isArray(authorizedRoles)) {
                authorizedRoles = [authorizedRoles];
            }
            return (this.isAuthenticated() && authorizedRoles.indexOf(Session.getValue(APPLICATION.role)) !== -1);
        },
        hasPermission: function(permission) {
            if(userPermissions) {
                return (userPermissions[permission]===true || userPermissions.ALL_FUNCTIONS===true);
            } else {
                return false;
            }
        },
        hasAnyPermission: function(permissions) {
            for(var i=0; i<permissions.length; i++) {
                if(this.hasPermission(permissions[i])) {
                    return true;
                }
            }

            return false;
        },
        hasAllPermissions: function(permissions) {
            var result = true;
            for(var i=0; i<permissions.length; i++) {
                result = result && this.hasPermission(permissions[i]);
                // we can break early if there is one missing permission
                if(!result) {
                    return result;
                }
            }

            return result;
        },
        hasAllReportCategoryPermissions: function(categories) {
            var result = true;
            for(var i=0; i<categories.length; i++) {
                result = result && this.hasReportCategoryPermission(categories[i]);
            }

            return result;
        },
        hasAnyReportCategoryPermission: function(categories) {
            for(var i=0; i<categories.length; i++) {
                if(this.hasReportCategoryPermission(categories[i])) {
                    return true;
                }
            }

            return false;
        },
        hasReportCategoryPermission: function(category) {
            return reportPermissions[category]===true || userPermissions.ALL_FUNCTIONS===true;
        },
        reloadPermissions: function() {
            angular.forEach(Session.getValue(APPLICATION.permissions), function(permission) {
                //console.log('xxx ROUTE: ' + permission);
                userPermissions[permission] = true;
            });

            // report categories
            ReportService.getData(REST_URL.RUN_REPORTS +'/' + 'FullReportList?parameterType=true').then(function(result) {
                angular.forEach(result.data, function(report) {
                    console.log('yyy ROUTE: ' + report.report_category);
                    reportPermissions[report.report_category] = true;
                });
                //$rootScope.$broadcast(AUTH_EVENTS.reportPermissionUpdate);
            }, function(){
                // TODO: do we need this?
                //reportPermissions = {};
            });
        },
        userPermissions: function() {
            //return Session.getValue(APPLICATION.permissions);
            return userPermissions;
        },
        reportPermissions: function() {
            return reportPermissions;
        }
    };

    $rootScope.$on(AUTH_EVENTS.loginSuccess, function(/** event, data */) {
        service.reloadPermissions();
    });
    $rootScope.$on(AUTH_EVENTS.permissionUpdate, function(event, data) {
        if(Session.getValue(APPLICATION.role).name===data.role) {
            userPermissions = data.permissions;

            var permissions = [];
            var keys = Object.keys(data.permissions);
            for(var i=0; i<keys.length; i++) {
                if(data.permissions[keys[i]]===true) {
                    //console.log('qqq ROUTE: ' + keys[i] + ': ' + data.permissions[keys[i]]);
                    permissions.push(keys[i]);
                }
            }
            Session.setValue(APPLICATION.permissions, permissions);
        }
    });
    $rootScope.$on(AUTH_EVENTS.logoutSuccess, function() {
        userPermissions = {};
        //service.reloadPermissions();
    });
    $rootScope.$on(AUTH_EVENTS.sessionTimeout, function() {
        userPermissions = {};
        //service.reloadPermissions();
    });

    service.reloadPermissions();

    return service;
});