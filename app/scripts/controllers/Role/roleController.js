'use strict';

angular.module('angularjsApp').controller('RoleController', function ($route, $scope, RoleService, ReportService, REST_URL, $location, PERMISSION_GROUP_LABELS, PERMISSION_GROUPS_SORT_ORDER, PERMISSION_ACTIONS_SORT_ORDER, PERMISSION_EXPRESSIONS) {

    $scope.form = {};
    $scope.form.role = {};
    $scope.form.permissions = {};
    $scope.form.expressions = {};
    $scope.itemsByPage = 10;
    $scope.actionNames = [];
    $scope.permissionMatrix = {};
    $scope.permissionGroupsOrdered = PERMISSION_GROUPS_SORT_ORDER;
    $scope.permissionExpressions = PERMISSION_EXPRESSIONS;
    $scope.permissionExpressionData = {};
    $scope.permissionsReport = [];
    $scope.currentReportCategory = '';

    $scope.type = '';
    $scope.message = '';
    $scope.errors = undefined;

    $scope.isLoading = true;

    $scope.format = function(format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] !== 'undefined' ? args[number] : match;
        });
    };

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

    $scope.selectReportCategory = function (category) {
        $scope.currentReportCategory = category;
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

    $scope.selectPermissionExpression = function (code, expression) {
        if(!$scope.form.permissions.expressions) {
            $scope.form.permissions.expressions = {};
        }

        if($scope.permissionExpressionData[code].min!==null &&
            $scope.permissionExpressionData[code].max!==null &&
            $scope.permissionExpressionData[code].min!==undefined &&
            $scope.permissionExpressionData[code].max!==undefined) {
            // select
            $scope.form.permissions.expressions[code] = $scope.format(expression, $scope.permissionExpressionData[code].min, $scope.permissionExpressionData[code].max);
        } else {
            // unselect
            try {
                delete $scope.form.permissions.expressions[code];
            } catch(err) {
                $scope.form.permissions.expressions[code] = null;
            }
        }
    };

    $scope.groupingLabel = function(grouping) {
        return PERMISSION_GROUP_LABELS[grouping];
    };

    $scope.editRole = function (roleId) {
        $scope.isLoading = true;

        var editPermissions;

        if($scope.form.permissions.permissions || $scope.form.permissions.expressions) {
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

            var actionNames = {};

            var reportGroup = [];

            for (var i = 0; i < $scope.data.permissionUsageData.length; i++) {
                if ($scope.data.permissionUsageData[i].grouping === currentGrouping) {
                    permissionGroup.push($scope.data.permissionUsageData[i]);
                } else if (currentGrouping && (currentGrouping.indexOf('report')===0)) {
                    reportGroup = permissionGroup;
                } else {
                    if (currentGrouping && (currentGrouping.indexOf('fin_dashboard')===0)) {
                        // TODO: implement this
                    } else if (currentGrouping && (currentGrouping.indexOf('fin')===0)) {
                        $scope.permissionGroups.push({grouping: currentGrouping, permissions: permissionGroup});

                        // create matrix
                        for(var j=0; j<permissionGroup.length; j++) {
                            var action = permissionGroup[j].actionName;

                            actionNames[action] = '';

                            if(!$scope.permissionMatrix[currentGrouping]) {
                                $scope.permissionMatrix[currentGrouping] = {};
                            }
                            $scope.permissionMatrix[currentGrouping][action] = permissionGroup[j];
                        }
                    }
                    currentGrouping = $scope.data.permissionUsageData[i].grouping;
                    permissionGroup = [];
                    permissionGroup.push($scope.data.permissionUsageData[i]);
                }
            }

            if(reportGroup.length>0) {
                ReportService.getData(REST_URL.BASE + 'reports' + '?tenantIdentifier=default').then(function(result) {
                    $scope.permissionsReport = {};
                    $scope.currentReportCategory = '';
                    for(var j=0; j<result.data.length; j++) {
                        var report = result.data[j];
                        if(report.reportCategory) {
                            if(j===0) {
                                $scope.currentReportCategory = report.reportCategory;
                            }
                            for(var i=0; i<reportGroup.length; i++) {
                                if(reportGroup[i].entityName===report.reportName) {
                                    if(!$scope.permissionsReport[report.reportCategory]) {
                                        $scope.permissionsReport[report.reportCategory] = [];
                                    }
                                    $scope.permissionsReport[report.reportCategory].push(reportGroup[i]);
                                }
                            }
                        }
                    }
                }, function() {
                    $scope.showError('Error : Cannot load reports.');
                });
            }

            $scope.actionNames = Object.keys(actionNames).sort(function(a, b) {
                if(PERMISSION_ACTIONS_SORT_ORDER[a]!==null && PERMISSION_ACTIONS_SORT_ORDER[b]!==null) {
                    if(PERMISSION_ACTIONS_SORT_ORDER[a] > PERMISSION_ACTIONS_SORT_ORDER[b]) {
                        return 1;
                    } else if(PERMISSION_ACTIONS_SORT_ORDER[a] < PERMISSION_ACTIONS_SORT_ORDER[b]) {
                        return -1;
                    } else {
                        return 0;
                    }
                } else {
                    if(a > b) {
                        return 1;
                    } else if(a < b) {
                        return -1;
                    } else {
                        return 0;
                    }
                }
            });
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