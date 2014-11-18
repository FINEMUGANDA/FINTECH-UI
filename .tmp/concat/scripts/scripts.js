'use strict';


var app = angular.module('Constants', []);

app.constant('APPLICATION', {    
    'host' : 'https://ec2-54-148-52-34.us-west-2.compute.amazonaws.com/mifosng-provider/',
    'sessionName': 'ang_session',
    'authToken': 'token',
    'username' : 'username',
    'role' : 'role',
    'PAGE_SIZE' : 5,
    'DISPLAYED_PAGES' : 5
});

app.constant('REST_URL', {
    'AUTHENTICATION': 'api/v1/authentication',
    'DASHBOARD_HEADER_STATISTIC': 'api/v1/runreports/Home page header statistic',
    'ALL_CLIENTS': 'api/v1/runreports/PageClientsScreenClients',
    'LOANS': 'api/v1/runreports/PageClientsScreenLoans',
    'LOANS_PENDING_APPROVALS': 'api/v1/runreports/PageClientsScreenLoansPA',
    'LOANS_AWAITING_DISBURSEMENT': 'api/v1/runreports/PageClientsScreenLoansAD',
    'LOANS_REJECTED': 'api/v1/runreports/PageClientsScreenLoansRejected',
    'LOANS_WRITTEN_OFF': 'api/v1/runreports/PageClientsScreenLoansWritten',
});

app.constant('PAGE_URL', {
    'ROOT': '/',
    'DASHBOARD': '/dashboard',
    'CLIENTS': '/clients',
    'LOANS': '/loans',
    'LOANSAWAITINGDISBURSEMENT': '/loansAwaitingDisbursement',
    'LOANSPENDINGAPPROVAL': '/loansPendingApproval',
    'LOANSREJECTED': '/loansRejected',
    'LOANSWRITTENOFF': '/loansWrittenOff'
});

app.constant('AUTH_EVENTS', {
  loginSuccess: 'auth-login-success',
  loginFailed: 'auth-login-failed',
  logoutSuccess: 'auth-logout-success',
  sessionTimeout: 'auth-session-timeout',
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
});

app.constant('USER_ROLES', {
  all: '*',
  admin: 'admin',
  user: 'user',
  guest: 'guest'
});


app.constant('CHART_TYPE', {
    'ACTIVE_BORROWERS': 'activeBorrowers',
    'PAR_PER_LOAN': 'parPerLoan',
    'LOANPORTFOLIO_UPDATES': 'changesInLoanPortfolio'
});
/**
 * @description Google Chart Api Directive Module for AngularJS
 * @version 0.0.11
 * @author Nicolas Bouillon <nicolas@bouil.org>
 * @author GitHub contributors
 * @license MIT
 * @year 2013
 */
