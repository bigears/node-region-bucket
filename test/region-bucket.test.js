var expect = require('unexpected').clone();
expect.installPlugin(require('unexpected-sinon'));
var rewire = require('rewire');

var regionBucket = rewire('../');

var S3 = function(options) {
  this.options = options;
  this.region = options.region;
};
S3.prototype.getBucketLocation = function(cb) { 
  cb(null, {
    LocationConstraint: 'eu-west-1'
  });
};
S3.prototype.createBucket = function(options, cb) { cb(); };

var AWS = {
  S3: S3
};

regionBucket.__set__('AWS', AWS);

describe('region-bucket', function() {
  beforeEach(function() {
    AWS.S3 = S3;
  });

  it('exports a function', function() {
    expect(regionBucket, 'to be a function');
  });

  it('returns a promise', function() {
    var bucket = regionBucket('us-east-1', 'my-bucket');
    expect(bucket.then, 'to be a function');
  });

  context('bucket exists', function() {
    var then;

    beforeEach(function() {
      var promise = regionBucket('us-east-1', 'my-bucket');
      then = promise.then.bind(promise);
    });

    it('resolves as an S3 object with the correct region set', function() {
      return then(function(bucket) {
        expect(bucket.region, 'to equal', 'eu-west-1');
      });
    });

    it('resolves a version of S3 that has promise functions', function() {
      return then(function(bucket) {
        expect(bucket.createBucketAsync, 'to be a function');
      });
    });
  });
});
