'use strict';

var mocha = require('mocha'),
    sinon = require('sinon'),
    expect = require('chai').expect,
    rewire = require('rewire'),
    WinstonNewrelic = rewire('../lib/winston-newrelic');

describe('winston-newrelic', function() {

    /**
     * Mocks winston
     * @type {{Transport: {}, transports: {}}}
     */
    var winstonMock,

        /**
         * Mocks new relic object by stubbing the noticeError API method
         */
            newrelicMock,

        /**
         * The instance to test
         */
            instance;

    beforeEach(function() {
        winstonMock = {
            Transport: {},
            transports: {}
        };

        newrelicMock = {
            noticeError: sinon.stub()
        };

        WinstonNewrelic.__set__('winston', winstonMock);
    });

    describe('#constructor', function() {
        var origGetNr;
        beforeEach(function () {
            origGetNr = WinstonNewrelic.prototype.getNewRelic;
            WinstonNewrelic.prototype.getNewRelic = sinon.stub().returns(newrelicMock);
        });

        afterEach(function () {
            WinstonNewrelic.prototype.getNewRelic = origGetNr;
        });

        it('should set the object name to `winston-newrelic`', function() {
            var instance = new WinstonNewrelic();
            expect(instance.name).to.equal('winston-newrelic');
        });

        it('should set the level to default of `error` in case none was set', function() {
            var instance = new WinstonNewrelic();
            expect(instance.level).to.equal('error');
        });

        it('should set the level according to options if given', function() {
            var instance = new WinstonNewrelic({level: 'info'});
            expect(instance.level).to.equal('info');
        });

        it('should require newRelic if mock not provided', function() {
            var instance = new WinstonNewrelic({level: 'info'});
            expect(instance.getNewRelic.called).to.equal(true);
            expect(instance.newrelic).to.equal(newrelicMock);
        });

        it('should use newRelic object if provided', function() {
            var nr = { my: 'fakeNewrelic' };
            var instance = new WinstonNewrelic({newrelic: nr});
            expect(instance.getNewRelic.called).to.equal(false);
            expect(instance.newrelic).to.equal(nr);
        });
    });

    var msg = 'just another error';
    describe('instance', function () {

        var instance;
        beforeEach(function() {
            // Instantiate
            instance = new WinstonNewrelic({
                level: 'info',
                newrelic: newrelicMock
            });
        });

        describe('#log()', function() {

            beforeEach(function() {
                // Instantiate
                instance = new WinstonNewrelic({
                    level: 'info',
                    newrelic: newrelicMock
                });
            });


            it('should log the log message to newrelic', function() {
                instance.log('error', msg, {}, function(){});
                expect(newrelicMock.noticeError.called).to.equal(true);
            });

            it('should format the message prior to calling newRelic', function() {
                var level = 'error',
                    meta = { custom1: 'value1', custom2: 'value2' },
                    formatted = {
                        message: { message: msg, stack: (new Error()).stack },
                        customParameters: meta
                    };
                instance.formatMessage = sinon.stub().returns(formatted);
                instance.log(level, msg, meta, sinon.stub());
                expect(instance.formatMessage.calledWith(level, msg, meta)).to.equal(true);
                expect(newrelicMock.noticeError.calledWith(formatted.message, formatted.customParameters)).to.equal(true);
            });

            it('should call the callback with null and true for success', function() {
                var callback = sinon.stub();

                instance.log('error', msg, {}, callback);

                expect(callback.calledWith(null, true)).to.equal(true);
            });

            it('should allow meta to be optional', function() {
                var cb = sinon.stub();
                instance.log('error', msg, cb);
                expect(newrelicMock.noticeError.called).to.equal(true);
                expect(cb.called).to.equal(true);
            });

            it('should allow meta and callback to be optional', function() {
                var cb = sinon.stub();
                instance.log('error', msg);
                expect(newrelicMock.noticeError.called).to.equal(true);
            });
        });

        describe('#formatMessage()', function() {
            it('should log message with level and stack', function() {
                var level = 'warn',
                    formatted = instance.formatMessage(level, msg);
                expect(formatted.message).to.be.ok;
                expect(formatted.message.message).to.equal(msg);
                expect(formatted.message.stack).to.be.ok;
                expect(formatted.customParameters).to.be.ok;
                expect(formatted.customParameters.logLevel).to.equal(level);
            });

            it('should log Error with level and stack', function() {
                var level = 'warn',
                    errMsg = new Error(msg),
                    formatted = instance.formatMessage(level, errMsg);
                expect(formatted.message).to.be.ok;
                expect(formatted.message.message).to.equal(errMsg.message);
                expect(formatted.message.stack).to.equal(errMsg.stack);
                expect(formatted.customParameters).to.be.ok;
                expect(formatted.customParameters.logLevel).to.equal(level);
            });

            it('should log message with stack provided in meta', function() {
                var level = 'warn',
                    stack = new Error(msg).stack,
                    meta = {
                        stack: stack
                    },
                    formatted = instance.formatMessage(level, msg, meta);
                expect(formatted.message).to.be.ok;
                expect(formatted.message.message).to.equal(msg);
                expect(formatted.message.stack).to.equal(meta.stack);
                expect(formatted.customParameters).to.be.ok;
                expect(formatted.customParameters.logLevel).to.equal(level);
                expect(formatted.customParameters.stack).to.not.be.ok;
            });

            it('should log message with stack from error provided in meta', function() {
                var level = 'warn',
                    meta = {
                        error: new Error(msg)
                    },
                    formatted = instance.formatMessage(level, msg, meta);
                expect(formatted.message).to.be.ok
                expect(formatted.message.message).to.equal(msg);
                expect(formatted.message.stack).to.equal(meta.error.stack);
                expect(formatted.customParameters).to.be.ok;
                expect(formatted.customParameters.logLevel).to.equal(level);
                expect(typeof formatted.customParameters.error).to.equal('string')
            });

            it('should pass on meta properties as custom parameters', function() {
                var level = 'warn',
                    meta = {
                        string: "value",
                        number: 12345,
                        obj: { prop: "val" },
                        func: function someFn() { },
                        anonymousFunc: function () { }
                    },
                    formatted = instance.formatMessage(level, msg, meta);
                expect(formatted.message).to.be.ok;
                expect(formatted.message.message).to.equal(msg);
                expect(formatted.message.stack).to.be.ok;
                expect(formatted.customParameters).to.be.ok;
                expect(formatted.customParameters.logLevel).to.equal(level);
                expect(formatted.customParameters.string).to.equal(meta.string);
                expect(formatted.customParameters.number).to.equal(meta.number);
                expect(formatted.customParameters.obj).to.equal(JSON.stringify(meta.obj));
                expect(formatted.customParameters.func).to.equal("[Function: someFn]");
                expect(formatted.customParameters.anonymousFunc).to.equal("[Function: <anonymous>]");
            });

        });

        describe('#getNewRelic()', function() {
            it ('should return newrelic instance', function () {
                var nr = instance.getNewRelic();
                expect(nr).to.equal(instance.newrelic);
            });
        });
    });
});

