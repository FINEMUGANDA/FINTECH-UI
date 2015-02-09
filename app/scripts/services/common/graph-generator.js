'use strict';

var GraphUtils = angular.module('GraphUtils', ['googlechart']);

/** 
 * graph generator 
 */
GraphUtils.factory('Graph', function() {
  // initialize to whatever is in the cookie, if anything
  var changesInLoanPortfolio = function() {
    return {
      'cols': [
        {
          'id': 'name',
          'label': 'Name',
          'type': 'string'
        },
        {
          'id': 'new',
          'label': 'New',
          'type': 'number'
        },
        {
          'id': 'roll-over',
          'label': 'Roll-over',
          'type': 'number'
        },
        {
          'id': 'repaid',
          'label': 'Repaid',
          'type': 'number'
        }
      ],
      'rows': [
        {
          'c': [
            {
              'v': 'John S.'
            },
            {
              'v': 26
            },
            {
              'v': 19
            },
            {
              'v': 12
            }
          ]
        },
        {
          'c': [
            {
              'v': 'Philip L.'
            },
            {
              'v': 37
            },
            {
              'v': 13
            },
            {
              'v': 9
            }
          ]
        },
        {
          'c': [
            {
              'v': 'Philip R.'
            },
            {
              'v': 22
            },
            {
              'v': 29
            },
            {
              'v': 18
            }
          ]
        },
        {
          'c': [
            {
              'v': 'John E.'
            },
            {
              'v': 15
            },
            {
              'v': 7
            },
            {
              'v': 4
            }
          ]
        },
        {
          'c': [
            {
              'v': 'Vincent C.'
            },
            {
              'v': 40
            },
            {
              'v': 25
            },
            {
              'v': 12
            }
          ]
        }
      ],
      maxValue: 25
    };
  };

  return {
    getparPerLoanChart: function(data) {
      return {
        'type': 'ColumnChart',
        'cssStyle': 'height:180px; width:100%;',
        'data': data,
        'options': {
          'colors': ['#88cac6', '#e28b00', '#449acc'],
          'isStacked': 'false',
          'fill': 20,
          'displayExactValues': true,
          'legend': {
            'position': 'none'
          },
          'vAxis': {
            'gridlines': {
              'count': 5
            },
            'minValue': 0
          },
          'hAxis': {
          }
        },
        'formatters': {
        },
        'displayed': true
      };
    },
    getColumnChart: function(chartData) {
      var data;
      if (chartData === 'changesInLoanPortfolio') {
        data = changesInLoanPortfolio();
      } else {
        data = chartData;
      }

      return {
        'type': 'ColumnChart',
        'cssStyle': 'height:180px; width:100%;',
        'data': data,
        'options': {
          'colors': ['#88cac6', '#e28b00', '#449acc'],
          'isStacked': 'false',
          'fill': 20,
          'displayExactValues': true,
          'legend': {
            'position': 'none'
          },
          'vAxis': {
            'gridlines': {
              'count': 6
            },
            'minValue': 0,
            'maxValue': data.maxValue
          },
          'hAxis': {
          }
        },
        'formatters': {
        },
        'displayed': true
      };
    },
    getBarChart: function() {
      return {
        'type': 'BarChart',
        'cssStyle': 'height:180px; width:100%;',
        'data': {
          'cols': [
            {
              'id': 'month',
              'label': 'Month',
              'type': 'string',
              'p': {}
            },
            {
              'id': 'laptop-id',
              'label': 'Laptop',
              'type': 'number',
              'p': {}
            },
            {
              'id': 'desktop-id',
              'label': 'Desktop',
              'type': 'number',
              'p': {}
            },
            {
              'id': 'server-id',
              'label': 'Server',
              'type': 'number',
              'p': {}
            },
            {
              'id': 'cost-id',
              'label': 'Shipping',
              'type': 'number'
            }
          ],
          'rows': [
            {
              'c': [
                {
                  'v': 'January'
                },
                {
                  'v': 19,
                  'f': '42 items'
                },
                {
                  'v': 12,
                  'f': 'Ony 12 items'
                },
                {
                  'v': 7,
                  'f': '7 servers'
                },
                {
                  'v': 4
                }
              ]
            },
            {
              'c': [
                {
                  'v': 'February'
                },
                {
                  'v': 13
                },
                {
                  'v': 1,
                  'f': '1 unit (Out of stock this month)'
                },
                {
                  'v': 12
                },
                {
                  'v': 2
                }
              ]
            },
            {
              'c': [
                {
                  'v': 'March'
                },
                {
                  'v': 24
                },
                {
                  'v': 0
                },
                {
                  'v': 11
                },
                {
                  'v': 6
                }
              ]
            }
          ]
        },
        'options': {
          'title': 'Sales per month',
          'isStacked': 'true',
          'fill': 20,
          'displayExactValues': true,
          'vAxis': {
            'title': 'Sales unit',
            'gridlines': {
              'count': 6
            }
          },
          'hAxis': {
            'title': 'Date'
          }
        },
        'formatters': {},
        'displayed': true
      };
    },
    getLineChart: function() {
      return {
        'type': 'LineChart',
        'cssStyle': 'height:180px; width:100%;',
        'data': {
          'cols': [
            {
              'id': 'month',
              'label': 'Month',
              'type': 'string',
              'p': {}
            },
            {
              'id': 'laptop-id',
              'label': 'Laptop',
              'type': 'number',
              'p': {}
            },
            {
              'id': 'desktop-id',
              'label': 'Desktop',
              'type': 'number',
              'p': {}
            },
            {
              'id': 'server-id',
              'label': 'Server',
              'type': 'number',
              'p': {}
            },
            {
              'id': 'cost-id',
              'label': 'Shipping',
              'type': 'number'
            }
          ],
          'rows': [
            {
              'c': [
                {
                  'v': 'January'
                },
                {
                  'v': 19,
                  'f': '42 items'
                },
                {
                  'v': 12,
                  'f': 'Ony 12 items'
                },
                {
                  'v': 7,
                  'f': '7 servers'
                },
                {
                  'v': 4
                }
              ]
            },
            {
              'c': [
                {
                  'v': 'February'
                },
                {
                  'v': 13
                },
                {
                  'v': 1,
                  'f': '1 unit (Out of stock this month)'
                },
                {
                  'v': 12
                },
                {
                  'v': 2
                }
              ]
            },
            {
              'c': [
                {
                  'v': 'March'
                },
                {
                  'v': 24
                },
                {
                  'v': 0
                },
                {
                  'v': 11
                },
                {
                  'v': 6
                }
              ]
            }
          ]
        },
        'options': {
          'title': 'Sales per month',
          'isStacked': 'true',
          'fill': 20,
          'displayExactValues': true,
          'vAxis': {
            'title': 'Sales unit',
            'gridlines': {
              'count': 6
            }
          },
          'hAxis': {
            'title': 'Date'
          }
        },
        'formatters': {},
        'displayed': true
      };
    },
    getPieChart: function(data) {
      return {
        'type': 'PieChart',
        'cssStyle': 'height:180px; width:100%;',
        'data': data,
        'options': {
          'colors': ['#88cac6', '#e28b00'],
          'pieHole': 0.4,
          'isStacked': 'true',
          'fill': 20,
          'displayExactValues': true,
          'vAxis': {
            'title': 'Sales unit',
            'gridlines': {
              'count': 6
            }
          },
          'hAxis': {
            'title': 'Date'
          }
        },
        'formatters': {},
        'displayed': true
      };
    }
  };
});
