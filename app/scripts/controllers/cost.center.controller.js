'use strict';

angular.module('angularjsApp').controller('CostCenterCtrl', function ($scope, REST_URL, CostCenterService, $timeout, $location, dialogs) {
	console.log('CostCenterCtrl');
	$scope.isLoading = false;
	$scope.itemsByPage = 10;
	$scope.isTreeview = false;

	//Success callback
	var loadCostCentersSuccess = function (result) {
		$scope.isLoading = false;
		try {
			$scope.rowCollection = result.data;
		} catch (e) {
		}
	};

	//failur callback
	var loadCostCentersFail = function (result) {
		$scope.isLoading = false;
		console.log('Error : Return from CostCenterService service.' + result);
	};

	var loadCostCenters = function getData() {
		$scope.isLoading = true;
		$timeout(
			function () {
				$scope.rowCollection = [];
				//service to get accounts from server
				CostCenterService.getData(REST_URL.COST_CENTER).then(loadCostCentersSuccess, loadCostCentersFail);
			}, 2000);
	};

	loadCostCenters();

	$scope.editCostCenter = function (staff) {
		$location.path('/costcenters/edit/' + staff.id);
	};
	$scope.removeCostCenter = function (costCenter) {
		var msg = 'You are about to remove Cost Center <strong>' + (costCenter.staff ? costCenter.staff.displayName : costCenter.nonStaff.name) + '</strong>';
		var dialog = dialogs.create('/views/custom-confirm.html', 'CustomConfirmController', {msg: msg}, {size: 'sm', keyboard: true, backdrop: true});
		dialog.result.then(function (result) {
			if (result) {
				var index = $scope.rowCollection.indexOf(costCenter);
				CostCenterService.removeCostCenter(REST_URL.COST_CENTER + (costCenter.staff ? costCenter.staff.id : costCenter.nonStaff.id) + "/" + costCenter.costCenterType).then(function () {
					if (index >= -1) {
						$scope.rowCollection.splice(index, 1);
					}
				}, function (result) {
					$scope.type = 'error';
					$scope.message = 'Cost Center not removed: ' + result.data.defaultUserMessage;
					$scope.errors = result.data.errors;
					$('html, body').animate({scrollTop: 0}, 800);
				});
			}
		});
	};
});

