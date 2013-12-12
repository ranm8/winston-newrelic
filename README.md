# winston-newrelic

New Relic trasporter for [winston](https://github.com/flatiron/winston).
Logs winston caught exceptions and logs to New Relic.

## Installation

	$ npm install winston-newrelic

## Usage

```javascript
// Top of your boot file
require('newrelic');

var winston = require('winston'),
    WinstonNewrelic = require('winston-newrelic');

// Add newrelic logger as trasporter
winston.add(winston.transports.newrelic, {});
```


