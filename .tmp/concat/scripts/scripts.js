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

/*The MIT License (MIT)

Copyright (c) 2014 https://github.com/kayalshri/

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.*/

(function($){
        $.fn.extend({
            tableExport: function(options) {
                var defaults = {
						separator: ',',
						ignoreColumn: [],
						tableName:'yourTableName',
						type:'csv',
						pdfFontSize:14,
						pdfLeftMargin:20,
						escape:'true',
						htmlContent:'false',
						consoleLog:'false'
				};
                
				var options = $.extend(defaults, options);
				var el = this;
				var rowCalc;
				var n;
				if(defaults.type == 'csv' || defaults.type == 'txt'){
				
					// Header
					var tdData ="";
					$(el).find('thead').find('tr').each(function() {
					tdData += "\n";					
						$(this).filter(':visible').find('th').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									tdData += '"' + parseString($(this)) + '"' + defaults.separator;									
								}
							}
							
						});
						tdData = $.trim(tdData);
						tdData = $.trim(tdData).substring(0, tdData.length -1);
					});
					
					// Row vs Column
					$(el).find('tbody').find('tr').each(function() {
					tdData += "\n";
						$(this).filter(':visible').find('td').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									tdData += '"'+ parseString($(this)) + '"'+ defaults.separator;
								}
							}
						});
						//tdData = $.trim(tdData);
						tdData = $.trim(tdData).substring(0, tdData.length -1);
					});
					
					//output
					if(defaults.consoleLog == 'true'){
						console.log(tdData);
					}
					var base64data = "base64," + $.base64.encode(tdData);
					window.open('data:application/'+defaults.type+';filename=exportData;' + base64data);
				}else if(defaults.type == 'sql'){
				
					// Header
					var tdData ="INSERT INTO `"+defaults.tableName+"` (";
					$(el).find('thead').find('tr').each(function() {
					
						$(this).filter(':visible').find('th').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									tdData += '`' + parseString($(this)) + '`,' ;									
								}
							}
							
						});
						tdData = $.trim(tdData);
						tdData = $.trim(tdData).substring(0, tdData.length -1);
					});
					tdData += ") VALUES ";
					// Row vs Column
					$(el).find('tbody').find('tr').each(function() {
					tdData += "(";
						$(this).filter(':visible').find('td').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									tdData += '"'+ parseString($(this)) + '",';
								}
							}
						});
						
						tdData = $.trim(tdData).substring(0, tdData.length -1);
						tdData += "),";
					});
					tdData = $.trim(tdData).substring(0, tdData.length -1);
					tdData += ";";
					
					//output
					//console.log(tdData);
					
					if(defaults.consoleLog == 'true'){
						console.log(tdData);
					}
					
					var base64data = "base64," + $.base64.encode(tdData);
					window.open('data:application/sql;filename=exportData;' + base64data);
					
				
				}else if(defaults.type == 'json'){
				
					var jsonHeaderArray = [];
					$(el).find('thead').find('tr').each(function() {
						var tdData ="";	
						var jsonArrayTd = [];
					
						$(this).filter(':visible').find('th').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									jsonArrayTd.push(parseString($(this)));									
								}
							}
						});									
						jsonHeaderArray.push(jsonArrayTd);						
						
					});
					
					var jsonArray = [];
					$(el).find('tbody').find('tr').each(function() {
						var tdData ="";	
						var jsonArrayTd = [];
					
						$(this).filter(':visible').find('td').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									jsonArrayTd.push(parseString($(this)));									
								}
							}
						});									
						jsonArray.push(jsonArrayTd);									
						
					});
					
					var jsonExportArray =[];
					jsonExportArray.push({header:jsonHeaderArray,data:jsonArray});
					
					//Return as JSON
					//console.log(JSON.stringify(jsonExportArray));
					
					//Return as Array
					//console.log(jsonExportArray);
					if(defaults.consoleLog == 'true'){
						console.log(JSON.stringify(jsonExportArray));
					}
					var base64data = "base64," + $.base64.encode(JSON.stringify(jsonExportArray));
					window.open('data:application/json;filename=exportData;' + base64data);
				}else if(defaults.type == 'xml'){
				
					var xml = '<?xml version="1.0" encoding="utf-8"?>';
					xml += '<tabledata><fields>';

					// Header
					$(el).find('thead').find('tr').each(function() {
						$(this).filter(':visible').find('th').each(function(index,data) {
							if ($(this).css('display') != 'none'){					
								if(defaults.ignoreColumn.indexOf(index) == -1){
									xml += "<field>" + parseString($(this)) + "</field>";
								}
							}
						});									
					});					
					xml += '</fields><data>';
					
					// Row Vs Column
					var rowCount=1;
					$(el).find('tbody').find('tr').each(function() {
						xml += '<row id="'+rowCount+'">';
						var colCount=0;
						$(this).filter(':visible').find('td').each(function(index,data) {
							if ($(this).css('display') != 'none'){	
								if(defaults.ignoreColumn.indexOf(index) == -1){
									xml += "<column-"+colCount+">"+parseString($(this))+"</column-"+colCount+">";
								}
							}
							colCount++;
						});															
						rowCount++;
						xml += '</row>';
					});					
					xml += '</data></tabledata>'
					
					if(defaults.consoleLog == 'true'){
						console.log(xml);
					}
					
					var base64data = "base64," + $.base64.encode(xml);
					window.open('data:application/xml;filename=exportData;' + base64data);

				}else if(defaults.type == 'excel' || defaults.type == 'doc'|| defaults.type == 'powerpoint'  ){
					//console.log($(this).html());
					var excel="<table>";
					// Header
					//Praik patel : skip first
					$(el).find('thead').find('tr:gt(0)').each(function() {
						excel += "<tr>";
						$(this).filter(':visible').find('th').each(function(index,data) {
							if ($(this).css('display') != 'none'){					
								//Praik patel :commented for header ignore column option
								excel += "<td>" + parseString($(this))+ "</td>";
							}
						});	
						excel += '</tr>';								
					});							
					
					
					// Row Vs Column
					var rowCount=1;
					$(el).find('tbody').find('tr').each(function() {
						excel += "<tr>";
						var colCount=0;
						$(this).filter(':visible').find('td').each(function(index,data) {
							if ($(this).css('display') != 'none'){	
								if((''+defaults.ignoreColumn).indexOf(index) === -1){
									excel += "<td>"+parseString($(this))+"</td>";		
								}
							}
							colCount++;
						});															
						rowCount++;
						excel += '</tr>';
					});					
					excel += '</table>'
					
					if(defaults.consoleLog == 'true'){
						console.log(excel);
					}
					
					var excelFile = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:"+defaults.type+"' xmlns='http://www.w3.org/TR/REC-html40'>";
					excelFile += "<head>";
					excelFile += "<!--[if gte mso 9]>";
					excelFile += "<xml>";
					excelFile += "<x:ExcelWorkbook>";
					excelFile += "<x:ExcelWorksheets>";
					excelFile += "<x:ExcelWorksheet>";
					excelFile += "<x:Name>";
					excelFile += "{worksheet}";
					excelFile += "</x:Name>";
					excelFile += "<x:WorksheetOptions>";
					excelFile += "<x:DisplayGridlines/>";
					excelFile += "</x:WorksheetOptions>";
					excelFile += "</x:ExcelWorksheet>";
					excelFile += "</x:ExcelWorksheets>";
					excelFile += "</x:ExcelWorkbook>";
					excelFile += "</xml>";
					excelFile += "<![endif]-->";
					excelFile += "</head>";
					excelFile += "<body>";
					excelFile += excel;
					excelFile += "</body>";
					excelFile += "</html>";

					var base64data = "base64," + $.base64.encode(excelFile);
					window.open('data:application/vnd.ms-'+defaults.type+';filename=exportData.doc;' + base64data);
					
				}else if(defaults.type == 'png'){
					html2canvas($(el), {
						onrendered: function(canvas) {										
							var img = canvas.toDataURL("image/png");
							window.open(img);
							
							
						}
					});		
				}else if(defaults.type == 'pdf'){
	
					var doc = new jsPDF('p','pt', 'a4', true);
					doc.setFontSize(defaults.pdfFontSize);
					
					// Header
					var startColPosition=defaults.pdfLeftMargin;
					//Praik patel : skip first
					$(el).find('thead').find('tr:gt(0)').each(function() {
						$(this).filter(':visible').find('th').each(function(index,data) {
							if ($(this).css('display') != 'none'){					
								//Praik patel :commented for header ignore column option
								//if(defaults.ignoreColumn.indexOf(index) == -1){
									var colPosition = startColPosition + (index * 37);									
									doc.text(colPosition,20, parseString($(this)));
								//}
							}
						});									
					});					
				
				
					// Row Vs Column
					var startRowPosition = 20; var page =1;var rowPosition=0;
					$(el).find('tbody').find('tr').each(function(index,data) {
						rowCalc = index+1;
						
					if (rowCalc % 26 == 0){
						doc.addPage();
						page++;
						startRowPosition=startRowPosition+10;
					}
					rowPosition=(startRowPosition + (rowCalc * 10)) - ((page -1) * 280);
						
						$(this).filter(':visible').find('td').each(function(index,data) {
							if ($(this).css('display') != 'none'){	
								if(defaults.ignoreColumn.indexOf(index) == -1){
									//Pratik patel : added defaults.ignoreColumn.length

									var colPosition = 0;
									if(defaults.ignoreColumn.length>1){
										colPosition = startColPosition+ ((index-(defaults.ignoreColumn.length-1)) * 37);									
									}else if(defaults.ignoreColumn.length==1){
										colPosition = startColPosition+ ((index-(defaults.ignoreColumn.length)) * 37);									
									}
									else{
										colPosition = startColPosition+ (index * 37);									
									}
									doc.text(colPosition,rowPosition, parseString($(this)));
								}
							}
							
						});															
						
					});					
										
					// Output as Data URI
					doc.output('datauri');
	
				}
				
				
				function parseString(data){
					var content_data='';
					if(defaults.htmlContent == 'true'){
						content_data = data.html().trim();
					}else{
						
						//Pratik patel : updated for div within TD
						if((data.filter(':visible').find('div')).size() > 0){

							data.filter(':visible').find('div').each(function(index,datadiv) {
								content_data += $(datadiv).text().trim()+" ";
							});
						}else{
							content_data = data.text().trim();	
						}
						
					}
					
					if(defaults.escape == 'true'){
						content_data = escape(content_data);
					}
					
					
					
					return content_data;
				}
			
			}
        });
    })(jQuery);
        