(function (document, window, angular) {
    'use strict';

    angular.module('googlechart', [])

        .value('googleChartApiConfig', {
            version: '1',
            optionalSettings: {
                packages: ['corechart']
            }
        })

        .provider('googleJsapiUrl', function () {
            var protocol = 'https:';
            var url = '//www.google.com/jsapi';

            this.setProtocol = function(newProtocol) {
                protocol = newProtocol;
            };

            this.setUrl = function(newUrl) {
                url = newUrl;
            };

            this.$get = function() {
                return (protocol ? protocol : '') + url;
            };
        })
        .factory('googleChartApiPromise', ['$rootScope', '$q', 'googleChartApiConfig', 'googleJsapiUrl', function ($rootScope, $q, apiConfig, googleJsapiUrl) {
            var apiReady = $q.defer();
            var onLoad = function () {
                // override callback function
                var settings = {
                    callback: function () {
                        var oldCb = apiConfig.optionalSettings.callback;
                        $rootScope.$apply(function () {
                            apiReady.resolve();
                        });

                        if (angular.isFunction(oldCb)) {
                            oldCb.call(this);
                        }
                    }
                };

                settings = angular.extend({}, apiConfig.optionalSettings, settings);

                window.google.load('visualization', apiConfig.version, settings);
            };
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');

            script.setAttribute('type', 'text/javascript');
            script.src = googleJsapiUrl;

            if (script.addEventListener) { // Standard browsers (including IE9+)
                script.addEventListener('load', onLoad, false);
            } else { // IE8 and below
                script.onreadystatechange = function () {
                    if (script.readyState === 'loaded' || script.readyState === 'complete') {
                        script.onreadystatechange = null;
                        onLoad();
                    }
                };
            }

            head.appendChild(script);

            return apiReady.promise;
        }])
        .directive('googleChart', ['$timeout', '$window', '$rootScope', 'googleChartApiPromise', function ($timeout, $window, $rootScope, googleChartApiPromise) {
            return {
                restrict: 'A',
                scope: {
                    beforeDraw: '&',
                    chart: '=chart',
                    onReady: '&',
                    onSelect: '&',
                    select: '&'
                },
                link: function ($scope, $elm, $attrs) {
                    /* Watches, to refresh the chart when its data, formatters, options, view,
                        or type change. All other values intentionally disregarded to avoid double
                        calls to the draw function. Please avoid making changes to these objects
                        directly from this directive.*/
                    $scope.$watch(function () {
                        if ($scope.chart) {
                            return {
                                customFormatters: $scope.chart.customFormatters,
                                data: $scope.chart.data,
                                formatters: $scope.chart.formatters,
                                options: $scope.chart.options,
                                type: $scope.chart.type,
                                view: $scope.chart.view
                            };
                        }
                        return $scope.chart;
                    }, function () {
                        drawAsync();
                    }, true); // true is for deep object equality checking

                    // Redraw the chart if the window is resized
                    var resizeHandler = $rootScope.$on('resizeMsg', function () {
                        $timeout(function () {
                            // Not always defined yet in IE so check
                            if($scope.chartWrapper) {
                                drawAsync();
                            }
                        });
                    });

                    //Cleanup resize handler.
                    $scope.$on('$destroy', function () {
                        resizeHandler();
                    });

                    // Keeps old formatter configuration to compare against
                    $scope.oldChartFormatters = {};

                    function applyFormat(formatType, formatClass, dataTable) {

                        if (typeof($scope.chart.formatters[formatType]) != 'undefined') {
                            if (!angular.equals($scope.chart.formatters[formatType], $scope.oldChartFormatters[formatType])) {
                                $scope.oldChartFormatters[formatType] = $scope.chart.formatters[formatType];
                                $scope.formatters[formatType] = [];

                                if (formatType === 'color') {
                                    for (var cIdx = 0; cIdx < $scope.chart.formatters[formatType].length; cIdx++) {
                                        var colorFormat = new formatClass();

                                        for (i = 0; i < $scope.chart.formatters[formatType][cIdx].formats.length; i++) {
                                            var data = $scope.chart.formatters[formatType][cIdx].formats[i];

                                            if (typeof(data.fromBgColor) != 'undefined' && typeof(data.toBgColor) != 'undefined')
                                                colorFormat.addGradientRange(data.from, data.to, data.color, data.fromBgColor, data.toBgColor);
                                            else
                                                colorFormat.addRange(data.from, data.to, data.color, data.bgcolor);
                                        }

                                        $scope.formatters[formatType].push(colorFormat)
                                    }
                                } else {

                                    for (var i = 0; i < $scope.chart.formatters[formatType].length; i++) {
                                        $scope.formatters[formatType].push(new formatClass(
                                            $scope.chart.formatters[formatType][i])
                                        );
                                    }
                                }
                            }


                            //apply formats to dataTable
                            for (i = 0; i < $scope.formatters[formatType].length; i++) {
                                if ($scope.chart.formatters[formatType][i].columnNum < dataTable.getNumberOfColumns())
                                    $scope.formatters[formatType][i].format(dataTable, $scope.chart.formatters[formatType][i].columnNum);
                            }


                            //Many formatters require HTML tags to display special formatting
                            if (formatType === 'arrow' || formatType === 'bar' || formatType === 'color')
                                $scope.chart.options.allowHtml = true;
                        }
                    }

                    function draw() {
                        if (!draw.triggered && ($scope.chart != undefined)) {
                            draw.triggered = true;
                            $timeout(function () {

                                if (typeof ($scope.chartWrapper) == 'undefined') {
                                    var chartWrapperArgs = {
                                        chartType: $scope.chart.type,
                                        dataTable: $scope.chart.data,
                                        view: $scope.chart.view,
                                        options: $scope.chart.options,
                                        containerId: $elm[0]
                                    };

                                    $scope.chartWrapper = new google.visualization.ChartWrapper(chartWrapperArgs);
                                    google.visualization.events.addListener($scope.chartWrapper, 'ready', function () {
                                        $scope.chart.displayed = true;
                                        $scope.$apply(function (scope) {
                                            scope.onReady({ chartWrapper: scope.chartWrapper });
                                        });
                                    });
                                    google.visualization.events.addListener($scope.chartWrapper, 'error', function (err) {
                                        console.log("Chart not displayed due to error: " + err.message + ". Full error object follows.");
                                        console.log(err);
                                    });
                                    google.visualization.events.addListener($scope.chartWrapper, 'select', function () {
                                        var selectEventRetParams = {selectedItems:$scope.chartWrapper.getChart().getSelection()};
                                        // This is for backwards compatibility for people using 'selectedItem' that only wanted the first selection.
                                        selectEventRetParams['selectedItem'] = selectEventRetParams['selectedItems'][0];
                                        $scope.$apply(function () {
                                            if ($attrs.select) {
                                                console.log('Angular-Google-Chart: The \'select\' attribute is deprecated and will be removed in a future release.  Please use \'onSelect\'.');
                                                $scope.select(selectEventRetParams);
                                            }
                                            else {
                                                $scope.onSelect(selectEventRetParams);
                                            }
                                        });
                                    });
                                }
                                else {
                                    $scope.chartWrapper.setChartType($scope.chart.type);
                                    $scope.chartWrapper.setDataTable($scope.chart.data);
                                    $scope.chartWrapper.setView($scope.chart.view);
                                    $scope.chartWrapper.setOptions($scope.chart.options);
                                }

                                if (typeof($scope.formatters) === 'undefined')
                                    $scope.formatters = {};

                                if (typeof($scope.chart.formatters) != 'undefined') {
                                    applyFormat("number", google.visualization.NumberFormat, $scope.chartWrapper.getDataTable());
                                    applyFormat("arrow", google.visualization.ArrowFormat, $scope.chartWrapper.getDataTable());
                                    applyFormat("date", google.visualization.DateFormat, $scope.chartWrapper.getDataTable());
                                    applyFormat("bar", google.visualization.BarFormat, $scope.chartWrapper.getDataTable());
                                    applyFormat("color", google.visualization.ColorFormat, $scope.chartWrapper.getDataTable());
                                }

                                var customFormatters = $scope.chart.customFormatters;
                                if (typeof(customFormatters) != 'undefined') {
                                    for (var name in customFormatters) {
                                        applyFormat(name, customFormatters[name], $scope.chartWrapper.getDataTable());
                                    }
                                }

                                $timeout(function () {
                                    $scope.beforeDraw({ chartWrapper: $scope.chartWrapper });
                                    $scope.chartWrapper.draw();
                                    draw.triggered = false;
                                });
                            }, 0, true);
                        }
                    }

                    function drawAsync() {
                        googleChartApiPromise.then(function () {
                            draw();
                        })
                    }
                }
            };
        }])

        .run(['$rootScope', '$window', function ($rootScope, $window) {
            angular.element($window).bind('resize', function () {
                $rootScope.$emit('resizeMsg');
            });
        }]);

})(document, window, window.angular);

