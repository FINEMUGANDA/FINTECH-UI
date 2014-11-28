'use strict';

var createClientsService = angular.module('createClientsService', ['delegatorServices']);

createClientsService.factory('CreateClientsService', function($http, Remote) {
    return {
            getData: function(url){
                console.log('Get Data using clientsService...');
                var promise = Remote.get(url);
                return promise;
            }
	}
});