/*jslint adsafe: false, bitwise: true, browser: true, cap: false, css: false,
  debug: false, devel: true, eqeqeq: true, es5: false, evil: false,
  forin: false, fragment: false, immed: true, laxbreak: false, newcap: true,
  nomen: false, on: false, onevar: true, passfail: false, plusplus: true,
  regexp: false, rhino: true, safe: false, strict: false, sub: false,
  undef: true, white: false, widget: false, windows: false */
/*global jQuery: false, window: false */
//"use strict";

/*
 * Original code (c) 2010 Nick Galbreath
 * http://code.google.com/p/stringencoders/source/browse/#svn/trunk/javascript
 *
 * jQuery port (c) 2010 Carlo Zottmann
 * http://github.com/carlo/jquery-base64
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
*/

/* base64 encode/decode compatible with window.btoa/atob
 *
 * window.atob/btoa is a Firefox extension to convert binary data (the "b")
 * to base64 (ascii, the "a").
 *
 * It is also found in Safari and Chrome.  It is not available in IE.
 *
 * if (!window.btoa) window.btoa = $.base64.encode
 * if (!window.atob) window.atob = $.base64.decode
 *
 * The original spec's for atob/btoa are a bit lacking
 * https://developer.mozilla.org/en/DOM/window.atob
 * https://developer.mozilla.org/en/DOM/window.btoa
 *
 * window.btoa and $.base64.encode takes a string where charCodeAt is [0,255]
 * If any character is not [0,255], then an exception is thrown.
 *
 * window.atob and $.base64.decode take a base64-encoded string
 * If the input length is not a multiple of 4, or contains invalid characters
 *   then an exception is thrown.
 */
 
