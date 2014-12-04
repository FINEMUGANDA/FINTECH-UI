'use strict';

var chargesService = angular.module('chargesService', ['delegatorServices']);

chargesService.factory('ChargesService', function($http, Remote) {
    return {
            getData: function(url){
                console.log('Get Data using chargesService...');
                var promise = Remote.get(url);
                return promise;
            },
            saveCharge: function(url,jsondata){
                console.log('Get Data using chargesService...');
                var promise = Remote.post(url,jsondata);
                return promise;
            },
            updateCharge: function(url,jsondata){
                console.log('Put Data using chargesService...');
                var promise = Remote.put(url,jsondata);
                return promise;
            }
	}
});