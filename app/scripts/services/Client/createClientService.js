'use strict';

var createClientsService = angular.module('createClientsService', ['delegatorServices']);

createClientsService.factory('CreateClientsService', function($http, Remote) {
    return {
            getData: function(url){
                console.log('Get Data using clientsService...');
                var promise = Remote.get(url);
                return promise;
            },
            saveClient: function(url,jsondata){
                console.log('Post Data using loanProductService...');
                var promise = Remote.post(url,jsondata);
                return promise;
            },
            updateClient: function(url,jsondata){
                console.log('Put Data using loanProductService...');
                var promise = Remote.put(url,jsondata);
                return promise;
            }
	}
});