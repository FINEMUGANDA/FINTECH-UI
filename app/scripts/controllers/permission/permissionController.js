'use strict';

angular.module('angularjsApp').controller('PermissionController', function ($route, $scope, PermissionService, REST_URL, $location) {
    $scope.isLoading = true;

    $scope.showSuccess = function (message, url) {
        $scope.type = 'alert-success';
        $scope.message = message;
        $scope.errors = [];
        $location.url(url);
    };

    $scope.showError = function (message, errors) {
        $scope.type = 'error';
        $scope.message = message;
        $scope.errors = errors ? errors : [];
    };

    $scope.validatePermission = function () {
        // TODO: implement this
    };

    if ($route.current.params.id) {
        // TODO: implement this
    } else {
        PermissionService.getData(REST_URL.BASE + 'permissions?tenantIdentifier=default').then(function (result) {
            $scope.isLoading = false;
            $scope.permissions = result.data;
        }, function () {
            $scope.showError('Error : Return from loadRole.');
        });
    }
});