angular.module('angularjsApp').controller('CostCenterEditCtrl', function ($scope, REST_URL, $location, CostCenterService, CurrencyService, $timeout, $route) {
	console.log('CostCenterEditCtrl');
	$scope.isLoading = false;
	$scope.staffId = $route.current.params.staffId;
	$scope.costCenterType = $route.current.params.costCenterType;
	$scope.data = {};

	//Success callback
	var loadCostCenterSuccess = function (result) {
		$scope.isLoading = false;
		try {
			$scope.rowCollection = result.data;
			var staffId;
			var costCenterType;
			if (result.data) {
				if (result.data.staff) {
					staffId = result.data.staff.id;
				}
				if (result.data.nonStaff) {
					staffId = result.data.nonStaff.id;
				}
				costCenterType = result.data.costCenterType;
			}
			$scope.costCenter = {
				staffId: staffId,
				costCenterType: costCenterType,
				glAccounts: _.pluck(result.data.glAccounts, 'id')
			};
			$scope.treedata = buildTreeData(result.data.glAccountOptions);
			$scope.glAccounts = result.data.glAccountOptions;
			$scope.data = _.extend({}, result.data);
			$scope.selectedGLAccounts = _.filter($scope.glAccounts, 'selected');
		} catch (e) {
			console.error(e);
		}
	};

	//failur callback
	var loadCostCenterFail = function (result) {
		$scope.isLoading = false;
		console.log('Error : Return from CostCenterSerivce service.' + result);
	};

	var loadCostCenter = function getData() {
		$scope.isLoading = true;

		$timeout(
			function () {
				var url = REST_URL.COST_CENTER + 'template';
				if ($scope.staffId) {
					url = REST_URL.COST_CENTER + $scope.staffId + '/' + $scope.costCenterType + '?template=true';
				}
				//service to get accounts from server
				CostCenterService.getData(url).then(loadCostCenterSuccess, loadCostCenterFail);
			}, 2000);
	};

	$scope.saveCostCenter = function () {
		if ($scope.costCenterForm.$valid) {
			var saveCostCenterSuccess = function (result) {
				console.log('Success : Return from CostCenterService service.');
				$scope.type = 'alert-success';
				$scope.message = 'Cost Center saved successfully';
				$scope.errors = [];
				$location.path('/admin/costcenters')
			};

			var saveCostCenterFail = function (result) {
				console.log('Error : Return from CostCenterService service.');
				$scope.type = 'error';
				$scope.message = 'Cost Center not saved: ' + result.data.defaultUserMessage;
				$scope.errors = result.data.errors;
				$('html, body').animate({scrollTop: 0}, 800);
			};

			$scope.message = undefined; //hide alert message if exist
			$scope.costCenter.glAccounts = _.chain($scope.glAccounts).filter('selected').pluck('id').value();
			if ($scope.staffId) {
				CostCenterService.updateCostCenter(REST_URL.COST_CENTER + $scope.staffId, angular.copy($scope.costCenter)).then(saveCostCenterSuccess, saveCostCenterFail);
			} else {
				CostCenterService.saveCostCenter(REST_URL.COST_CENTER, angular.copy($scope.costCenter)).then(saveCostCenterSuccess, saveCostCenterFail);
			}
		} else {
			$scope.accountform.invalidate = true;
			$scope.type = 'error';
			$scope.message = 'Highlighted fields are required';
			$('html, body').animate({scrollTop: 0}, 800);
		}
	};

	loadCostCenter();

	function buildTreeData(data) {
		var result = {};

		var indexed = _.indexBy(data, 'id');

		_.each(indexed, function (item) {
			if (!item.children) {
				item.children = [];
			}
			if ($scope.costCenter && $scope.costCenter.glAccounts) {
				var selectedGLAccount = _.find($scope.costCenter.glAccounts, function (glAccountId) {
					return glAccountId === item.id;
				});
				if (selectedGLAccount) {
					item.selected = 'selected';
				}
			}
			item.collapsed = true;
			item.name = item.name + ' (' + item.glCode + ')';
			if (item.parentId && item.parentId !== '0') {
				if (!indexed[item.parentId]) {
					indexed[item.parentId] = {};
				}
				if (!indexed[item.parentId].children) {
					indexed[item.parentId].children = [];
				}
				indexed[item.parentId].children.push(item);
			} else {
				if (!result[item.type.value]) {
					result[item.type.value] = {name: item.type.value + ' (' + item.glCode.substr(0, 1) + '0000)', children: [], collapsed: true};
				}
				result[item.type.value].children.push(item);
			}
		});
		return result;
	}

	$scope.treeview = {};
	$scope.treeview.selectNodeLabel = function (selectedNode) {
//    if ($scope.treeview.currentNode && $scope.treeview.currentNode.selected) {
//      $scope.treeview.currentNode.selected = undefined;
//    }
		console.log(selectedNode);
//    selectedNode.selected = 'selected';
//    $scope.treeview.currentNode = selectedNode;
		if (selectedNode.usage && selectedNode.usage.code === 'accountUsage.detail') {
			if (selectedNode.selected) {
				selectedNode.selected = undefined;
			} else {
				selectedNode.selected = 'selected';
			}
			$scope.selectedGLAccounts = _.filter($scope.glAccounts, 'selected');
		} else {
			selectedNode.collapsed = !selectedNode.collapsed;
		}
//    $scope.treeview.currentNode.collapsed = !$scope.treeview.currentNode.collapsed;
	};

	CurrencyService.getData(REST_URL.CURRENCY_LIST).then(function (result) {
		//$scope.formData.base = result.data.base;
		$scope.currencyOptions = result.data.selectedCurrencyOptions;
	}, function () {
		// TODO: error handling
	});


	$scope.removeSelectedGLAccount = function (account) {
		var index = $scope.selectedGLAccounts.indexOf(account);
		if (index >= 0) {
			$scope.selectedGLAccounts.splice(index, 1);
		}
		account.selected = undefined;
	};
});
