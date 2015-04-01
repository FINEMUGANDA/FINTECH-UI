'use strict';

var codeCtrl = angular.module('angularjsApp');

codeCtrl.controller('CodeListCtrl', function ($scope, REST_URL, CodeService) {
    $scope.codeId = null;
    $scope.loading = false;

    $scope.loadCodeValues = function() {
        $scope.loading = true;
        CodeService.getData(REST_URL.CODES + '/' + $scope.codeId + '/codevalues').then(function(result) {
            $scope.loading = false;
            $scope.codeValues = result.data;
        }, function() {
            $scope.loading = false;
            // TODO: do we really need this?
        });
    };

    $scope.save = function() {
        $scope.loading = true;
        if($scope.codeValue.id) {
            CodeService.updateCode(REST_URL.CODES + '/' + $scope.codeId + '/codevalues/' + $scope.codeValue.id, angular.toJson($scope.codeValue)).then(function() {
                $scope.loading = false;
                $scope.codeValue = {};
                if($scope.codeId) {
                    $scope.loadCodeValues();
                }
            }, function() {
                $scope.loading = false;
                // TODO: do we really need this?
            });
        } else {
            CodeService.saveCode(REST_URL.CODES + '/' + $scope.codeId + '/codevalues', angular.toJson($scope.codeValue)).then(function() {
                $scope.loading = false;
                $scope.codeValue = {};
                if($scope.codeId) {
                    $scope.loadCodeValues();
                }
            }, function() {
                $scope.loading = false;
                // TODO: do we really need this?
            });
        }
    };

    $scope.select = function(codeValue) {
        $scope.loading = true;
        CodeService.getData(REST_URL.CODES + '/' + $scope.codeId + '/codevalues/' + codeValue.id).then(function(result) {
            $scope.loading = false;
            $scope.codeValue = result.data;
        }, function() {
            $scope.loading = false;
            // TODO: do we really need this?
        });
    };

    $scope.remove = function(codeValue) {
        $scope.loading = true;
        CodeService.deleteCode(REST_URL.CODES + '/' + $scope.codeId + '/codevalues/' + codeValue.id).then(function() {
            $scope.loading = false;
            if($scope.codeId) {
                $scope.loadCodeValues();
            }
        }, function() {
            $scope.loading = false;
            // TODO: do we really need this?
        });
    };

    $scope.$watch('codeId', function() {
        if($scope.codeId) {
            $scope.codeValue = {};
            $scope.loadCodeValues();
        }
    });

    CodeService.getData(REST_URL.CODES).then(function(result) {
        $scope.codes = result.data;
    }, function() {
        // TODO: do we really need this?
    });
});
