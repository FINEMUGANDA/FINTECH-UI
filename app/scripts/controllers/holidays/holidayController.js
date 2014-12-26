'use strict';  

angular.module('angularjsApp').controller('HolidayController', function($route, $scope, REST_URL, HolidayService, $timeout, $location, dialogs) {
  console.log('HolidayController');
  $scope.isLoading = false;
  $scope.itemsByPage = 10;
  $scope.isTreeview = false;

  //Success callback
  var loadHolidaysSuccess = function(result) {
    $scope.isLoading = false;
    try {
      $scope.rowCollection = result.data;
    } catch (e) {
    }
  };

  //failur callback
  var loadHolidaysFail = function(result) {
    $scope.isLoading = false;
    console.log('Error : Return from HolidayService service.' + result);
  };

  var loadHolidays = function getData() {
    $scope.isLoading = true;
    $timeout(
      function() {
        $scope.rowCollection = [];
        //service to get accounts from server
        HolidayService.getData(REST_URL.HOLIDAYS_LIST).then(loadHolidaysSuccess, loadHolidaysFail);
      }, 2000);
  };
  loadHolidays();

  $scope.editHoliday = function(holiday) {
    if(holiday.status !== 'Deleted'){
      $location.path('/holidays/edit/' + holiday.id);
    }    
  };

  $scope.removeHoliday = function(holiday) { 
    var msg = 'You are about to remove Holiday <strong>' + holiday.name + '</strong>';
    var dialog = dialogs.create('/views/custom-confirm.html', 'CustomConfirmController', {msg: msg}, {size: 'sm', keyboard: true, backdrop: true});
    dialog.result.then(function(result) {
      if (result) {        
        HolidayService.removeHoliday(REST_URL.HOLIDAYS + '/' + holiday.id).then(function() {
          $route.reload();
        }, function(result) {
          $scope.type = 'error';
          $scope.message = 'Holiday not deleted: ' + result.data.defaultUserMessage;
          $scope.errors = result.data.errors;
          $('html, body').animate({scrollTop: 0}, 800);
        });
      }
    });
  };
});

