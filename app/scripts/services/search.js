'use strict';

var searchService = angular.module('searchService', ['delegatorServices']);

searchService.factory('SearchService', function () {
    var data;

    return {
        set: function (_data) {
            data = _data;
        },
        get: function () {
            return data;
        }
    };
});