jQuery.base64 = ( function( $ ) {
  
  var _PADCHAR = "=",
    _ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    _VERSION = "1.0";


  function _getbyte64( s, i ) {
    // This is oddly fast, except on Chrome/V8.
    // Minimal or no improvement in performance by using a
    // object with properties mapping chars to value (eg. 'A': 0)

    var idx = _ALPHA.indexOf( s.charAt( i ) );

    if ( idx === -1 ) {
      throw "Cannot decode base64";
    }

    return idx;
  }
  
  
  function _decode( s ) {
    var pads = 0,
      i,
      b10,
      imax = s.length,
      x = [];

    s = String( s );
    
    if ( imax === 0 ) {
      return s;
    }

    if ( imax % 4 !== 0 ) {
      throw "Cannot decode base64";
    }

    if ( s.charAt( imax - 1 ) === _PADCHAR ) {
      pads = 1;

      if ( s.charAt( imax - 2 ) === _PADCHAR ) {
        pads = 2;
      }

      // either way, we want to ignore this last block
      imax -= 4;
    }

    for ( i = 0; i < imax; i += 4 ) {
      b10 = ( _getbyte64( s, i ) << 18 ) | ( _getbyte64( s, i + 1 ) << 12 ) | ( _getbyte64( s, i + 2 ) << 6 ) | _getbyte64( s, i + 3 );
      x.push( String.fromCharCode( b10 >> 16, ( b10 >> 8 ) & 0xff, b10 & 0xff ) );
    }

    switch ( pads ) {
      case 1:
        b10 = ( _getbyte64( s, i ) << 18 ) | ( _getbyte64( s, i + 1 ) << 12 ) | ( _getbyte64( s, i + 2 ) << 6 );
        x.push( String.fromCharCode( b10 >> 16, ( b10 >> 8 ) & 0xff ) );
        break;

      case 2:
        b10 = ( _getbyte64( s, i ) << 18) | ( _getbyte64( s, i + 1 ) << 12 );
        x.push( String.fromCharCode( b10 >> 16 ) );
        break;
    }

    return x.join( "" );
  }
  
  
  function _getbyte( s, i ) {
    var x = s.charCodeAt( i );

    if ( x > 255 ) {
      throw "INVALID_CHARACTER_ERR: DOM Exception 5";
    }
    
    return x;
  }


  function _encode( s ) {
    if ( arguments.length !== 1 ) {
      throw "SyntaxError: exactly one argument required";
    }

    s = String( s );

    var i,
      b10,
      x = [],
      imax = s.length - s.length % 3;

    if ( s.length === 0 ) {
      return s;
    }

    for ( i = 0; i < imax; i += 3 ) {
      b10 = ( _getbyte( s, i ) << 16 ) | ( _getbyte( s, i + 1 ) << 8 ) | _getbyte( s, i + 2 );
      x.push( _ALPHA.charAt( b10 >> 18 ) );
      x.push( _ALPHA.charAt( ( b10 >> 12 ) & 0x3F ) );
      x.push( _ALPHA.charAt( ( b10 >> 6 ) & 0x3f ) );
      x.push( _ALPHA.charAt( b10 & 0x3f ) );
    }

    switch ( s.length - imax ) {
      case 1:
        b10 = _getbyte( s, i ) << 16;
        x.push( _ALPHA.charAt( b10 >> 18 ) + _ALPHA.charAt( ( b10 >> 12 ) & 0x3F ) + _PADCHAR + _PADCHAR );
        break;

      case 2:
        b10 = ( _getbyte( s, i ) << 16 ) | ( _getbyte( s, i + 1 ) << 8 );
        x.push( _ALPHA.charAt( b10 >> 18 ) + _ALPHA.charAt( ( b10 >> 12 ) & 0x3F ) + _ALPHA.charAt( ( b10 >> 6 ) & 0x3f ) + _PADCHAR );
        break;
    }

    return x.join( "" );
  }


  return {
    decode: _decode,
    encode: _encode,
    VERSION: _VERSION
  };
      
}( jQuery ) );