// Create Holiday
angular.module('angularjsApp').controller('CreateHolidayController', function($location, $scope, REST_URL, HolidayService, $timeout, Utility) {
  console.log('CreateHolidayController');
  $scope.offices = [];
  $scope.formHoliday = {};
  var holidayOfficeIdArray = [];
  $scope.holidayApplyToOffice = function (node) {
    console.log('holidayApplyToOffice');
    if (node.selectedCheckBox === 'true') {
        node.selectedCheckBox = 'true';
        recurHolidayApplyToOffice(node);
        holidayOfficeIdArray = _.uniq(holidayOfficeIdArray);
    } else {
        node.selectedCheckBox = 'false';
        recurRemoveHolidayAppliedOOffice(node);
    }
  };
  function recurHolidayApplyToOffice(node) {
    console.log('recurHolidayApplyToOffice');
    node.selectedCheckBox = 'true';
    holidayOfficeIdArray.push(node.id);
    if (node.children.length > 0) {
        for (var i = 0; i < node.children.length; i++) {
            node.children[i].selectedCheckBox = 'true';
            holidayOfficeIdArray.push(node.children[i].id);
            if (node.children[i].children.length > 0) {
                recurHolidayApplyToOffice(node.children[i]);
            }
        }
    }
  }
  function recurRemoveHolidayAppliedOOffice(node) {
    console.log('recurRemoveHolidayAppliedOOffice');
    holidayOfficeIdArray = _.without(holidayOfficeIdArray, node.id);
    if (node.children.length > 0) {
        for (var i = 0; i < node.children.length; i++) {
            node.children[i].selectedCheckBox = 'false';
            holidayOfficeIdArray = _.without(holidayOfficeIdArray, node.children[i].id);
            if (node.children[i].children.length > 0) {
                recurRemoveHolidayAppliedOOffice(node.children[i]);
            }
        }
    }
  }
  function buildTreeData(data) {
    console.log('buildTreeData');
    var map = {}, item, result = {};
    for (var i = 0; i < data.length; i += 1) {
      item = data[i];
      item.children = [];
      item.collapsed = true;
      map[item.id] = i;
      if (item.parentId && item.parentId !== '0') {
        result[item.parentId].children.push(item);
      } else {
        if (!result[item.id]) {
          result[item.id] = {name: item.name,id: item.id, children: [], collapsed: true};
        }else{
          result[item.id].children.push(item);
        }        
      }
    }
    return result;
  }
  $scope.treeview = {};
  $scope.treeview.selectNodeLabel = function(selectedNode) {
    if ($scope.treeview.currentNode && $scope.treeview.currentNode.selected) {
      $scope.treeview.currentNode.selected = undefined;
    }
    selectedNode.selected = 'selected'; 
    $scope.treeview.currentNode = selectedNode;
    $scope.treeview.currentNode.collapsed = !$scope.treeview.currentNode.collapsed;
  };
  //Success callback
  var loadOfficesSuccess = function(result) {
    $scope.offices = result.data;
    try {      
      $scope.treedata = buildTreeData(result.data);
    } catch (e) {
      console.log(e);
    }
  };
  //failure callback
  var loadOfficesFail = function(result) {
    console.log('Error : Return from HolidayService service.' + result);
  };
  HolidayService.getData(REST_URL.OFFICE_LIST).then(loadOfficesSuccess, loadOfficesFail);  
  // Save holiday
  $scope.saveHoliday = function() {
    console.log('saveHoliday');
    var saveHolidaySuccess = function(result) {
      console.log('saveHolidaySuccess');
      $scope.type = 'alert-success';
      $scope.message = 'Saved successfully';
      $scope.errors = [];
      $scope.activeHoliday(result.data);
    };
    var saveHolidayFail = function(result) {
      console.log('saveHolidayFail');
      $scope.type = 'error';
      $scope.message = 'Holiday not saved: ' + result.data.defaultUserMessage;
      $scope.errors = result.data.errors;
      $('html, body').animate({scrollTop: 0}, 800);
    };
    $scope.formHoliday.offices = [];
    for (var i in holidayOfficeIdArray) {
        var temp = {};
        temp.officeId = holidayOfficeIdArray[i];
        $scope.formHoliday.offices.push(temp);
    }
    $scope.formHoliday.locale = 'en';
    $scope.formHoliday.dateFormat = 'dd/MM/yyyy';
    var date;
    if (typeof $scope.formHoliday.fromDate === 'object') {      
      $scope.formHoliday.fromDate = Utility.dataFormat($scope.formHoliday.fromDate);
    }
    if (typeof $scope.formHoliday.toDate === 'object') {
      $scope.formHoliday.toDate = Utility.dataFormat($scope.formHoliday.toDate);
    }
    if (typeof $scope.formHoliday.repaymentsRescheduledTo === 'object') {
      $scope.formHoliday.repaymentsRescheduledTo = Utility.dataFormat($scope.formHoliday.repaymentsRescheduledTo);
    }
    var json = angular.toJson($scope.formHoliday);
    console.log('json > '+ json);
    HolidayService.saveHoliday(REST_URL.HOLIDAYS, json).then(saveHolidaySuccess, saveHolidayFail);
  };
  //Validate form and save
  $scope.validate = function() {
    console.log('validate');
    $scope.type = '';
    $scope.message = '';
    $scope.errors = [];
    if ($scope.createHolidayForm.$valid) {
      $scope.saveHoliday();
    } else {
      $scope.type = 'error';
      $scope.message = 'Highlighted fields are required';
      $scope.errors = [];
      $('html, body').animate({scrollTop: 0}, 800);
    }
  };
  //Active Holiday
  $scope.activeHoliday = function(data){
    console.log('activeHoliday');
    var activeHolidaySuccess = function(result) {
      console.log('Success : activeHolidaySuccess' + result);
      $location.url('/holidays');
    }
    var activeHolidayFail = function(result) {
      console.log('Failure : activeHolidayFail' + result);
      $location.url('/holidays');
    }
    var url = REST_URL.HOLIDAYS + '/' + data.resourceId + '?command=activate';
    HolidayService.saveHoliday(url).then(activeHolidaySuccess, activeHolidayFail);
  };
  //For date
  $scope.openedFromDate = false;
  $scope.openFromDate = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.openedFromDate = true;
  };
  $scope.openedToDate = false;
  $scope.openToDate = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.openedToDate = true;
  };
  $scope.openedRepaymentDate = false;
  $scope.openRepaymentDate = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.openedRepaymentDate = true;
  };
});

