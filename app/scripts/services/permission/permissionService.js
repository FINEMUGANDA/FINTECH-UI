'use strict';

angular.module('permissionService', ['delegatorServices']).factory('PermissionService', function ($http, Remote) {
    return {
        getData: function (url) {
            return Remote.get(url);
        },
        updateData: function (url, jsondata) {
            return Remote.put(url, jsondata);
        },
        createData: function (url, jsondata) {
            return Remote.post(url, jsondata);
        },
        removeData: function (url, jsondata) {
            return Remote.delete(url, jsondata);
        }
    };
});