function sprintf( ) {
    // Return a formatted string  
    // 
    // version: 903.3016
    // discuss at: http://phpjs.org/functions/sprintf
    // +   original by: Ash Searle (http://hexmen.com/blog/)
    // + namespaced by: Michael White (http://getsprink.com)
    // +    tweaked by: Jack
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Paulo Ricardo F. Santos
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Brett Zamir (http://brettz9.blogspot.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: sprintf("%01.2f", 123.1);
    // *     returns 1: 123.10
    // *     example 2: sprintf("[%10s]", 'monkey');
    // *     returns 2: '[    monkey]'
    // *     example 3: sprintf("[%'#10s]", 'monkey');
    // *     returns 3: '[####monkey]'
    var regex = /%%|%(\d+\$)?([-+\'#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuidfegEG])/g;
    var a = arguments, i = 0, format = a[i++];

    // pad()
    var pad = function(str, len, chr, leftJustify) {
        if (!chr) chr = ' ';
        var padding = (str.length >= len) ? '' : Array(1 + len - str.length >>> 0).join(chr);
        return leftJustify ? str + padding : padding + str;
    };

    // justify()
    var justify = function(value, prefix, leftJustify, minWidth, zeroPad, customPadChar) {
        var diff = minWidth - value.length;
        if (diff > 0) {
            if (leftJustify || !zeroPad) {
                value = pad(value, minWidth, customPadChar, leftJustify);
            } else {
                value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
            }
        }
        return value;
    };

    // formatBaseX()
    var formatBaseX = function(value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
        // Note: casts negative numbers to positive ones
        var number = value >>> 0;
        prefix = prefix && number && {'2': '0b', '8': '0', '16': '0x'}[base] || '';
        value = prefix + pad(number.toString(base), precision || 0, '0', false);
        return justify(value, prefix, leftJustify, minWidth, zeroPad);
    };

    // formatString()
    var formatString = function(value, leftJustify, minWidth, precision, zeroPad, customPadChar) {
        if (precision != null) {
            value = value.slice(0, precision);
        }
        return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar);
    };

    // doFormat()
    var doFormat = function(substring, valueIndex, flags, minWidth, _, precision, type) {
        var number;
        var prefix;
        var method;
        var textTransform;
        var value;

        if (substring == '%%') return '%';

        // parse flags
        var leftJustify = false, positivePrefix = '', zeroPad = false, prefixBaseX = false, customPadChar = ' ';
        var flagsl = flags.length;
        for (var j = 0; flags && j < flagsl; j++) switch (flags.charAt(j)) {
            case ' ': positivePrefix = ' '; break;
            case '+': positivePrefix = '+'; break;
            case '-': leftJustify = true; break;
            case "'": customPadChar = flags.charAt(j+1); break;
            case '0': zeroPad = true; break;
            case '#': prefixBaseX = true; break;
        }

        // parameters may be null, undefined, empty-string or real valued
        // we want to ignore null, undefined and empty-string values
        if (!minWidth) {
            minWidth = 0;
        } else if (minWidth == '*') {
            minWidth = +a[i++];
        } else if (minWidth.charAt(0) == '*') {
            minWidth = +a[minWidth.slice(1, -1)];
        } else {
            minWidth = +minWidth;
        }

        // Note: undocumented perl feature:
        if (minWidth < 0) {
            minWidth = -minWidth;
            leftJustify = true;
        }

        if (!isFinite(minWidth)) {
            throw new Error('sprintf: (minimum-)width must be finite');
        }

        if (!precision) {
            precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type == 'd') ? 0 : void(0);
        } else if (precision == '*') {
            precision = +a[i++];
        } else if (precision.charAt(0) == '*') {
            precision = +a[precision.slice(1, -1)];
        } else {
            precision = +precision;
        }

        // grab value using valueIndex if required?
        value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];

        switch (type) {
            case 's': return formatString(String(value), leftJustify, minWidth, precision, zeroPad, customPadChar);
            case 'c': return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
            case 'b': return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'o': return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'x': return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'X': return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase();
            case 'u': return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'i':
            case 'd': {
                number = parseInt(+value);
                prefix = number < 0 ? '-' : positivePrefix;
                value = prefix + pad(String(Math.abs(number)), precision, '0', false);
                return justify(value, prefix, leftJustify, minWidth, zeroPad);
            }
            case 'e':
            case 'E':
            case 'f':
            case 'F':
            case 'g':
            case 'G': {
                number = +value;
                prefix = number < 0 ? '-' : positivePrefix;
                method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
                textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
                value = prefix + Math.abs(number)[method](precision);
                return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
            }
            default: return substring;
        }
    };

    return format.replace(regex, doFormat);
}