// Edit Holiday
angular.module('angularjsApp').controller('EditHolidayController', function($route, $location, $scope, REST_URL, HolidayService, $timeout, Utility) {
  console.log('EditHolidayController');
  $scope.formHoliday = {};
  $scope.date = {};
  $scope.id = $route.current.params.id;
  //Success callback
  var loadHolidaySuccess = function(result) {
    console.log('loadHolidaySuccess');
    $scope.isLoading = false;    
    try {
      $scope.formHoliday = {
          name: result.data.name,
          description: result.data.description,
      };
      $scope.holidayStatusActive = false;
      if (result.data.status.value === 'Active') {
          $scope.holidayStatusActive = true;
      }
      var fromDate = result.data.fromDate;
      fromDate = fromDate[2] + '/' + fromDate[1] + '/' + fromDate[0];
      $scope.date.fromDate = fromDate;

      var toDate = result.data.toDate;
      toDate = toDate[2] + '/' + toDate[1] + '/' + toDate[0];
      $scope.date.toDate = toDate;

      var repaymentsRescheduledTo = result.data.repaymentsRescheduledTo;
      repaymentsRescheduledTo = repaymentsRescheduledTo[2] + '/' + repaymentsRescheduledTo[1] + '/' + repaymentsRescheduledTo[0];
      $scope.date.repaymentsRescheduledTo = repaymentsRescheduledTo;
    } catch (e) {
      console.log(e);
    }
  };
  //failure callback
  var loadHolidayFail = function(result) {
    console.log('Error : Return from HolidayService service.' + result);
  };
  HolidayService.getData(REST_URL.HOLIDAYS + '/' + $scope.id).then(loadHolidaySuccess, loadHolidayFail);  
  // Save holiday
  $scope.updateHoliday = function() {
    var saveHolidaySuccess = function() {
      $scope.type = 'alert-success';
      $scope.message = 'Saved successfully';
      $scope.errors = [];
      $location.url('/holidays');
    };
    var saveHolidayFail = function(result) {
      $scope.type = 'error';
      $scope.message = 'Holiday not saved: ' + result.data.defaultUserMessage;
      $scope.errors = result.data.errors;
      $('html, body').animate({scrollTop: 0}, 800);
    };
    $scope.formHoliday.locale = 'en';
    $scope.formHoliday.dateFormat = 'dd/MM/yyyy';
    if (!$scope.holidayStatusActive) {
      if (typeof $scope.date.fromDate === 'object') {
        $scope.formHoliday.fromDate = Utility.dataFormat($scope.date.fromDate);    
      }
      if (typeof $scope.date.toDate === 'object') {
        $scope.formHoliday.toDate = Utility.dataFormat($scope.date.toDate);
      }
    }
    if (typeof $scope.date.repaymentsRescheduledTo === 'object') {
      $scope.formHoliday.repaymentsRescheduledTo = Utility.dataFormat($scope.date.repaymentsRescheduledTo);
    }
    var json = angular.toJson($scope.formHoliday);
    console.log('json > '+ json);
    HolidayService.updateHoliday(REST_URL.HOLIDAYS + '/' + $scope.id, json).then(saveHolidaySuccess, saveHolidayFail);
  };
  //Validate form and save
  $scope.validate = function() {
    $scope.type = '';
    $scope.message = '';
    $scope.errors = [];
    if ($scope.editHolidayForm.$valid) {
      $scope.updateHoliday();
    } else {
      $scope.type = 'error';
      $scope.message = 'Highlighted fields are required';
      $scope.errors = [];
      $('html, body').animate({scrollTop: 0}, 800);
    }
  };
  //For date
  $scope.openedFromDate = false;
  $scope.openFromDate = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.openedFromDate = true;
  };
  $scope.openedToDate = false;
  $scope.openToDate = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.openedToDate = true;
  };
  $scope.openedRepaymentDate = false;
  $scope.openRepaymentDate = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.openedRepaymentDate = true;
  };
});