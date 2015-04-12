'use strict';

var fyCtrl = angular.module('angularjsApp');

fyCtrl.controller('FinancialYearCtrl', function ($scope, FinancialYearService, APPLICATION, REST_URL, Utility) {

    $scope.open = function($event, name) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.calendar[name] = true;
    };

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

    $scope.clearFy = function() {
        $scope.form = {locale: 'en', dateFormat: APPLICATION.DF_MIFOS, current: false, closed: false};

        $scope.years = [];

        for(var i=2005; i<=new Date().getUTCFullYear(); i++) {
            $scope.years.push({startYear: i, endYear: i+1});
        }

        $scope.$watch('form.startYear', function() {
            angular.forEach($scope.years, function (year) {
                if($scope.form.startYear===year.startYear) {
                    $scope.form.startYear = year.startYear;
                    $scope.form.endYear = year.endYear;
                    if(!$scope.form.id) {
                        $scope.form.startDate = moment({year: year.startYear, month: 0, day: 1}).format(APPLICATION.DF_MOMENT);
                        $scope.form.endDate = moment({year: year.endYear, month: 11, day: 31}).format(APPLICATION.DF_MOMENT);
                    }
                }
            });
        });

        $scope.form.startYear = new Date().getUTCFullYear();
        $scope.calendar = {};
    };

    $scope.endYear = function() {
        $scope.form.closed = true;
        $scope.validateFy();
    };

    $scope.validateFy = function() {
        var data = angular.copy($scope.form);

        data.startDate = Utility.toServerDate(data.startDate);
        data.endDate = Utility.toServerDate(data.endDate);

        if(data.id) {
            delete data.id;
            FinancialYearService.updateYear(REST_URL.FINANCIALYEARS + '/' + $scope.form.id, data).then(function() {
                $scope.showSuccess('Financial year updated');
                $scope.loadFinancialYears();
            }, function(result) {
                $scope.showError('Financial year update failed: ' + result.data.defaultUserMessage, result.data.errors);
            });
        } else {
            FinancialYearService.saveYear(REST_URL.FINANCIALYEARS, data).then(function() {
                $scope.showSuccess('Financial year created');
                $scope.clearFy();
                $scope.loadFinancialYears();
            }, function(result) {
                $scope.showError('Financial year creation failed: ' + result.data.defaultUserMessage, result.data.errors);
            });
        }
    };

    $scope.selectFinancialYear = function(financialYear) {
        $scope.form.id = financialYear.id;
        $scope.form.startYear = financialYear.startYear;
        $scope.form.endYear = financialYear.endYear;
        $scope.form.startDate = financialYear.startDate;
        $scope.form.endDate = financialYear.endDate;
        $scope.form.current = financialYear.current;
        $scope.form.closed = financialYear.closed;
    };

    $scope.loadFinancialYears = function() {
        FinancialYearService.getData(REST_URL.FINANCIALYEARS).then(function(result) {
            $scope.financialYears = result.data;
            angular.forEach($scope.financialYears, function(year) {
                year.startDate = Utility.toLocalDate(year.startDate);
                year.endDate = Utility.toLocalDate(year.endDate);
            });
        }, function() {
            // TODO: do we need this?
        });
    };

    $scope.loadFinancialYears();
    $scope.clearFy();
});
