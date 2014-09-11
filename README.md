# winston-newrelic [![Build Status](https://secure.travis-ci.org/ranm8/winston-newrelic.png?branch=master)](http://travis-ci.org/ranm8/winston-newrelic)

New Relic trasporter for [winston](https://github.com/flatiron/winston).
Logs winston caught exceptions and logs to New Relic.

## Installation

	npm install winston-newrelic

## Usage

```javascript
// Top of your boot file
require('newrelic');

var winston = require('winston'),
    WinstonNewrelic = require('winston-newrelic');

// Add newrelic logger as trasporter
winston.add(winston.transports.newrelic, {});
```

## Error logging support

It is now possible to log errors by sending them as the meta-object to the
logger.

```javascript
winston.log('error', 'message', new Error(message));

// An errorish is any object with a stack property
var errorish = { stack: 'stacktrace'};
winston.log('error', 'message', errorish);
// Will log {message: 'message', stack: 'stacktrace'}

var errorish = { stack: 'stacktrace', message: 'error-message'};
winston.log('error', 'message', errorish);
// Will log {message: 'error-message', stack: 'stacktrace'}
// meta.message overrides message param
```