/**
 * jsPDF
 * (c) 2009 James Hall
 * 
 * Some parts based on FPDF.
 */
 var n;
 var p;
 var i;

var jsPDF = function(){
	
	// Private properties
	var version = '20090504';
	var buffer = '';
	
	var pdfVersion = '1.3'; // PDF Version
	var defaultPageFormat = 'a4';
	var pageFormats = { // Size in mm of various paper formats
		'a3': [841.89, 1190.55],
		'a4': [595.28, 841.89],
		'a5': [420.94, 595.28],
		'letter': [612, 792],
		'legal': [612, 1008]
	};
	var textColor = '0 g';
	var page = 0;
	var objectNumber = 2; // 'n' Current object number
	var state = 0; // Current document state
	var pages = new Array();
	var offsets = new Array(); // List of offsets
	var lineWidth = 0.200025; // 2mm
	var pageWidth;
	var pageHeight;
	var k; // Scale factor
	var unit = 'mm'; // Default to mm for units
	var fontNumber; // TODO: This is temp, replace with real font handling
	var documentProperties = {};
	var fontSize = 16; // Default font size
	var pageFontSize = 16;

	// Initilisation 
	if (unit == 'pt') {
		k = 1;
	} else if(unit == 'mm') {
		k = 72/25.4;
	} else if(unit == 'cm') {
		k = 72/2.54;
	} else if(unit == 'in') {
		k = 72;
	}
	
	// Private functions
	var newObject = function() {
		//Begin a new object
		objectNumber ++;
		offsets[objectNumber] = buffer.length;
		out(objectNumber + ' 0 obj');		
	}
	
	
	var putHeader = function() {
		out('%PDF-' + pdfVersion);
	}
	
	var putPages = function() {
		
		// TODO: Fix, hardcoded to a4 portrait
		var wPt = pageWidth * k;
		var hPt = pageHeight * k;

		for(n=1; n <= page; n++) {
			newObject();
			out('<</Type /Page');
			out('/Parent 1 0 R');	
			out('/Resources 2 0 R');
			out('/Contents ' + (objectNumber + 1) + ' 0 R>>');
			out('endobj');
			
			//Page content
			p = pages[n];
			newObject();
			out('<</Length ' + p.length  + '>>');
			putStream(p);
			out('endobj');					
		}
		offsets[1] = buffer.length;
		out('1 0 obj');
		out('<</Type /Pages');
		var kids='/Kids [';
		for (i = 0; i < page; i++) {
			kids += (3 + 2 * i) + ' 0 R ';
		}
		out(kids + ']');
		out('/Count ' + page);
		out(sprintf('/MediaBox [0 0 %.2f %.2f]', wPt, hPt));
		out('>>');
		out('endobj');		
	}
	
	var putStream = function(str) {
		out('stream');
		out(str);
		out('endstream');
	}
	
	var putResources = function() {
		putFonts();
		putImages();
		
		//Resource dictionary
		offsets[2] = buffer.length;
		out('2 0 obj');
		out('<<');
		putResourceDictionary();
		out('>>');
		out('endobj');
	}	
	
	var putFonts = function() {
		// TODO: Only supports core font hardcoded to Helvetica
		newObject();
		fontNumber = objectNumber;
		name = 'Helvetica';
		out('<</Type /Font');
		out('/BaseFont /' + name);
		out('/Subtype /Type1');
		out('/Encoding /WinAnsiEncoding');
		out('>>');
		out('endobj');
	}
	
	var putImages = function() {
		// TODO
	}
	
	var putResourceDictionary = function() {
		out('/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]');
		out('/Font <<');
		// Do this for each font, the '1' bit is the index of the font
        // fontNumber is currently the object number related to 'putFonts'
		out('/F1 ' + fontNumber + ' 0 R');
		out('>>');
		out('/XObject <<');
		putXobjectDict();
		out('>>');
	}
	
	var putXobjectDict = function() {
		// TODO
		// Loop through images
	}
	
	
	var putInfo = function() {
		out('/Producer (jsPDF ' + version + ')');
		if(documentProperties.title != undefined) {
			out('/Title (' + pdfEscape(documentProperties.title) + ')');
		}
		if(documentProperties.subject != undefined) {
			out('/Subject (' + pdfEscape(documentProperties.subject) + ')');
		}
		if(documentProperties.author != undefined) {
			out('/Author (' + pdfEscape(documentProperties.author) + ')');
		}
		if(documentProperties.keywords != undefined) {
			out('/Keywords (' + pdfEscape(documentProperties.keywords) + ')');
		}
		if(documentProperties.creator != undefined) {
			out('/Creator (' + pdfEscape(documentProperties.creator) + ')');
		}		
		var created = new Date();
		var year = created.getFullYear();
		var month = (created.getMonth() + 1);
		var day = created.getDate();
		var hour = created.getHours();
		var minute = created.getMinutes();
		var second = created.getSeconds();
		out('/CreationDate (D:' + sprintf('%02d%02d%02d%02d%02d%02d', year, month, day, hour, minute, second) + ')');
	}
	
	var putCatalog = function () {
		out('/Type /Catalog');
		out('/Pages 1 0 R');
		// TODO: Add zoom and layout modes
		out('/OpenAction [3 0 R /FitH null]');
		out('/PageLayout /OneColumn');
	}	
	
	function putTrailer() {
		out('/Size ' + (objectNumber + 1));
		out('/Root ' + objectNumber + ' 0 R');
		out('/Info ' + (objectNumber - 1) + ' 0 R');
	}	
	
	var endDocument = function() {
		state = 1;
		putHeader();
		putPages();
		
		putResources();
		//Info
		newObject();
		out('<<');
		putInfo();
		out('>>');
		out('endobj');
		
		//Catalog
		newObject();
		out('<<');
		putCatalog();
		out('>>');
		out('endobj');
		
		//Cross-ref
		var o = buffer.length;
		out('xref');
		out('0 ' + (objectNumber + 1));
		out('0000000000 65535 f ');
		for (var i=1; i <= objectNumber; i++) {
			out(sprintf('%010d 00000 n ', offsets[i]));
		}
		//Trailer
		out('trailer');
		out('<<');
		putTrailer();
		out('>>');
		out('startxref');
		out(o);
		out('%%EOF');
		state = 3;		
	}
	
	var beginPage = function() {
		page ++;
		// Do dimension stuff
		state = 2;
		pages[page] = '';
		
		// TODO: Hardcoded at A4 and portrait
		pageHeight = pageFormats['a4'][1] / k;
		pageWidth = pageFormats['a4'][0] / k;
	}
	
	var out = function(string) {
		if(state == 2) {
			pages[page] += string + '\n';
		} else {
			buffer += string + '\n';
		}
	}
	
	var _addPage = function() {
		beginPage();
		// Set line width
		out(sprintf('%.2f w', (lineWidth * k)));
		
		// Set font - TODO
		// 16 is the font size
		pageFontSize = fontSize;
		out('BT /F1 ' + parseInt(fontSize) + '.00 Tf ET'); 		
	}
	
	// Add the first page automatically
	_addPage();	

	// Escape text
	var pdfEscape = function(text) {
		return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
	}
	
	return {
		addPage: function() {
			_addPage();
		},
		text: function(x, y, text) {
			// need page height
			if(pageFontSize != fontSize) {
				out('BT /F1 ' + parseInt(fontSize) + '.00 Tf ET');
				pageFontSize = fontSize;
			}
			var str = sprintf('BT %.2f %.2f Td (%s) Tj ET', x * k, (pageHeight - y) * k, pdfEscape(text));
			out(str);
		},
		setProperties: function(properties) {
			documentProperties = properties;
		},
		addImage: function(imageData, format, x, y, w, h) {
		
		},
		output: function(type, options) {
			endDocument();
			if(type == undefined) {
				return buffer;
			}
			if(type == 'datauri') {
				document.location.href = 'data:application/pdf;base64,' + Base64.encode(buffer);
			}
			// @TODO: Add different output options
		},
		setFontSize: function(size) {
			fontSize = size;
		}
	}

};


