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

        // Instantiate
        instance = new WinstonNewrelic({
            level: 'info',
            newrelic: newrelicMock
        });
    });

    describe('#constructor', function() {
        it('should set the object name to `winston-newrelic`', function() {
            expect(instance.name).to.equal('winston-newrelic');
        });

        it('should set the level to default of `error` in case none was set', function() {
            instance = new WinstonNewrelic({
                newrelic: newrelicMock
            });

            expect(instance.level).to.equal('error');
        });

        it('should set the level according to options if given', function() {
            expect(instance.level).to.equal('info');
        });
    });

    describe('#log()', function() {
        var msg = 'just another error';

        it('logs a string message to newrelic as is', function() {
            instance.log('error', msg, {}, function(){});

            expect(newrelicMock.noticeError.calledWith(msg)).to.equal(true);
        });

        it('calls the callback with null and true for success', function() {
            var callback = sinon.stub();

            instance.log('error', msg, {}, callback);

            expect(callback.calledWith(null, true)).to.equal(true);
        });

        it('logs a error-ish object when meta contains a stack', function(){
            instance.log('error', msg, {stack: ['stack']}, function(){});

            expect(newrelicMock.noticeError.calledWith({
                message: msg,
                stack: ['stack']
            })).to.equal(true);
        });

        it('does not ovveride message when meta meta contains a message', function(){
            instance.log('error', msg, {stack: ['stack'], message: 'm'}, function(){});

            expect(newrelicMock.noticeError.calledWith({
                message: 'm',
                stack: ['stack']
            })).to.equal(true);
        });
        it('passes on the meta object as is', function(){
            var meta = {stack: ['stack'], message: 'm', line: 10, col: 20};
            instance.log('error', msg, meta, function(){});

            expect(newrelicMock.noticeError.calledWith({
                message: 'm',
                stack: ['stack']
            }, meta)).to.equal(true);
        });
    });
});

