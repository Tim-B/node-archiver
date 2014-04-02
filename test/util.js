/*global describe,it */
var fs = require('fs');
var assert = require('chai').assert;

var common = require('./helpers/common');
var adjustDateByOffset = common.adjustDateByOffset;
var binaryBuffer = common.binaryBuffer;
var BinaryStream = common.BinaryStream;
var DeadEndStream = common.DeadEndStream;

var ChecksumStream = require('../lib/util/ChecksumStream');
var utils = require('../lib/util');

var testBuffer = binaryBuffer(20000);

var testDate = new Date('Jan 03 2013 14:26:38 GMT');
var testDateEpoch = 1357223198;
var testDateOctal = 12071312436;

var testTimezoneOffset = testDate.getTimezoneOffset();

describe('utils', function() {

  describe('ChecksumStream', function() {
    it('should checksum data while transforming data', function(done) {
      var binary = new BinaryStream(20000);
      var checksum = new ChecksumStream();
      var deadend = new DeadEndStream();

      checksum.on('end', function() {
        assert.equal(checksum.digest, 4024292205);

        done();
      });

      checksum.pipe(deadend);
      binary.pipe(checksum);
    });

    it('should calculate data size while transforming data', function(done) {
      var binary = new BinaryStream(20000);
      var checksum = new ChecksumStream();
      var deadend = new DeadEndStream();

      checksum.on('end', function() {
        assert.equal(checksum.rawSize, 20000);

        done();
      });

      checksum.pipe(deadend);
      binary.pipe(checksum);
    });
  });

  describe('index', function() {

    describe('cleanBuffer(size)', function() {
      var actual = utils.cleanBuffer(5);

      it('should return an instance of Buffer', function() {
        assert.instanceOf(actual, Buffer);
      });

      it('should have a length of size', function() {
        assert.lengthOf(actual, 5);
      });

      it('should be filled with zeros', function() {
        var actualArray = [];

        for (var i = 0; i < actual.length ; i++) {
          actualArray.push(actual[i]);
        }

        assert.deepEqual(actualArray, [0, 0, 0, 0, 0]);
      });
    });

    describe('dateify(dateish)', function() {
      it('should return an instance of Date', function() {
        assert.instanceOf(utils.dateify(testDate), Date);
        assert.instanceOf(utils.dateify('Jan 03 2013 14:26:38 GMT'), Date);
        assert.instanceOf(utils.dateify(null), Date);
      });

      it('should passthrough an instance of Date', function() {
        assert.deepEqual(utils.dateify(testDate), testDate);
      });

      it('should convert dateish string to an instance of Date', function() {
        assert.deepEqual(utils.dateify('Jan 03 2013 14:26:38 GMT'), testDate);
      });
    });

    describe('defaults(object, source, guard)', function() {
      it('should default when object key is missing', function() {
        var actual = utils.defaults({ value1: true }, {
          value2: true
        });

        assert.deepEqual(actual, {
          value1: true,
          value2: true
        });
      });
    });

    describe('isStream(source)', function() {
      it('should return true if source is a stream', function() {
        assert.ok(utils.isStream(new DeadEndStream()));
      });
    });

    describe('padNumber(number, bytes, base)', function() {
      it('should pad number to specified bytes', function() {
        assert.equal(utils.padNumber(0, 7), '0000000');
      });
    });

    describe('repeat(pattern, count)', function() {
      it('should repeat pattern by count', function() {
        assert.equal(utils.repeat('x', 4), 'xxxx');
      });
    });

    describe('sanitizePath(filepath)', function() {
      it('should sanitize filepath', function() {
        assert.equal(utils.sanitizePath('\\this/path//file.txt'), 'this/path/file.txt');
        assert.equal(utils.sanitizePath('/this/path/file.txt'), 'this/path/file.txt');
        assert.equal(utils.sanitizePath('c:\\this\\path\\file.txt'), 'c/this/path/file.txt');
      });
    });

    describe('trailingSlashIt(str)', function() {
      it('should add trailing slash when missing', function() {
        assert.equal(utils.trailingSlashIt('this/path'), 'this/path/');
        assert.equal(utils.trailingSlashIt('this/path/'), 'this/path/');
      });
    });

    describe('unixifyPath(filepath)', function() {
      it('should unixify filepath', function() {
        assert.equal(utils.unixifyPath('this\\path\\file.txt'), 'this/path/file.txt');
      });
    });

  });

});