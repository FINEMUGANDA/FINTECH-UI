'use strict';

var clientsService = angular.module('clientsService', ['delegatorServices']);

clientsService.factory('ClientsService', function($http, Remote) {
    return {
            getActiveClients: function(url){
                console.log('Get active clients...');
                var promise = Remote.get(url);
                return promise;
            }
	}
});