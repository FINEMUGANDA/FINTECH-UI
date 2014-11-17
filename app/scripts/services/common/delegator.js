'use strict';

var delegatorServices = angular.module('delegatorServices', ['Utils','Constants']);

delegatorServices.factory('Remote', function($http, APPLICATION, Session) {
	return {
		setHeader: function(){
			$http.defaults.headers.common.Authorization = 'Basic ' + Session.getValue(APPLICATION.authToken);
		},
	  	get: function(url) {
			console.log('Delegator GET :' + APPLICATION.host + url);
			this.setHeader();
			
		    // com_thisnt below code to check with device id
		    //TODO : 'genericResultSet':false will be removed 
		  	var promise = $http.get(APPLICATION.host + url, {params: {'tenantIdentifier': 'default', 'pretty':true, 'genericResultSet':false}})
		  	.success(function (data, status) {
		  		console.log('Success from server'); 
		 		return data; //this success data will be used in then _thisthod of controller call 
			})
			.error(function (data, status) {
				console.log('Error from server'); 
				return null; //this failure data will be used in then _thisthod of controller call
			});
			
		  	return promise; //return promise object to controller  
	  	},
	  	post: function(url, jsondata) {
	  		console.log('Delegator POST :' + APPLICATION.host + url +" -> JSON DATA : "+ jsondata);
	  		//TODO delete autherization if request id for login
			//this.setHeader();			
	  		var promise = $http.post(APPLICATION.host + url, jsondata)
	  		.success(function (data, status) {
	  			console.log('Success from server'); 
	  			return data;
			})
			.error(function (data, status) {
				console.log('Error from server > ' + data); 
				return null;
			});
			
			return promise;
	  	},
	  	put: function(url, jsondata) {
	  		console.log('Delegator PUT :' + APPLICATION.host + url +" -> JSON DATA : "+ jsondata);
	  		this.setHeader();

	  		var promise = $http.put( APPLICATION.host + url, jsondata, {withCredentials: true})
	  		.success(function (data, status) {
	  			console.log('Success from server'); 
	  			return data;
			})
			.error(function (data, status) {
				console.log('Error from server'); 
				return null;
			});
			
			return promise;
	  	},
	  	delete: function(url, jsondata) {
	  		console.log('Delegator DELETE :' + APPLICATION.host + url );
	  		this.setHeader();

		    // com_thisnt below code 
		  	var promise = $http.delete(APPLICATION.host + url, jsondata,  {withCredentials: true})
		  	.success(function (data, status) {
		  		console.log('Success from server'); 
		  		return data; //this success data will be used in then _thisthod of controller call 
			})
			.error(function (data, status) {
				console.log('Error from server'); 
				return null; //this failure data will be used in then _thisthod of controller call
			});
			
		  	return promise; //return promise object to controller  
	  	}
	};
});