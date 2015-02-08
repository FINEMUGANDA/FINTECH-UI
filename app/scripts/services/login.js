'use strict';

var userServices = angular.module('userServices', ['delegatorServices']);

userServices.factory('AuthService', function($http, $filter, Remote, Session) {
    return {
	  	    authentication: function(url) { 
                console.log('Authentication service...'); 
                delete $http.defaults.headers.common.Authorization; 
                var promise = Remote.post(url); 
		  	    return promise;
		  	},
            logout: function(url){
                console.log('Logout service...'); 
                var promise = Remote.delete(url); 
                return promise;
            },
            isAuthenticated: function () {
                return !!Session.getValue(APPLICATION.authToken);
            },
            isAuthorized: function (authorizedRoles) {
                if (!angular.isArray(authorizedRoles)) {
                    authorizedRoles = [authorizedRoles];
                }
                return (this.isAuthenticated() && authorizedRoles.indexOf(Session.getValue(APPLICATION.role)) !== -1);
            }
	};
});