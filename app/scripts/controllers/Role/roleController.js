'use strict';

angular.module('angularjsApp').controller('RoleController', function ($route, $scope, RoleService, ReportService, REST_URL, $location, PERMISSION_GROUP_LABELS, PERMISSION_GROUPS_SORT_ORDER, PERMISSION_ACTIONS_SORT_ORDER, PERMISSION_EXPRESSIONS, PERMISSION_MAPPING) {

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

        if(PERMISSION_MAPPING[permission.code]) {
            angular.forEach(PERMISSION_MAPPING[permission.code], function(p) {
                $scope.form.permissions.permissions[p] = selected;
            });
        }
    };

    $scope.selectPermissionExpression = function (code, expression) {
        if(!$scope.form.expressions.expressions) {
            $scope.form.expressions.expressions = {};
        }

        if($scope.permissionExpressionData[code].min!==null &&
            $scope.permissionExpressionData[code].max!==null &&
            $scope.permissionExpressionData[code].min!==undefined &&
            $scope.permissionExpressionData[code].max!==undefined) {
            // select
            $scope.form.expressions.expressions[code] = $scope.format(expression, $scope.permissionExpressionData[code].min, $scope.permissionExpressionData[code].max);
        } else {
            // unselect
            try {
                delete $scope.form.expressions.expressions[code];
            } catch(err) {
                $scope.form.expressions.expressions[code] = null;
            }
        }
    };

    $scope.groupingLabel = function(grouping) {
        if(PERMISSION_GROUP_LABELS[grouping]) {
            return PERMISSION_GROUP_LABELS[grouping];
        } else {
            return grouping;
        }
    };

    $scope.editRole = function (roleId) {
        $scope.isLoading = true;

        var editPermissions;
        var editExpressions;

        if(!$scope.form.permissions.permissions) {
            $scope.form.permissions.permissions = {};
        }
        // we always need this!
        $scope.form.permissions.permissions.READ_PERMISSION = true;

        if($scope.form.permissions.permissions) {
            editPermissions = function() {
                RoleService.updateData(REST_URL.BASE + 'roles/' + roleId + '/permissions', angular.toJson($scope.form.permissions)).then(function() {
                    if(editExpressions) {
                        editExpressions();
                    } else {
                        $scope.isLoading = false;
                        $scope.showSuccess('Role saved successfully', '/admin/roles');
                    }
                }, function(result) {
                    $scope.isLoading = false;
                    $scope.showError('Permissions not saved: ' + result.data.defaultUserMessage, result.data.errors);
                });
            };
        }

        if($scope.form.expressions.expressions) {
            editExpressions = function() {
                RoleService.updateData(REST_URL.BASE + 'roles/' + roleId + '/expressions', angular.toJson($scope.form.expressions)).then(function() {
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
            } else if(editExpressions) {
                editExpressions();
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
        var createRoleSuccess = function (result) {
            $scope.editRole(result.data.resourceId);
            //$scope.showSuccess('Role saved successfully', '/admin/roles');
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
                    var matrix;
                    if (currentGrouping && (currentGrouping.indexOf('fin_dashboard')===0)) {
                        matrix = 'dashboard';
                    } else if (currentGrouping && (currentGrouping.indexOf('fin')===0)) {
                        matrix = 'general';
                    }

                    if(matrix) {
                        $scope.permissionGroups.push({grouping: currentGrouping, permissions: permissionGroup});

                        if(!actionNames[matrix]) {
                            actionNames[matrix] = {};
                        }

                        if(!$scope.permissionMatrix[matrix]) {
                            $scope.permissionMatrix[matrix] = {};
                        }

                        // create matrix
                        for(var j=0; j<permissionGroup.length; j++) {
                            var action = permissionGroup[j].actionName;

                            // only display permissions that we can sort; otherwise too many for horizontal display
                            if(PERMISSION_ACTIONS_SORT_ORDER[action]) {
                                actionNames[matrix][action] = '';

                                if(!$scope.permissionMatrix[matrix][currentGrouping]) {
                                    $scope.permissionMatrix[matrix][currentGrouping] = {};
                                }
                                $scope.permissionMatrix[matrix][currentGrouping][action] = permissionGroup[j];
                            }
                        }
                    }
                    currentGrouping = $scope.data.permissionUsageData[i].grouping;
                    permissionGroup = [];
                    permissionGroup.push($scope.data.permissionUsageData[i]);
                }
            }

            var matrices = Object.keys(actionNames);

            var sortFunction = function(a, b) {
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
            };

            for(var k=0; k<matrices.length; k++) {
                $scope.actionNames[matrices[k]] = Object.keys(actionNames[matrices[k]]).sort(sortFunction);
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
        };
        var loadPermissionsFail = function () {
            $scope.showError('Error : Return from loadPermissions.');
        };
        RoleService.getData(REST_URL.BASE + 'roles/' + $route.current.params.id + '/permissions/?tenantIdentifier=default').then(loadPermissionsSuccess, loadPermissionsFail);
        RoleService.getData(REST_URL.BASE + 'roles/' + $route.current.params.id + '/expressions/?tenantIdentifier=default').then(function(result) {
            $scope.test = result;

            for(var i=0; i<result.data.permissionExpressionUsageData.length; i++) {
                if(!$scope.form.expressions.expressions) {
                    $scope.form.expressions.expressions = {};
                }

                var code = result.data.permissionExpressionUsageData[i].code;
                var expression = result.data.permissionExpressionUsageData[i].expression;
                $scope.form.expressions.expressions[code] = expression;

                if(!$scope.permissionExpressionData[code]) {
                    $scope.permissionExpressionData[code] = {};
                }

                for(var j=0; j<PERMISSION_EXPRESSIONS.LOAN.length; j++) {
                    if(PERMISSION_EXPRESSIONS.LOAN[j].code===code) {
                        // TODO: could be optimized of Object.keys
                        var extractors = Object.keys(PERMISSION_EXPRESSIONS.LOAN[j].extractors);

                        for(var k=0; k<extractors.length; k++) {
                            $scope.permissionExpressionData[code][extractors[k]] = PERMISSION_EXPRESSIONS.LOAN[j].extractors[extractors[k]](expression);
                        }
                        break;
                    }
                }
            }
        }, function() {
            $scope.showError('Error : Return from loadExpressions.');
        });
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