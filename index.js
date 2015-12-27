var AWS     = require('aws-sdk');
var Promise = require('bluebird');
var extend  = require('extend');
var debug   = require('debug')('region-bucket');

function errHandler(err) {
  debug(err);
  return Promise.reject(err);
}

function createS3(region, bucket) {
  return Promise.promisifyAll(
    new AWS.S3({
      region: region,
      params: { Bucket: bucket }
    })
  );
}

module.exports = function(region, bucket, params) {
  if(!params) { params = {}; }

  function createHandler(err) {
    debug(err);

    var createParams = {
      CreateBucketConfiguration: {
        LocationConstraint: region
      }
    };
    extend(true, createParams, params);

    var regionS3 = createS3(region, bucket);

    debug('creating bucket', createParams);
    return regionS3.createBucketAsync(createParams).thenReturn(regionS3);
  }

  var create = params.create;
  delete params.create;

  var s3 = createS3('us-east-1', bucket);

  var promise = s3.getBucketLocationAsync().then(function(response) {
    return createS3(response.LocationConstraint, bucket);
  });

  if (create) { promise = promise.catch(createHandler); }
  return promise.catch(errHandler);
};
