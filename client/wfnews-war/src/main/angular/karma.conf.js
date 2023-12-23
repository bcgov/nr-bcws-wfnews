// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

var puppeteer = require("puppeteer");
process.env.CHROME_BIN = puppeteer.executablePath();

module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine", "@angular-devkit/build-angular", "viewport"],
    plugins: [
      require("karma-jasmine"),
      // require('karma-chrome-launcher'),
      // require('karma-safari-launcher'),
      require("karma-jasmine-html-reporter"),
      require("karma-coverage-istanbul-reporter"),
      require("@angular-devkit/build-angular/plugins/karma"),
      require("karma-viewport"),
      // require('karma-mocha-reporter')
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require("path").join(__dirname, "../coverage"),
      reports: ["html", "lcovonly"],
      fixWebpackSourcePaths: true,
    },
    reporters: ["progress", "kjhtml", "coverage-istanbul"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    // browsers: ['ChromeHeadlessCustom'],
    // customLaunchers: {
    //   ChromeHeadlessCustom: {
    //     base: 'ChromeHeadless',
    //     flags: [
    //       '--no-sandbox',
    //       '--headless',
    //       '--disable-web-security',
    //       '--disable-setuid-sandbox',
    //       '--disable-gpu',
    //       '--disable-translate',
    //       '--disable-extensions',
    //       "--no-proxy-server",
    //       "--enable-logging"
    //     ]
    //   }
    // },
    // Viewport configuration
    viewport: {
      breakpoints: [
        {
          name: "mobile-galaxy_s5",
          size: {
            width: 360,
            height: 640,
          },
        },
        {
          name: "mobile-galaxy_s7",
          size: {
            width: 414,
            height: 732,
          },
        },
        {
          name: "mobile-galaxy_s7_edge",
          size: {
            width: 360,
            height: 640,
          },
        },
        {
          name: "mobile-pixel_2",
          size: {
            width: 411,
            height: 731,
          },
        },
        {
          name: "mobile-pixel_2_xl",
          size: {
            width: 411,
            height: 823,
          },
        },
        {
          name: "mobile-iphone_5_5s_5c_se",
          size: {
            width: 320,
            height: 568,
          },
        },
        {
          name: "mobile-iphone_6_6s_7_8",
          size: {
            width: 375,
            height: 667,
          },
        },
        {
          name: "mobile-iphone_6_6s_7_8_plus",
          size: {
            width: 414,
            height: 736,
          },
        },
        {
          name: "mobile-iphone_x_xs",
          size: {
            width: 375,
            height: 812,
          },
        },
        {
          name: "tablet-ipad_9.7_2018",
          size: {
            width: 768,
            height: 1024,
          },
        },
        {
          name: "tablet-ipad_pro",
          size: {
            width: 1024,
            height: 1366,
          },
        },
        {
          name: "desktop-screen",
          size: {
            width: 1440,
            height: 900,
          },
        },
      ],
    },
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 60000,
    captureTimeout: 60000,
    singleRun: true,
  });
};
