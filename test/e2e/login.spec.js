'use strict';

var LoginPage = require('./login.page.js');

describe('Finem Login', function() {

  var loginPage = new LoginPage();

  it('should go to the dashboard after successful login', function() {
    //loginPage.defaultLogin();
    //expect(browser.getLocationAbsUrl()).toMatch('/dashboard');
  });

});