'use strict';

var GraphUtils = angular.module('GraphUtils', ['googlechart']);

/** 
 * graph generator 
 */
GraphUtils.factory('Graph', function () {
    // initialize to whatever is in the cookie, if anything
    var activeBorrowers = function(){
    	return {
		          "cols": [
		            {
		              "id": "name",
		              "label": "Name",
		              "type": "string"
		            },
		            {
		              "id": "borrowers",
		              "label": "Borrowers",		              
		              "type": "number"
		            }
		          ],
		          "rows": [
		            {
		              "c": [
		                {
		                  "v": "John S."
		                },
		                {
		                  "v": 149
		                }
		              ]
		            },
		            {
		              "c": [
		                {
		                  "v": "Philip L."
		                },
		                {
		                  "v": 255
		                }
		              ]
		            },
		            {
		              "c": [
		                {
		                  "v": "Philip R."
		                },
		                {
		                  "v": 475
		                }
		              ]
		            },
		            {
		              "c": [
		                {
		                  "v": "John E."
		                },
		                {
		                  "v": 201
		                }
		              ]
		            },
		            {
		              "c": [
		                {
		                  "v": "Vincent C."
		                },
		                {
		                  "v": 290
		                }
		              ]
		            }
		          ]
	            };
        };

    var parPerLoan = function(){
	    return {
	          "cols": [
	            {
	              "id": "name",
	              "label": "Name",
	              "type": "string",
	            },
	            {
	              "id": "borrowers",
	              "label": "Borrowers",		              
	              "type": "number",
	            }
	          ],
	          "rows": [
	            {
	              "c": [
	                {
	                  "v": "John S."
	                },
	                {
	                  "v": 14
	                }
	              ]
	            },
	            {
	              "c": [
	                {
	                  "v": "Philip L."
	                },
	                {
	                  "v": 4
	                }
	              ]
	            },
	            {
	              "c": [
	                {
	                  "v": "Philip R."
	                },
	                {
	                  "v": 10
	                }
	              ]
	            },
	            {
	              "c": [
	                {
	                  "v": "John E."
	                },
	                {
	                  "v": 17
	                }
	              ]
	            },
	            {
	              "c": [
	                {
	                  "v": "Vincent C."
	                },
	                {
	                  "v": 3
	                }
	              ]
	            }
	          ]
	        };
    };

     var changesInLoanPortfolio = function(){
	    return {
	          "cols": [
	            {
	              "id": "name",
	              "label": "Name",
	              "type": "string",
	            },
	            {
	              "id": "new",
	              "label": "New",
	              "type": "number",
	            },
	            {
	              "id": "roll-over",
	              "label": "Roll-over",		              
	              "type": "number"
	            },
	            {
	              "id": "repaid",
	              "label": "Repaid",		              
	              "type": "number"
	            }
	          ],
	          "rows": [
	            {
	              "c": [
	                {
	                  "v": "John S."
	                },
	                {
	                  "v": 26,
	                },
	                {
	                  "v": 19
	                },
	                {
	                  "v": 12
	                }
	              ]
	            },
	            {
	              "c": [
	                {
	                  "v": "Philip L."
	                },
	                {
	                  "v": 37
	                },
	                {
	                  "v": 13
	                },
	                {
	                  "v": 9
	                }
	              ]
	            },
	            {
	              "c": [
	                {
	                  "v": "Philip R."
	                },
	                {
	                  "v": 22
	                },
	                {
	                  "v": 29
	                },
	                {
	                  "v": 18
	                }
	              ]
	            },
	            {
	              "c": [
	                {
	                  "v": "John E."
	                },
	                {
	                  "v": 15
	                },
	                {
	                  "v": 7
	                },
	                {
	                  "v": 4
	                }
	              ]
	            },
	            {
	              "c": [
	                {
	                  "v": "Vincent C."
	                },
	                {
	                  "v": 40
	                },
	                {
	                  "v": 25
	                },
	                {
	                  "v": 12
	                }
	              ]
	            }
	          ]
	        };
    };

    return {
        getColumnChart: function (chartData) {
        	var data;
        	if("activeBorrowers" == chartData){
        		data = activeBorrowers();
        	}
        	else if("parPerLoan" == chartData){
        		data = parPerLoan();
        	}else if("changesInLoanPortfolio" == chartData){
        		data = changesInLoanPortfolio();
        	}

             return {
		        "type": "ColumnChart",
		        "cssStyle": "height:180px; width:100%;",
		        "data": data,
		        "options": {
		          "colors":['#88cac6','#e28b00','#449acc'],
		          "isStacked": "false",
		          "fill": 20,		          
		          "displayExactValues": true,
		          "vAxis": {		            
		            "gridlines": {
		              "count": 6
		            }
		          },
		          "hAxis": {
		          }
		        },
		        "formatters": {

		        },
		        "displayed": true
		      }
        },
        getBarChart: function () {
             return {
		        "type": "BarChart",
		        "cssStyle": "height:180px; width:100%;",
		        "data": {
		          "cols": [
		            {
		              "id": "month",
		              "label": "Month",
		              "type": "string",
		              "p": {}
		            },
		            {
		              "id": "laptop-id",
		              "label": "Laptop",
		              "type": "number",
		              "p": {}
		            },
		            {
		              "id": "desktop-id",
		              "label": "Desktop",
		              "type": "number",
		              "p": {}
		            },
		            {
		              "id": "server-id",
		              "label": "Server",
		              "type": "number",
		              "p": {}
		            },
		            {
		              "id": "cost-id",
		              "label": "Shipping",
		              "type": "number"
		            }
		          ],
		          "rows": [
		            {
		              "c": [
		                {
		                  "v": "January"
		                },
		                {
		                  "v": 19,
		                  "f": "42 items"
		                },
		                {
		                  "v": 12,
		                  "f": "Ony 12 items"
		                },
		                {
		                  "v": 7,
		                  "f": "7 servers"
		                },
		                {
		                  "v": 4
		                }
		              ]
		            },
		            {
		              "c": [
		                {
		                  "v": "February"
		                },
		                {
		                  "v": 13
		                },
		                {
		                  "v": 1,
		                  "f": "1 unit (Out of stock this month)"
		                },
		                {
		                  "v": 12
		                },
		                {
		                  "v": 2
		                }
		              ]
		            },
		            {
		              "c": [
		                {
		                  "v": "March"
		                },
		                {
		                  "v": 24
		                },
		                {
		                  "v": 0
		                },
		                {
		                  "v": 11
		                },
		                {
		                  "v": 6
		                }
		              ]
		            }
		          ]
		        },
		        "options": {
		          "title": "Sales per month",
		          "isStacked": "true",
		          "fill": 20,
		          "displayExactValues": true,
		          "vAxis": {
		            "title": "Sales unit",
		            "gridlines": {
		              "count": 6
		            }
		          },
		          "hAxis": {
		            "title": "Date"
		          }
		        },
		        "formatters": {},
		        "displayed": true
		      }
        },
        getLineChart: function () {
             return {
		        "type": "LineChart",
		        "cssStyle": "height:180px; width:100%;",
		        "data": {
		          "cols": [
		            {
		              "id": "month",
		              "label": "Month",
		              "type": "string",
		              "p": {}
		            },
		            {
		              "id": "laptop-id",
		              "label": "Laptop",
		              "type": "number",
		              "p": {}
		            },
		            {
		              "id": "desktop-id",
		              "label": "Desktop",
		              "type": "number",
		              "p": {}
		            },
		            {
		              "id": "server-id",
		              "label": "Server",
		              "type": "number",
		              "p": {}
		            },
		            {
		              "id": "cost-id",
		              "label": "Shipping",
		              "type": "number"
		            }
		          ],
		          "rows": [
		            {
		              "c": [
		                {
		                  "v": "January"
		                },
		                {
		                  "v": 19,
		                  "f": "42 items"
		                },
		                {
		                  "v": 12,
		                  "f": "Ony 12 items"
		                },
		                {
		                  "v": 7,
		                  "f": "7 servers"
		                },
		                {
		                  "v": 4
		                }
		              ]
		            },
		            {
		              "c": [
		                {
		                  "v": "February"
		                },
		                {
		                  "v": 13
		                },
		                {
		                  "v": 1,
		                  "f": "1 unit (Out of stock this month)"
		                },
		                {
		                  "v": 12
		                },
		                {
		                  "v": 2
		                }
		              ]
		            },
		            {
		              "c": [
		                {
		                  "v": "March"
		                },
		                {
		                  "v": 24
		                },
		                {
		                  "v": 0
		                },
		                {
		                  "v": 11
		                },
		                {
		                  "v": 6
		                }
		              ]
		            }
		          ]
		        },
		        "options": {
		          "title": "Sales per month",
		          "isStacked": "true",
		          "fill": 20,
		          "displayExactValues": true,
		          "vAxis": {
		            "title": "Sales unit",
		            "gridlines": {
		              "count": 6
		            }
		          },
		          "hAxis": {
		            "title": "Date"
		          }
		        },
		        "formatters": {},
		        "displayed": true
		      }
        },
        getPieChart: function () {
             return {
		        "type": "PieChart",
		        "cssStyle": "height:180px; width:100%;",
		        "data": {
		          "cols": [
		            {
		              "id": "month",
		              "label": "Month",
		              "type": "string",
		              "p": {}
		            },
		            {
		              "id": "laptop-id",
		              "label": "Laptop",
		              "type": "number",
		              "p": {}
		            }
		          ],
		          "rows": [
		            {
		              "c": [
		                {
		                  "v": "Collected"
		                },
		                {
		                  "v": 85
		                }
		              ]
		            },
		            {
		              "c": [
		                {
		                  "v": "Due"
		                },
		                {
		                  "v": 15
		                }
		              ]
		            }
		          ]
		        },
		        "options": {
		          "colors":['#88cac6','#e28b00'],
		          "pieHole": 0.4,		          
		          "isStacked": "true",
		          "fill": 20,
		          "displayExactValues": true,
		          "vAxis": {
		            "title": "Sales unit",
		            "gridlines": {
		              "count": 6
		            }
		          },
		          "hAxis": {
		            "title": "Date"
		          }
		        },
		        "formatters": {},
		        "displayed": true
		      }
        }
    };
});
'use strict';

