/* global moment */

'use strict';

var utils = angular.module('Utils', []);

/** 
 * Authentication 
 */
utils.factory('Auth', function(Base64) {
  // initialize to whatever is in the cookie, if anything
  return {
    setCredentials: function(username, password) {
      var encoded = Base64.encode(username + ':' + password);
      console.log('Auth:setCredentials:encoded', encoded);
      //$http.defaults.headers.common.Authorization = 'Basic ' + encoded;
    }
  };
});

/**
 * General utility
 */
utils.factory('Utility', function($q, APPLICATION) {
  // initialize to whatever is in the cookie, if anything
  return {
    isUndefinedOrNull: function(obj) {
      return !angular.isDefined(obj) || obj === null || obj === '';
    },
    getImage: function(src) {
      var deferred = $q.defer();

      var image = new Image();
      image.onerror = function() {
        deferred.resolve(APPLICATION.NO_IMAGE_THUMB);
      };
      image.onload = function() {
        deferred.resolve(src);
      };
      image.src = src;

      return deferred.promise;
    },
    filterOptions: function(options, optionID, selectedOptions) {
      var filteredOptions = [];
      var flag = true;
      angular.forEach(options, function(item) {
        flag = true;
        for (var i in selectedOptions) {
          if (parseInt(item.id) === parseInt(selectedOptions[i].id)) {
            flag = false;
          }
        }
        if (!flag && optionID) {
          flag = (parseInt(item.id) === parseInt(optionID));
        }
        if (flag) {
          filteredOptions.push(item);
        }
      });
      return filteredOptions;
    },
    setSelectedOptions: function(selectedOptions, assetID) {
      if (assetID) {
        var temp = '';
        temp = {
          id: assetID
        };
        selectedOptions.push(temp);
      }
    },
    dataFormat: function(date) {
      var days = date.getDate()<10 ? '0' + date.getDate() : date.getDate();
      var month = (date.getMonth() + 1)<10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
      date = days + '/' + month + '/' + date.getFullYear();
      return date;
    },
    toLocalDate: function(date, noTimezone) {
      // TODO: additional checks to ensure it's an array
      if(date) {
        var d = angular.copy(date);
        console.log('DEBUG U: ' + angular.toJson(date) + ' - ' + angular.toJson(d));
        d[1] = d[1]-1;

        if(!noTimezone) {
          return moment(d).format(APPLICATION.DF_MOMENT);
        } else {
          return moment.tz(d, APPLICATION.TIMEZONE).format(APPLICATION.DF_MOMENT);
        }
      } else {
        return date;
      }
    },
    toServerDate: function(date, noTimezone) {
      console.log('DEBUG U: ' + angular.toJson(date) + ' - ' + (typeof date));

      if(typeof date === 'string') {
        date = moment(date, APPLICATION.DF_MOMENT).toDate();
      }

      if(!noTimezone) {
        var now = new Date();

        // NOTE: this is necessary, otherwise midnight is assumed and we get completely wrong stuff
        date.setHours(now.getHours());
        date.setMinutes(now.getMinutes());
      }

      var result = moment(date);

      if(!noTimezone) {
          result = result.tz(APPLICATION.TIMEZONE);
      }

      return result.format(APPLICATION.DF_MOMENT);
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
    encode: function(input) {
      var output = '';
      var chr1, chr2, chr3 = '';
      var enc1, enc2, enc3, enc4 = '';
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
        chr1 = chr2 = chr3 = '';
        enc1 = enc2 = enc3 = enc4 = '';
      } while (i < input.length);

      return output;
    },
    decode: function(input) {
      var output = '';
      var chr1, chr2, chr3 = '';
      var enc1, enc2, enc3, enc4 = '';
      var i = 0;

      // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
      var base64test = /[^A-Za-z0-9\+\/\=]/g;
      if (base64test.exec(input)) {
        console.error('There were invalid base64 characters in the input text.\n' +
          'Valid base64 characters are A-Z, a-z, 0-9, "+", "/",and "="\n' +
          'Expect errors in decoding.');
      }
      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

      do {
        enc1 = keyStr.indexOf(input.charAt(i++));
        enc2 = keyStr.indexOf(input.charAt(i++));
        enc3 = keyStr.indexOf(input.charAt(i++));
        enc4 = keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 !== 64) {
          output = output + String.fromCharCode(chr2);
        }
        if (enc4 !== 64) {
          output = output + String.fromCharCode(chr3);
        }

        chr1 = chr2 = chr3 = '';
        enc1 = enc2 = enc3 = enc4 = '';

      } while (i < input.length);

      return output;
    }
  };
});


utils.filter('DateFormat', ['dateFilter', function(dateFilter) {
    return function(input, format) {
      format = format || 'dd MMM yyyy';
      if (input) {
        var tDate = new Date(input);
        return dateFilter(tDate, format);
      }
      return '';
    };
  }
]);

utils.filter('YesOrNo', function() {
  return function(input) {
    return input? 'Yes' : 'No';
  };
});

