// For reference see https://github.com/angular/protractor/blob/master/docs/referenceConf.js

exports.config = {
    // -- How to connect to Browser Drivers --
    // For simplicity sake direct connection to browser is used.
    // NOTE: Only Chrome or Firefox support such connection.
    directConnect: true,

    // -- What tests to run --
    // For simplicity assume any JS in 'e2e' directory is a test
    // NOTE: Use 'suites' instead of specs to group tests
    specs: [
        'e2e/*.spec.js'
    ],

    // -- How to set up browsers --
    // TODO: Use 'capabilities' to configure browser

    // -- Global test information --
    baseUrl: 'http://0.0.0.0:9999',
    // Can be accessed from test as 'browser.params'. This can be changed via the command line as:
    //   --params.login.user 'Joe'
    params: {
        login: {
            username: 'mifos',
            password: 'password'
        }
    },

    // -- Test framework --
    framework: 'jasmine'
};

// Required by Snap CI. Refer to https://docs.snap-ci.com/the-ci-environment/testing-with-browsers/
if (process.env.SNAP_CI) {
    exports.config.chromeDriver = '/usr/local/bin/chromedriver';
}