/**
 * @ngdoc overview
 * @name angularjsApp
 * @description
 * # angularjsApp
 *
 * Main module of the application.
 */
var app = angular.module('angularjsApp', ['ngRoute', 'loginController','dashboardController','clientsController','userServices','Constants']);

 // Angular supports chaining, so here we chain the config function onto
  // the module we're configuring.
  app.config(['$routeProvider',function($routeProvider) {
    $routeProvider.
      when('/', {
        hclass: 'pre-login',
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      }).
      when('/dashboard', {
        templateUrl: 'views/dashboard.html',
        controller: 'DashboardCtrl',
        data: {
            authorizedRoles: ['admin']
          }
      }).
      when('/clients', {
        templateUrl: 'views/clients.html',
        controller: 'ClientsCtrl',
        data: {
            authorizedRoles: ['admin']
          }
      }).
      when('/loans', {
        templateUrl: 'views/loans.html',
        controller: 'LoansCtrl',
        data: {
            authorizedRoles: ['admin']
          }
      }).
      when('/loansPendingApproval', {
        templateUrl: 'views/loansPendingApprovals.html',
        controller: 'LoansPendingApprovalsCtrl',
        data: {
            authorizedRoles: ['admin']
          }
      }).
      when('/loansAwaitingDisbursement', {
        templateUrl: 'views/loansAwaitingDisbursement.html',
        controller: 'LoansAwaitingDisbursementCtrl',
        data: {
            authorizedRoles: ['admin']
          }
      }).
       when('/loansRejected', {
        templateUrl: 'views/loansRejected.html',
        controller: 'LoansRejectedCtrl',
        data: {
            authorizedRoles: ['admin']
          }
      }).
      when('/loansWrittenOff', {
        templateUrl: 'views/loansWrittenOff.html',
        controller: 'LoansWrittenOffCtrl',
        data: {
            authorizedRoles: ['admin']
          }
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);

app.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.headers.common['X-Mifos-Platform-TenantId'] = 'default';
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        $httpProvider.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
    }
]);


app.run(["$rootScope", "$location", "AUTH_EVENTS", "AuthService", "Session", "APPLICATION", "PAGE_URL", function ($rootScope, $location, AUTH_EVENTS, AuthService, Session, APPLICATION,PAGE_URL) {
  //total number of records in single page
  $rootScope.itemsByPage = APPLICATION.PAGE_SIZE;
  //total number of page in single page
  $rootScope.displayedPages = APPLICATION.DISPLAYED_PAGES;
  $rootScope.page = {
      setHclass: function(hclass) {
          this.hclass = hclass;
      }
  }

  $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
        $rootScope.page.setHclass(current.$$route.hclass);
  });

  //To update after view reloaded
  $rootScope.$on('$includeContentLoaded', function() {
    console.log("includeContentLoaded: includeContentLoaded success!");
      //get top navigation menu
        var $topNavigation = angular.element('#main-navbar-collapse .nav.navbar-nav:first');
        //find all li tags (menus) from top UL
        var $liEle = $topNavigation.find('li');
        //check length
        if ($liEle.length > 0) {
          //travers to each menu item to remove selected menu class
          $liEle.each(function() {
              var $li=$(this);
              $li.removeClass('active');
          });
        }
        //add active /selection class for open view menu item      
        switch($location.path()){
          case PAGE_URL.CLIENTS:
          case PAGE_URL.LOANS:
          case PAGE_URL.LOANSAWAITINGDISBURSEMENT:
          case PAGE_URL.LOANSPENDINGAPPROVAL:
          case PAGE_URL.LOANSREJECTED:
          case PAGE_URL.LOANSWRITTENOFF:
            $topNavigation.find('.clients').parent().addClass('active');
            break;
          default:
            $topNavigation.find('.home').parent().addClass('active');
        }
  });

  $rootScope.$on('$stateChangeStart', function (event, next) {    
    var authorizedRoles = next.data.authorizedRoles;
    if (!AuthService.isAuthorized(authorizedRoles)) {
      event.preventDefault();
      if (AuthService.isAuthenticated()) {
        // user is not allowed
        $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
      } else {
        // user is not logged in
        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
      }
    }
  });

  //hendled notAuthenticated event
  $rootScope.$on(AUTH_EVENTS.notAuthenticated, function (event, next) {
    $location.url(PAGE_URL.ROOT);
  });
  $rootScope.$on(AUTH_EVENTS.sessionTimeout, function (event, next) {
    $location.url(PAGE_URL.ROOT);
  });  

  if(Session.getValue(APPLICATION.authToken) != null){
    if($location.path()==PAGE_URL.ROOT || $location.path()==''){
      $location.url(PAGE_URL.DASHBOARD);
    }
  }else{
    //TODO - Need to remove else block once all the functionality will be implemented
    $location.url(PAGE_URL.ROOT);
  }
}]);

