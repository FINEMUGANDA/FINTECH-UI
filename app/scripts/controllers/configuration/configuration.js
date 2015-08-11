'use strict';

var configurationController = angular.module('configurationController', ['configurationService', 'Constants', 'smart-table']);

configurationController.controller('ConfigurationCtrl', function($scope, $location, ConfigurationService, REST_URL) {
    $scope.configurations = [];
    $scope.isLoading = false;

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

    $scope.reloadConfiguration = function() {
        $scope.isLoading = true;
        ConfigurationService.getData(REST_URL.CONFIGURATION).then(function(result) {
            $scope.configuration = {};
            $scope.configurations = result.data.globalConfiguration;
            $scope.isLoading = false;
        });
    };

    $scope.toggleConfiguration = function(configuration) {
        configuration.enabled = !configuration.enabled;
        $scope.save(configuration);
    };

    $scope.selectConfiguration = function(configuration) {
        $scope.configuration = configuration;
    };

    $scope.save = function(configuration) {
        configuration = configuration || $scope.configuration;

        $scope.isLoading = true;

        if(configuration.id) {
            // update
            ConfigurationService.updateConfiguration(REST_URL.CONFIGURATION + '/' + configuration.id, {value: configuration.value, enabled: configuration.enabled}).then(function() {
                $scope.showSuccess('Configuration updated');
                $scope.reloadConfiguration();
            }, function(result) {
                $scope.showError('Cannot update configuration: ' + result.data.defaultUserMessage, result.data.errors);
            });
        } else {
            // create
            ConfigurationService.saveConfiguration(REST_URL.CONFIGURATION, configuration).then(function() {
                $scope.showSuccess('Configuration created.');
                $scope.reloadConfiguration();
            }, function(result) {
                $scope.showError('Cannot create configuration: ' + result.data.defaultUserMessage, result.data.errors);
            });
        }
    };

    $scope.reloadConfiguration();
});