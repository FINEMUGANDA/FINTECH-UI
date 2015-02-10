'use strict';


angular.module('angularjsApp').controller('CronJobCtrl', function($route, REST_URL, JobService, $timeout, $scope, dialogs, $location) {
  console.log('CronJobCtrl');
  $scope.itemsByPage = 20;
  $scope.isLoading = true;
  function updateJobList() {
    $scope.isLoading = true;
    JobService.getData(REST_URL.JOBS).then(function(result) {
      $scope.rowCollection = result.data;
      JobService.getData(REST_URL.SCHEDULER).then(function(result) {
        $scope.scheduler = result.data;
        $scope.isLoading = false;
      });
    });
  }
  updateJobList();

  $scope.jobDetails = function(job) {
    $location.url('/jobs/details/' + job.jobId);
  };

  $scope.openStacktraceDialog = function(job) {
    dialogs.create('/views/cron.job/cron.job.error.log.dialog.html', 'CronJobStacktraceDialog', {job: job, jobRunErrorMessage: job.lastRunHistory.jobRunErrorMessage, jobRunErrorLog: job.lastRunHistory.jobRunErrorLog}, {size: 'lg', keyboard: true, backdrop: true});
  };

  $scope.toggleScheduler = function() {
    var handleSuccess = function() {
      $scope.scheduler.active = !$scope.scheduler.active;
    };
    if ($scope.scheduler.active) {
      JobService.save(REST_URL.SCHEDULER + '?command=stop').then(handleSuccess);
    } else {
      JobService.save(REST_URL.SCHEDULER + '?command=start').then(handleSuccess);
    }
  };
});

angular.module('angularjsApp').controller('CronJobStacktraceDialog', function($route, REST_URL, JobService, $modalInstance, $scope, $timeout, data) {
  console.log('CronJobStacktraceDialog');
  $scope.isLoading = false;
  $scope.job = data.job;
  $scope.jobRunErrorMessage = data.jobRunErrorMessage;
  $scope.jobRunErrorLog = data.jobRunErrorLog;
  $scope.close = function() {
    $modalInstance.dismiss();
  };

});

angular.module('angularjsApp').controller('CronJobDetailsCtrl', function($route, REST_URL, JobService, $scope, dialogs) {
  console.log('CronJobEditDialogCtrl');
  $scope.isLoading = true;
  $scope.jobId = $route.current.params.jobId;
  $scope.historyLoading = true;
  $scope.itemsByPage = 10;


  function updateJobDetails() {
    JobService.getData(REST_URL.JOBS + '/' + $scope.jobId).then(function(result) {
      $scope.job = result.data;
      $scope.isLoading = false;
      updateHistoryData();
    });
  }
  updateJobDetails();

  function updateHistoryData() {
    JobService.getData(REST_URL.JOBS + '/' + $scope.jobId + '/runhistory').then(function(result) {
      $scope.rowCollection = result.data.pageItems;
      $scope.historyLoading = false;
    });
  }

  $scope.openEditDialog = function() {
    var dialog = dialogs.create('/views/cron.job/cron.job.edit.dialog.html', 'CronJobDetailsEditDialog', {job: $scope.job}, {size: 'md', keyboard: true, backdrop: true});
    dialog.result.then(function() {
      updateJobDetails();
    });
  };

  $scope.openStacktraceDialog = function(job) {
    dialogs.create('/views/cron.job/cron.job.error.log.dialog.html', 'CronJobStacktraceDialog', {job: job, jobRunErrorMessage: job.jobRunErrorMessage, jobRunErrorLog: job.jobRunErrorLog}, {size: 'lg', keyboard: true, backdrop: true});
  };

  $scope.runJob = function() {
    JobService.save(REST_URL.JOBS + '/' + $scope.jobId + '?command=executeJob').then(function() {
      $scope.message = 'Job runned successfully';
      $scope.type = 'alert-success';
      $scope.errors = [];
      updateJobDetails();
    });
    console.log($scope.jobId);
  };
});


angular.module('angularjsApp').controller('CronJobDetailsEditDialog', function($route, REST_URL, JobService, $modalInstance, $scope, $timeout, data) {
  console.log('CronJobDetailsEditDialog');
  $scope.isLoading = false;
  $scope.job = data.job;
  $scope.formData = {
    displayName: $scope.job.displayName,
    cronExpression: $scope.job.cronExpression,
    active: $scope.job.active
  };

  $scope.submit = function() {
    $scope.message = '';
    $scope.errors = [];
    if (!$scope.editJobDetailsForm.$valid) {
      $scope.type = 'error';
      $scope.message = 'Highlighted fields are required';
      $scope.errors = [];
      return;
    }

    var data = angular.copy($scope.formData);
    function handleSuccess() {
      $scope.type = 'alert-success';
      $scope.message = 'Job Details updated successfully.';
      $scope.errors = [];
      $timeout(function() {
        $modalInstance.close();
      }, 2000);
    }
    function handleFail(result) {
      $scope.message = 'Cant update Job details:' + result.data.defaultUserMessage;
      $scope.type = 'error';
      $scope.errors = result.data.errors;
    }
    JobService.update(REST_URL.JOBS + '/' + $scope.job.jobId, data).then(handleSuccess, handleFail);
  };

  $scope.cancel = function() {
    $modalInstance.dismiss();
  };

});