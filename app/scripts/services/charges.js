'use strict';

var chargesService = angular.module('chargesService', ['delegatorServices']);

chargesService.factory('ChargesService', function($http, Remote) {
    return {
            getData: function(url){
                console.log('Get Data using chargesService...');
                var promise = Remote.get(url);
                return promise;
            }
	}
});