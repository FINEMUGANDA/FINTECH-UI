'use strict';

var GraphUtils = angular.module('GraphUtils', ['googlechart']);

/** 
 * graph generator 
 */
GraphUtils.factory('Graph', function() {
  // initialize to whatever is in the cookie, if anything
  var activeBorrowers = function() {
    return {
      'cols': [
        {
          'id': 'name',
          'label': 'Name',
          'type': 'string'
        },
        {
          'id': 'borrowers',
          'label': 'Borrowers',
          'type': 'number'
        },
        {
          'id': 'barHeaders',
          'role': 'annotation',
          'type': 'string',
          'p': {
            'role': 'annotation',
            'html': true
          }
        }
      ],
      'rows': [
        {
          'c': [
            {
              'v': 'John S.'
            },
            {
              'v': 149
            },
            {
              'v': 149
            }
          ]
        },
        {
          'c': [
            {
              'v': 'Philip L.'
            },
            {
              'v': 255
            },
            {
              'v': 255
            }
          ]
        },
        {
          'c': [
            {
              'v': 'Philip R.'
            },
            {
              'v': 475
            },
            {
              'v': 475
            }
          ]
        },
        {
          'c': [
            {
              'v': 'John E.'
            },
            {
              'v': 201
            },
            {
              'v': 201
            }
          ]
        },
        {
          'c': [
            {
              'v': 'Vincent C.'
            },
            {
              'v': 290
            },
            {
              'v': 290
            }
          ]
        }
      ]
    };
  };

  var parPerLoan = function() {
    return {
      'cols': [
        {
          'id': 'name',
          'label': 'Name',
          'type': 'string'
        },
        {
          'id': 'borrowers',
          'label': 'Borrowers',
          'type': 'number'
        },
        {
          'id': 'barHeaders',
          'role': 'annotation',
          'type': 'string'
        }
      ],
      'rows': [
        {
          'c': [
            {
              'v': 'John S.'
            },
            {
              'v': 14
            },
            {
              'v': 14
            }
          ]
        },
        {
          'c': [
            {
              'v': 'Philip L.'
            },
            {
              'v': 4
            },
            {
              'v': 4
            }
          ]
        },
        {
          'c': [
            {
              'v': 'Philip R.'
            },
            {
              'v': 10
            },
            {
              'v': 10
            }
          ]
        },
        {
          'c': [
            {
              'v': 'John E.'
            },
            {
              'v': 17
            },
            {
              'v': 17
            }
          ]
        },
        {
          'c': [
            {
              'v': 'Vincent C.'
            },
            {
              'v': 5
            },
            {
              'v': 5
            }
          ]
        }
      ]
    };
  };

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
      ]
    };
  };

  return {
    getparPerLoanChart: function() {
      var data = parPerLoan();
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
      if (chartData === 'activeBorrowers') {
        data = activeBorrowers();
      } else if (chartData === 'changesInLoanPortfolio') {
        data = changesInLoanPortfolio();
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
            'maxValue': 25
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
    getPieChart: function() {
      return {
        'type': 'PieChart',
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
            }
          ],
          'rows': [
            {
              'c': [
                {
                  'v': 'Collected'
                },
                {
                  'v': 85
                }
              ]
            },
            {
              'c': [
                {
                  'v': 'Due'
                },
                {
                  'v': 15
                }
              ]
            }
          ]
        },
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