/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/

var Base64 = {

	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

	// public method for encoding
	encode : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;

		input = Base64._utf8_encode(input);

		while (i < input.length) {

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
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

		}

		return output;
	},

	// public method for decoding
	decode : function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		while (i < input.length) {

			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));

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

		}

		output = Base64._utf8_decode(output);

		return output;

	},

	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	},

	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;

		while ( i < utftext.length ) {

			c = utftext.charCodeAt(i);

			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}

		}

		return string;
	}

}

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

  //TODO: we need to find a way to remove from root scope
  $rootScope.pdfExport = function(ignoreColumns){
    var cols = [];
    if(ignoreColumns != undefined && ignoreColumns.indexOf(',') != -1){
      cols = ignoreColumns.split(',');
    }
    if(ignoreColumns != undefined && ignoreColumns.indexOf(',') === -1){
      cols = [ignoreColumns];
    }

      $('.table').tableExport({type:'pdf',
          ignoreColumn: cols, 
          escape:'false',
          pdfFontSize:7,
          pdfLeftMargin:5
      });  
  }
  
  //TODO: we need to find a way to remove from root scope
  $rootScope.xlsExport = function(ignoreColumns){
       var cols = [];
      if(ignoreColumns != undefined && ignoreColumns.indexOf(',') != -1){
         cols = ignoreColumns.split(',');
      }
      if(ignoreColumns != undefined && ignoreColumns.indexOf(',') === -1){
        cols = [ignoreColumns];
      }

      $('.table').tableExport({type:'excel',
          ignoreColumn: cols, 
          escape:'false'
      });  
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