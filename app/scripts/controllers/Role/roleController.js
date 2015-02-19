'use strict';

angular.module('angularjsApp').controller('RoleController', function ($route, $scope, RoleService, REST_URL, $location) {

    $scope.form = {};
    $scope.form.role = {};
    $scope.form.permissions = {};
    $scope.itemsByPage = 10;
    $scope.currentPermissionGroup = 0;
    $scope.actionNames = [];
    $scope.permissionMatrix = {};

    $scope.type = '';
    $scope.message = '';
    $scope.errors = undefined;

    $scope.isLoading = true;

    $scope.showSuccess = function (message, url) {
        $scope.type = 'alert-success';
        $scope.message = message;
        $scope.errors = [];
        $location.url(url);
    };

    $scope.showError = function (message, errors) {
        $scope.type = 'error';
        $scope.message = message;
        $scope.errors = errors ? errors : [];
    };

    $scope.selectPermissions = function (selected) {
        angular.forEach($scope.permissionGroups[$scope.currentPermissionGroup].permissions, function(permission) {
            $scope.selectPermission(permission, selected);
        });
    };

    $scope.selectPermission = function (permission, selected) {
        permission.selected = selected;

        if(!$scope.form.permissions.permissions) {
            $scope.form.permissions.permissions = {};
        }

        $scope.form.permissions.permissions[permission.code] = selected;
    };

    $scope.changeGroupPermission = function (i) {
        $scope.currentPermissionGroup = i;

        var actionNames = {};

        $scope.permissionMatrix = {};

        for(var j=0; j<$scope.permissionGroups[$scope.currentPermissionGroup].permissions.length; j++) {
            var action = $scope.permissionGroups[$scope.currentPermissionGroup].permissions[j].actionName;
            var entity = $scope.permissionGroups[$scope.currentPermissionGroup].permissions[j].entityName;

            if(!$scope.permissionMatrix[entity]) {
                $scope.permissionMatrix[entity] = {};
            }
            $scope.permissionMatrix[entity][action] = $scope.permissionGroups[$scope.currentPermissionGroup].permissions[j];

            if(action!=='all') {
                actionNames[action] = '';
            }
        }

        $scope.actionNames = Object.keys(actionNames).sort();
    };

    $scope.editRole = function (roleId) {
        $scope.isLoading = true;

        var editPermissions;

        if($scope.form.permissions.permissions) {
            editPermissions = function() {
                RoleService.updateData(REST_URL.BASE + 'roles/' + roleId + '/permissions', angular.toJson($scope.form.permissions)).then(function() {
                    $scope.isLoading = false;
                    $scope.showSuccess('Role saved successfully', '/admin/roles');
                }, function(result) {
                    $scope.isLoading = false;
                    $scope.showError('Permissions not saved: ' + result.data.defaultUserMessage, result.data.errors);
                });
            };
        }

        var editRoleSuccess = function () {
            if(editPermissions) {
                editPermissions();
            } else {
                $scope.isLoading = false;
                $scope.showSuccess('Role saved successfully', '/admin/roles');
            }
        };
        var editRoleFail = function (result) {
            $scope.isLoading = false;
            $scope.showError('Role not saved: ' + result.data.defaultUserMessage, result.data.errors);
        };
        RoleService.updateData(REST_URL.BASE + 'roles/' + roleId, angular.toJson($scope.form.role)).then(editRoleSuccess, editRoleFail);
    };

    $scope.createRole = function () {
        var createRoleSuccess = function () {
            $scope.showSuccess('Role saved successfully', '/admin/roles');
        };
        var createRoleFail = function (result) {
            $scope.showError('Role not saved: ' + result.data.defaultUserMessage, result.data.errors);
        };
        RoleService.createData(REST_URL.BASE + 'roles', angular.toJson($scope.form.role)).then(createRoleSuccess, createRoleFail);
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
            $scope.showError('Highlighted fields are required');
            $('html, body').animate({scrollTop: 0}, 800);
        }
    };


    if ($route.current.params.id) {
        var loadPermissionsSuccess = function (result) {
            var permissionGroup = [];
            var data = $scope.data = result.data;
            var currentGrouping = '';

            $scope.isLoading = false;
            $scope.form.role.name = data.name;
            $scope.form.role.description = data.description;
            $scope.permissionGroups = [];

            for (var i = 0; i < $scope.data.permissionUsageData.length; i++) {
                if ($scope.data.permissionUsageData[i].grouping === currentGrouping) {
                    permissionGroup.push($scope.data.permissionUsageData[i]);
                } else {
                    if (currentGrouping && currentGrouping.indexOf('fin')===0) {
                        $scope.permissionGroups.push({grouping: currentGrouping, permissions: permissionGroup});
                    }
                    currentGrouping = $scope.data.permissionUsageData[i].grouping;
                    permissionGroup = [];
                    permissionGroup.push($scope.data.permissionUsageData[i]);
                }
            }
            $scope.changeGroupPermission(0);
        };
        var loadPermissionsFail = function () {
            $scope.showError('Error : Return from loadPermissions.');
        };
        RoleService.getData(REST_URL.BASE + 'roles/' + $route.current.params.id + '/permissions/?tenantIdentifier=default').then(loadPermissionsSuccess, loadPermissionsFail);
    } else {
        var loadRoleSuccess = function (result) {
            $scope.isLoading = false;
            $scope.rowCollection = result.data;
        };
        var loadRoleFail = function () {
            $scope.showError('Error : Return from loadRole.');
        };
        RoleService.getData(REST_URL.BASE + 'roles?tenantIdentifier=default').then(loadRoleSuccess, loadRoleFail);
    }
});