app.config(["$httpProvider", function ($httpProvider) {
  $httpProvider.interceptors.push([
    '$injector',
    function ($injector) {
      return $injector.get('AuthInterceptor');
    }
  ]);
}])

app.factory('AuthInterceptor', ["$rootScope", "$q", "AUTH_EVENTS", function ($rootScope, $q, AUTH_EVENTS) {
  return {
    responseError: function (response) { 
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
        403: AUTH_EVENTS.notAuthorized,
        419: AUTH_EVENTS.sessionTimeout,
        440: AUTH_EVENTS.sessionTimeout
      }[response.status], response);
      return $q.reject(response);
    }
  };
}])

app.controller('ApplicationController', ["$scope", "$location", "USER_ROLES", "AuthService", function ($scope, $location, USER_ROLES, AuthService) {  
  $scope.currentUser = null;
  $scope.userRoles = USER_ROLES;
  $scope.isAuthorized = AuthService.isAuthorized;
 
  $scope.setCurrentUser = function (user) {
    $scope.currentUser = user;
  };

  $scope.changeView = function (view) {
    $location.path(view);
  };
}]);

app.factory('Session', ["APPLICATION", function(APPLICATION) {
  

  var Session = {
    create: function(sessionId, userName, userRole){
      var data = {};
      data[APPLICATION.authToken] = sessionId;
      data[APPLICATION.username] = userName;
      data[APPLICATION.role] = userRole;
      window.localStorage.setItem('ang_session', JSON.stringify(data));
    },
    setValue: function(key, value) { 
      var data = {};
      try {
        data =  JSON.parse(window.localStorage.getItem(APPLICATION.sessionName));
      } catch (e) {
        console.log('Error to get session data from local storage');
        return null;
      }
      data[key] = value;
      window.localStorage.setItem('ang_session', JSON.stringify(data)); 
    },
    getValue: function(key) { 
      var data = {};
      try {
        data =  JSON.parse(window.localStorage.getItem(APPLICATION.sessionName));
        return data[key];
      } catch (e) {
        console.log('Error to get session data from local storage');
        return null;
      }
      
    },
    remove: function(){
      var data = {};
      window.localStorage.setItem(APPLICATION.sessionName, JSON.stringify(data));
    }
  };
  
  return Session; 
}]);

