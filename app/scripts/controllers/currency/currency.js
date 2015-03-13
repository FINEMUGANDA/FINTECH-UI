'use strict';

var currencyController = angular.module('currencyController', ['currencyService', 'Constants', 'smart-table']);

currencyController.controller('CurrencyCtrl', function($scope, $location, CurrencyService, REST_URL) {
    $scope.formData = {currencies: []};
    $scope.selectedCurrencyOptions = [];
    $scope.currencyOptions = [];

    $scope.showSuccess = function (message) {
        $scope.type = 'alert-success';
        $scope.message = message;
        $scope.errors = [];
    };

    $scope.showError = function (message, errors) {
        $scope.type = 'error';
        $scope.message = message;
        $scope.errors = errors ? errors : [];
    };

    $scope.save = function() {
        CurrencyService.updateCurrency(REST_URL.CURRENCY_LIST, angular.toJson($scope.formData)).then(function(result) {
            console.log(angular.toJson('CURRENCY SUCCESS: ' + result));
            $scope.showSuccess('Currencies update success');
        }, function(result) {
            // TODO: error handling
            $scope.showError('Currencies update failed: ' + result.data.defaultUserMessage, result.data.errors);
        });
    };

    CurrencyService.getData(REST_URL.CURRENCY_LIST).then(function(result) {
        //console.log(angular.toJson(result));
        $scope.formData.base = result.data.base;
        $scope.currencyOptions = result.data.currencyOptions;
        angular.forEach(result.data.selectedCurrencyOptions, function(currency) {
            console.log('CURRENCY: ' + currency.code);
            $scope.currencyOptions.push(currency);
            $scope.formData.currencies.push(currency.code);
        });
    }, function() {
        // TODO: error handling
    });
});