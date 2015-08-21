'use strict';

var searchService = angular.module('searchService', ['delegatorServices']);

searchService.factory('SearchService', function () {
    var data = {};

    return {
        data: function(key, value) {
            if(value) {
                data[key] = value;
            } else {
                return data[key];
            }
        },
        clear: function(key) {
            delete data[key];
        }
    };
});