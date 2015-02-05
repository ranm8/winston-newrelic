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

# Using custom newrelic module

``javascript
winston.add(winston.transports.newrelic, {newrelic: require('/path/to/your/newrelic')});
``
