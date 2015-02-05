'use strict';

var winston = require('winston'),
    util = require('util');

/**
 * The winston-newrelic transporter constructor
 * @constructor
 * @type {Function}
 */
var WinstonNewrelic = module.exports = function(options) {
    /**
     * Winston Trasporter Name
     * @type {string}
     */
    this.name = 'winston-newrelic';

    /**
     * Default logging level is error
     * @type {string}
     */
    this.level = options.level || 'error';

    /**
     * Take the injected instance or require it globally
     * @type {object}
     */
    this.newrelic = options.newrelic || require('newrelic');
};

/**
 * Inherit winston.Transport
 */
util.inherits(WinstonNewrelic, winston.Transport);

/**
 * Transporter getter for backward compatibility
 */
winston.transports.newrelic = WinstonNewrelic;

/**
 * Dispatched on each log, stores only errors to new-relic
 * @param {string} level
 * @param {string} msg
 * @param {object} meta
 * @param {function} callback
 */
WinstonNewrelic.prototype.log = function(level, msg, meta, callback) {
    if (level === 'error') {
        this.newrelic.noticeError(msg, meta);
    }

    callback(null, true);
};