app.directive('showValidation', [function() {
    return {
        restrict: "A",
        require:'form',
        link: function(scope, element, attrs, formCtrl) {
            element.find('.form-group').each(function() {
                var $formGroup=$(this);
                var $inputs = $formGroup.find('input[ng-model],textarea[ng-model],select[ng-model]');

                if ($inputs.length > 0) {
                    $inputs.each(function() {
                        var $input=$(this);
                        scope.$watch(function() {
                            return $input.hasClass('ng-invalid');
                        }, function(isInvalid) {
                            var $spanEle = $formGroup.find('span');
                            if ($spanEle.length > 0) {
                              $spanEle.each(function() {
                                  var $span=$(this);
                                  $span.toggleClass('glyphicon-remove', isInvalid);
                                  $span.toggleClass('glyphicon-ok', !isInvalid);    
                              });
                            }
                            $formGroup.toggleClass('has-success', !isInvalid);
                            $formGroup.toggleClass('has-error', isInvalid);
                        });
                    });
                }
            });
        }
    };
}]);

//color code status for each data tables
app.filter('status', [ function() {
    var STATUS_COLOR_CODE = {'0': 'status bad',//red
      '100': 'status on-hold',//yellow
      '200': 'status on-hold',//yellow
      '300': 'status active',//green
      '400': 'status closed',//grey
      '500': 'status closed',//grey
      '600': 'status closed',//grey
      '601': 'status closed',//grey
      '602': 'status active',//green
      '700': 'status active',//green
      '800': 'status active',//green
      '900': 'status active'//green
    };
    return function(statusCode) {
      return STATUS_COLOR_CODE[statusCode];
    };
}]);

//color code status for each data tables
app.filter('checkEmptyString', [ function() {

    return function(value) {
      return value=='';
    };
}]);



'use strict';

var utils = angular.module('Utils', []);

/** 
 * Authentication 
 */
utils.factory('Auth', ["Base64", "$http", function (Base64, $http) {
    // initialize to whatever is in the cookie, if anything
    return {
        setCredentials: function (username, password) {
            var encoded = Base64.encode(username + ':' + password);            
            //$http.defaults.headers.common.Authorization = 'Basic ' + encoded;
        }
    };
}]);

/** 
 * General utility
 */
utils.factory('Utility', function () {
    // initialize to whatever is in the cookie, if anything
    return {
        isUndefinedOrNull: function(obj) {
            return !angular.isDefined(obj) || obj===null;
        }
    };
});

/** 
 * Authentication header creation base64 Algorithm
 */
utils.factory('Base64', function() {
    var keyStr = 'ABCDEFGHIJKLMNOP' +
        'QRSTUVWXYZabcdef' +
        'ghijklmnopqrstuv' +
        'wxyz0123456789+/' +
        '=';
    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
 
            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
 
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
 
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
 
                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);
 
            return output;
        },
 
        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
 
            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));
 
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
 
                output = output + String.fromCharCode(chr1);
 
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
 
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
 
            } while (i < input.length);
 
            return output;
        }
    };
});
'use strict';

var delegatorServices = angular.module('delegatorServices', ['Utils','Constants']);

delegatorServices.factory('Remote', ["$http", "APPLICATION", "Session", function($http, APPLICATION, Session) {
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
}]);
'use strict';

var userServices = angular.module('userServices', ['delegatorServices']);

userServices.factory('AuthService', ["$http", "$filter", "Remote", "Session", function($http, $filter, Remote, Session) {
    return {
	  	    authentication: function(url, loginDetails) { 
                console.log('Authentication service...'); 
                var promise = Remote.post(url); 
		  	    return promise;
		  	},
            logout: function(url){
                console.log('Logout service...'); 
                var promise = Remote.delete(url); 
                return promise;
            },
            isAuthenticated: function () {
                return !!Session.getValue(APPLICATION.authToken);
            },
            isAuthorized: function (authorizedRoles) {
                if (!angular.isArray(authorizedRoles)) {
                    authorizedRoles = [authorizedRoles];
                }
                return (this.isAuthenticated() && authorizedRoles.indexOf(Session.getValue(APPLICATION.role)) !== -1);
            }
	}
}]);
'use strict';

var dashboardService = angular.module('dashboardService', ['delegatorServices']);

dashboardService.factory('DashboardService', ["$http", "Remote", function($http, Remote) {
    return {
            headerStatistics: function(url){
                console.log('Get total active clients...');
                var promise = Remote.get(url);
                return promise;
            }
	}
}]);
'use strict';

var clientsService = angular.module('clientsService', ['delegatorServices']);

clientsService.factory('ClientsService', ["$http", "Remote", function($http, Remote) {
    return {
            getData: function(url){
                console.log('Get Data using clientsService...');
                var promise = Remote.get(url);
                return promise;
            }
	}
}]);
'use strict';
 
// Here we attach this controller to our testApp module
var LoginCtrl =  angular.module('loginController',['userServices','Utils','Constants']);
  
