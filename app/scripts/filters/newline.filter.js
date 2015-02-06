'use strict';

angular.module('angularjsApp').filter('nl2br', ['$sce', function($sce) {
  return function(text) {
    var resultHTML = text.replace(/\n/g, '<br/>');
    console.log('resultHTML', resultHTML);
    $sce.trustAsHtml(resultHTML);
    console.log('resultHTML', resultHTML);
    return resultHTML;
  };
}]);
