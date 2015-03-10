'use strict';

var exchangeRateController = angular.module('exchangeRateController', ['exchangeRateService', 'Constants', 'smart-table']);

exchangeRateController.controller('ExchangeRateCtrl', function($scope, $location, ExchangeRateService, CurrencyService, REST_URL) {
    $scope.selectedCurrencyOptions = [];
    $scope.currencyOptions = [];
    $scope.rates = [];
    $scope.months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

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

    $scope.resetRate = function() {
        $scope.rate = {dateFormat: 'dd/MM/yyyy', locale: 'en', rate_year: new Date().getUTCFullYear(), rate_month: new Date().getUTCMonth()+1};
    };

    $scope.reloadRates = function() {
        ExchangeRateService.getData(REST_URL.EXCHANGE_RATE + $scope.office.id).then(function(result) {
            $scope.rates = result.data;
        });
    };

    $scope.selectRate = function(rate) {
        $scope.rate = rate;
        $scope.rate.locale = 'en';
        $scope.rate.dateFormat = 'dd/MM/yyyy';
    };

    $scope.removeRate = function(rate) {
        ExchangeRateService.deleteRate(REST_URL.EXCHANGE_RATE + $scope.office.id + '/' + rate.id).then(function() {
            if($scope.rate.id===rate.id) {
                $scope.resetRate();
            }
            $scope.reloadRates();
        }, function(result) {
            $scope.showError('Cannot delete exchange rate: ' + result.data.defaultUserMessage, result.data.errors);
        });
    };

    $scope.save = function() {
        if($scope.rate.id) {
            // update
            ExchangeRateService.updateRate(REST_URL.EXCHANGE_RATE + $scope.office.id, angular.toJson($scope.rate)).then(function() {
                $scope.showSuccess('Exchange rate updated');
            }, function(result) {
                $scope.showError('Cannot update exchange rate: ' + result.data.defaultUserMessage, result.data.errors);
            });
        } else {
            // create
            ExchangeRateService.saveRate(REST_URL.EXCHANGE_RATE + $scope.office.id, angular.toJson($scope.rate)).then(function(result) {
                $scope.showSuccess('Exchange rate created ' + angular.toJson(result.config.data));
                $scope.resetRate();
            }, function(result) {
                $scope.showError('Cannot create exchange rate: ' + result.data.defaultUserMessage, result.data.errors);
            });
        }
    };

    CurrencyService.getData(REST_URL.CURRENCY_LIST).then(function(result) {
        $scope.rate.base_code = result.data.base;
        //$scope.rate.target_code = result.data.base;
        $scope.currencyOptions = [];
        angular.forEach(result.data.selectedCurrencyOptions, function(currency) {
            $scope.currencyOptions.push(currency);
        });
    }, function(result) {
        // TODO: error handling
    });

    CurrencyService.getData(REST_URL.OFFICE_LIST).then(function(result) {
        angular.forEach(result.data, function(office) {
            // NOTE: this is a trick to be able to use datatables (a constraint by Mifos); office (the root especially) is just a vehicle to attach the exchange rates to the system
            if(office.hierarchy==='.') {
                $scope.office = office;
                $scope.reloadRates();
            }
        });
    }, function(result) {
        // TODO: error handling
    });
    $scope.resetRate();
});