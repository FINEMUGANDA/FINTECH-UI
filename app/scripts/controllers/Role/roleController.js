'use strict';

angular.module('angularjsApp').controller('RoleController', function ($route, $scope, RoleService, REST_URL, $location) {

    $scope.form = {};
    $scope.form.role = {};
    $scope.params_id = $route.current.params.id;
    $scope.itemsByPage = 10;
    $scope.current_group_permission = 0;
    $scope.change_group_permission = function (i) {
        $scope.current_group_permission = i;
    };

    $scope.isLoading = true;
    var $url = '';
    var group_list = [];
    if ($scope.params_id) {
        var loadPermissionsSuccess = function (result) {
            $scope.isLoading = false;
            var data = $scope.data = result.data;
            $scope.form.role.name = data.name;
            $scope.form.role.description = data.description;
            var current_grouping = '';
            $scope.prem_out_list = [];
            for (var i = 0; i < $scope.data.permissionUsageData.length; i++) {
                if ($scope.data.permissionUsageData[i].grouping === current_grouping) {
                    group_list.push($scope.data.permissionUsageData[i]);
                } else {
                    if (current_grouping) {
                        $scope.prem_out_list.push({grouping: current_grouping, prem_list: group_list});
                    }
                    current_grouping = $scope.data.permissionUsageData[i].grouping;
                    group_list = [];
                }
            }
        };
        var loadPermissionsFail = function () {
            console.log('Error : Return from loadPermissions.');
        };
        $url = REST_URL.BASE + 'roles/' + $scope.params_id + '/permissions/?tenantIdentifier=default&pretty=true';
        RoleService.getData($url).then(loadPermissionsSuccess, loadPermissionsFail);
    } else {
        var loadRoleSuccess = function (result) {
            $scope.isLoading = false;
            $scope.rowCollection = result.data;
        };
        var loadRoleFail = function () {
            console.log('Error : Return from loadRole.');
        };
        $url = REST_URL.BASE + 'roles?tenantIdentifier=default&pretty=true';
        RoleService.getData($url).then(loadRoleSuccess, loadRoleFail);
    }

    $scope.editRole = function (id_role) {
        var editRoleSuccess = function () {
            $scope.type = 'alert-success';
            $scope.message = 'Role saved successfully';
            $scope.errors = [];
            $location.url('/admin/roles');
        };
        var editRoleFail = function (result) {
            console.log('Error : Return from loadRole.');
            $scope.type = 'error';
            $scope.message = 'Role not saved: ' + result.data.defaultUserMessage;
            $scope.errors = result.data.errors;
        };
        var $url = REST_URL.BASE + 'roles/' + id_role;
        RoleService.updateData($url, angular.toJson($scope.form.role)).then(editRoleSuccess, editRoleFail);
    };

    $scope.createRole = function () {
        var createRoleSuccess = function () {
            $scope.type = 'alert-success';
            $scope.message = 'Role saved successfully';
            $scope.errors = [];
            $location.url('/admin/roles');
        };
        var createRoleFail = function (result) {
            console.log('Error : Return from loadRole.');
            $scope.type = 'error';
            $scope.message = 'Role not saved: ' + result.data.defaultUserMessage;
            $scope.errors = result.data.errors;
        };
        var $url = REST_URL.BASE + 'roles';
        RoleService.createData($url, angular.toJson($scope.form.role)).then(createRoleSuccess, createRoleFail);
    };

    $scope.validateRole = function () {
        $scope.type = '';
        $scope.message = '';
        $scope.errors = [];
        if ($scope.roleForm.$valid) {
            var id = $route.current.params.id;
            if (typeof (id) === 'undefined') {
                $scope.createRole();
            } else {
                $scope.editRole(id);
            }
        } else {
            $scope.type = 'error';
            $scope.message = 'Highlighted fields are required';
            $scope.errors = [];
            $('html, body').animate({scrollTop: 0}, 800);
        }
    };

});