// The controller function let's us give our controller a name: MainCtrl
// We'll then pass an anonymous function to serve as the controller itself.
LoginCtrl.controller('LoginCtrl', ["$scope", "$rootScope", "$location", "Auth", "AuthService", "Utility", "AUTH_EVENTS", "REST_URL", "PAGE_URL", "Session", "Base64", function ($scope, $rootScope,$location, Auth, AuthService, Utility, AUTH_EVENTS, REST_URL, PAGE_URL, Session, Base64) {
  //Authentication controller 
  $scope.authenticate = function(loginDetails){
    console.log('LoginCtrl : authenticate');
    //reset error value
    $scope.error=false;
    //Validate login form
    if ($scope.loginForm.$valid) {
      //check for null details
      if(!Utility.isUndefinedOrNull(loginDetails)){
        //Set the credentials in header
        Auth.setCredentials(loginDetails.username, loginDetails.password);
        //Fired authentication call to server
        var authURL = REST_URL.AUTHENTICATION+"?username="+loginDetails.username+"&password="+loginDetails.password;

        //authentication success callback
        var authenticationSuccess = function(result){
          console.log('Success : Return from login service.');
          //Broadcast a login success event
          $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
         //Create a new user session 
          Session.create(Base64.encode(loginDetails.username + ':' + loginDetails.password), result.data.username, result.data.roles[0]);
          //Redirect Dashboard page
          $location.url(PAGE_URL.DASHBOARD);
         }
        
        AuthService.authentication(authURL).then(authenticationSuccess,$scope.authenticationFail);

        
      }else{
        $scope.authenticationFail();
      }
    } else {
      $scope.invalidateForm();
    }
  };

  //Authentication logout controller
  $scope.logout = function(){
   AuthService.logout(REST_URL.AUTHENTICATION).then(function(result){
        Session.remove();
        $location.url(PAGE_URL.ROOT);
      },function(result){
          console.log('Error : Return from logout service.');
      });
  };

  //authentication fail callback
  $scope.authenticationFail = function(result){
    console.log('Error : Return from login service.');
    //Broadcast a login failed event
    $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
    $scope.error=true;
  }

  //invalidate login form
  $scope.invalidateForm = function(){
   $scope.loginForm.invalidate = false;
  };

  //Clear error from the login page
  $scope.clearError = function(){
   $scope.loginForm.invalidate = false;
  };
}]);
'use strict';
 
  // Here we attach this controller to our testApp module
var dashboardCtrl = angular.module('dashboardController',['dashboardService','Constants', 'GraphUtils']);
  
dashboardCtrl.controller('DashboardCtrl', ["$scope", "$rootScope", "$location", "DashboardService", "REST_URL", "PAGE_URL", "CHART_TYPE", "APPLICATION", "Session", "Graph", function ($scope, $rootScope, $location, DashboardService, REST_URL, PAGE_URL, CHART_TYPE, APPLICATION, Session, Graph) {
  //To load the dashboard page
  $scope.loadDashboard = function(){
    console.log('DashboardCtrl : loadDashboard');
    $scope.username = Session.getValue(APPLICATION.username);
    //Set header values 
    $scope.getHeaderStatistics();    
    //Dummy Charts
    $scope.borrowerPerLoanOfficer = Graph.getColumnChart(CHART_TYPE.ACTIVE_BORROWERS);
    $scope.PARPerLoanOfficer = Graph.getColumnChart(CHART_TYPE.PAR_PER_LOAN);
    $scope.loanPortfolioCurrentMonth = Graph.getColumnChart(CHART_TYPE.LOANPORTFOLIO_UPDATES);
    $scope.dueVsCollectedLastWeek = Graph.getPieChart();
  };

  $scope.getHeaderStatistics = function(){
    console.log('DashboardCtrl : getHomePageHeaderStatic');
     //Success callback
    var headerStatisticsSuccess = function(result){
      console.log('Success : Return from headerStatistics service.');
      $scope.totalActiveClient = result.data[0].totalActiveClient;
      $scope.totalBorrowers = result.data[0].totalBorrowers;
      $scope.loansInBadStanding = result.data[0].loansInBadStanding;      
      $scope.repaymentsDueThisWeek = result.data[0].repaymentsDueThisWeek;
    } 
    //failur callback
    var headerStatisticsFail = function(result){
      console.log('Error : Return from headerStatistics service.');
      $scope.totalActiveClient = 0;
      $scope.totalBorrowers = 0;
      $scope.loansInBadStanding = 0;      
      $scope.repaymentsDueThisWeek = 0;
    }
    //service to get Statistics value from server
    DashboardService.headerStatistics(REST_URL.DASHBOARD_HEADER_STATISTIC).then(headerStatisticsSuccess,headerStatisticsFail);
   
  };

  //will fire on every page load
  $scope.loadDashboard();
}]);
'use strict';
 
  // Here we attach this controller to our testApp module
var clientsCtrl = angular.module('clientsController',['clientsService','Constants', 'smart-table']);

clientsCtrl.controller('ClientsCtrl', ["$scope", "$rootScope", "$location", "$timeout", "ClientsService", "REST_URL", "APPLICATION", function ($scope, $rootScope, $location, $timeout, ClientsService, REST_URL, APPLICATION) {
      console.log('ClientsCtrl : loadClients');
      //To load the clients page
      var promise = null;

      $scope.isLoading = false;
      $scope.rowCollection = [];
      $scope.displayed=[]
      //Success callback
      var allClientsSuccess = function(result) {
         $scope.isLoading = false;
         try {
              $scope.rowCollection = result.data;
          } catch (e) {
          }
      }

      //failur callback
      var allClientsFail = function(result){
          $scope.isLoading = false;
          console.log('Error : Return from allClients service.');
      }

      var loadClients = function getData(tableState) {
        $scope.isLoading = true;

        $timeout(
          function() {
              $scope.rowCollection = [];
              //service to get clients from server
              ClientsService.getData(REST_URL.ALL_CLIENTS).then(allClientsSuccess, allClientsFail);              
          }, 2000
        );
      };

      loadClients();
}]);


clientsCtrl.controller('LoansCtrl', ["$scope", "$rootScope", "$location", "$timeout", "ClientsService", "REST_URL", "APPLICATION", function ($scope, $rootScope, $location, $timeout, ClientsService, REST_URL, APPLICATION) {
      console.log('LoansCtrl : Loans');
      //To load the loans page
      var promise = null;

      $scope.isLoading = false;
      $scope.rowCollection = [];
      $scope.displayed=[]
      //Success callback
      var allLoansSuccess = function(result) {
         $scope.isLoading = false;
         try {
              $scope.rowCollection = result.data;
          } catch (e) {
          }
      }

      //failur callback
      var allLoansFail = function(result){
          $scope.isLoading = false;
          console.log('Error : Return from allLoansFail service.');
      }

      var loadLoans = function getData(tableState) {
        $scope.isLoading = true;

        $timeout(
          function() {
              $scope.rowCollection = [];
              //service to get loans from server
              ClientsService.getData(REST_URL.LOANS).then(allLoansSuccess, allLoansFail);              
          }, 2000
        );
      };

      loadLoans();
}]);


