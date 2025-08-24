module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        // Jasmine options if you need them
      },
      clearContext: false // keeps Jasmine Spec Runner output off (no browser UI anyway)
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/doont'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }]
    },
    reporters: ['progress'],            // no 'kjhtml' reporter in headless mode
    browsers: ['ChromeHeadless'],       // headless Chrome
    singleRun: true,                    // run once then exit
    autoWatch: false,                   // don't watch files
    restartOnFileChange: false,         // no restarts
    logLevel: config.LOG_WARN
  });
};
