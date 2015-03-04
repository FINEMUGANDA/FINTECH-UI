'use strict';

var dataTransferService = angular.module('dataTransferService', ['delegatorServices']);

dataTransferService.factory('DataTransferService', function () {
    var data = {};

    return {
        set: function (key, value) {
            data[key] = value;
        },
        get: function (key) {
            return data[key];
        }
    };
});