clientsCtrl.controller('LoansPendingApprovalsCtrl', ["$scope", "$rootScope", "$location", "$timeout", "ClientsService", "REST_URL", "APPLICATION", function ($scope, $rootScope, $location, $timeout, ClientsService, REST_URL, APPLICATION) {
      console.log('LoansPendingApprovalsCtrl : LoansPendingApprovals');
      //To load the LoansPendingApprovals page
      var promise = null;

      $scope.isLoading = false;
      $scope.rowCollection = [];
      $scope.displayed=[]
      //Success callback
      var allLoansPendingApprovalsSuccess = function(result) {
         $scope.isLoading = false;
         try {
              $scope.rowCollection = result.data;
          } catch (e) {
          }
      }

      //failur callback
      var allLoansPendingApprovalsFail = function(result){
          $scope.isLoading = false;
          console.log('Error : Return from allLoansPendingApprovalsFail service.');
      }

      var loadLoansPendingApprovals = function getData(tableState) {
        $scope.isLoading = true;

        $timeout(
          function() {
              $scope.rowCollection = [];
              //service to get LoansPendingApprovals from server
              ClientsService.getData(REST_URL.LOANS_PENDING_APPROVALS).then(allLoansPendingApprovalsSuccess, allLoansPendingApprovalsFail);              
          }, 2000
        );
      };

      loadLoansPendingApprovals();
}]);

clientsCtrl.controller('LoansAwaitingDisbursementCtrl', ["$scope", "$rootScope", "$location", "$timeout", "ClientsService", "REST_URL", "APPLICATION", function ($scope, $rootScope, $location, $timeout, ClientsService, REST_URL, APPLICATION) {
    console.log('LoansAwaitingDisbursementCtrl : LoansAwaitingDisbursement');
      //To load the LoansAwaitingDisbursement page
      var promise = null;

      $scope.isLoading = false;
      $scope.rowCollection = [];
      $scope.displayed=[]
      //Success callback
      var allLoansAwaitingDisbursementSuccess = function(result) {
         $scope.isLoading = false;
         try {
              $scope.rowCollection = result.data;
          } catch (e) {
          }
      }

      //failur callback
      var allLoansAwaitingDisbursemensFail = function(result){
          $scope.isLoading = false;
          console.log('Error : Return from allLoansAwaitingDisbursemensFail service.');
      }

      var loadLoansPendingApprovals = function getData(tableState) {
        $scope.isLoading = true;

        $timeout(
          function() {
              $scope.rowCollection = [];
              //service to get allLoansAwaitingDisbursemensFail from server
              ClientsService.getData(REST_URL.LOANS_AWAITING_DISBURSEMENT).then(allLoansAwaitingDisbursementSuccess, allLoansAwaitingDisbursemensFail);              
          }, 2000
        );
      };

      loadLoansPendingApprovals();
}]);

clientsCtrl.controller('LoansRejectedCtrl', ["$scope", "$rootScope", "$location", "$timeout", "ClientsService", "REST_URL", "APPLICATION", function ($scope, $rootScope, $location, $timeout, ClientsService, REST_URL, APPLICATION) {
    console.log('LoansRejectedCtrl : LoansRejected');
      //To load the LoansRejected page
      var promise = null;

      $scope.isLoading = false;
      $scope.rowCollection = [];
      $scope.displayed=[]
      //Success callback
      var allLoansRejectedSuccess = function(result) {
         $scope.isLoading = false;
         try {
              $scope.rowCollection = result.data;
          } catch (e) {
          }
      }

      //failur callback
      var allLoansRejectedFail = function(result){
          $scope.isLoading = false;
          console.log('Error : Return from LoansRejected service.');
      }

      var loadLoansRejected = function getData(tableState) {
        $scope.isLoading = true;

        $timeout(
          function() {
              $scope.rowCollection = [];
              //service to get allLoansAwaitingDisbursemensFail from server
              ClientsService.getData(REST_URL.LOANS_REJECTED).then(allLoansRejectedSuccess, allLoansRejectedFail);              
          }, 2000
        );
      };

      loadLoansRejected();
}]);

clientsCtrl.controller('LoansWrittenOffCtrl', ["$scope", "$rootScope", "$location", "$timeout", "ClientsService", "REST_URL", "APPLICATION", function ($scope, $rootScope, $location, $timeout, ClientsService, REST_URL, APPLICATION) {
  console.log('LoansWrittenOffCtrl : LoansWrittenOff');
      //To load the LoansWrittenOff page
      var promise = null;

      $scope.isLoading = false;
      $scope.rowCollection = [];
      $scope.displayed=[]
      //Success callback
      var allLoansWrittenOffSuccess = function(result) {
         $scope.isLoading = false;
         try {
              $scope.rowCollection = result.data;
          } catch (e) {
          }
      }

      //failur callback
      var allLoansWrittenOffFail = function(result){
          $scope.isLoading = false;
          console.log('Error : Return from LoansWrittenOff service.');
      }

      var loadLoansWrittenOff = function getData(tableState) {
        $scope.isLoading = true;

        $timeout(
          function() {
              $scope.rowCollection = [];
              //service to get LoansWritten from server
              ClientsService.getData(REST_URL.LOANS_WRITTEN_OFF).then(allLoansWrittenOffSuccess, allLoansWrittenOffFail);              
          }, 2000
        );
      };

      loadLoansWrittenOff();
}]);