'use strict';

// Here we attach this controller to our testApp module
var LoginCtrl = angular.module('loginController', ['userServices', 'Utils', 'Constants']);

// The controller function let's us give our controller a name: MainCtrl
// We'll then pass an anonymous function to serve as the controller itself.
LoginCtrl.controller('LoginCtrl', function ($scope, $rootScope, $location, Auth, AuthService, Utility, AUTH_EVENTS, REST_URL, PAGE_URL, Session, Base64, Remote) {
    //Authentication controller
    $scope.authenticate = function (loginDetails) {
        //reset error value
        $scope.error = false;
        //Validate login form
        if ($scope.loginForm.$valid) {
            //check for null details
            if (!Utility.isUndefinedOrNull(loginDetails)) {
                //Set the credentials in header
                Auth.setCredentials(loginDetails.username, loginDetails.password);
                //Fired authentication call to server
                var authURL = REST_URL.AUTHENTICATION + '?username=' + loginDetails.username + '&password=' + loginDetails.password;

                //authentication success callback
                var authenticationSuccess = function (result) {
                    //Create a new user session
                    Session.create(Base64.encode(loginDetails.username + ':' + loginDetails.password), result.data.username, result.data.roles[0]);
                    //Broadcast a login success event
                    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                    //Redirect Dashboard page
                    $location.url(PAGE_URL.DASHBOARD);
                };
                AuthService.authentication(authURL).then(authenticationSuccess, $scope.authenticationFail);
            } else {
                $scope.authenticationFail();
            }
        } else {
            $scope.invalidateForm();
        }
    };

    //Authentication logout controller
    $scope.logout = function () {
        Remote.cancelAuthorization();
        Session.remove();
        $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
        $location.url('/');

        /**
         AuthService.logout(REST_URL.AUTHENTICATION).then(function(result){
            Session.remove();
            $location.url(PAGE_URL.ROOT);
            $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
            console.log(result);
            $location.url('/');
        },function(result){
            console.log(result);
            console.log('Error : Return from logout service.');
        });
         */
    };

    //authentication fail callback
    $scope.authenticationFail = function (result) {
        //Broadcast a login failed event
        $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
        $scope.error = true;
    };

    //invalidate login form
    $scope.invalidateForm = function () {
        $scope.loginForm.invalidate = false;
    };

    //Clear error from the login page
    $scope.clearError = function () {
        $scope.loginForm.invalidate = false;
    };
});