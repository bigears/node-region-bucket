var AWS     = require('aws-sdk')
  , Promise = require('bluebird')
  , extend  = require('extend')
  , debug   = require('debug')('region-bucket')
  ;

function errHandler(err)
{
  console.error(err);
  return Promise.reject(err);
}

function createS3(region, bucket)
{
  return Promise.promisifyAll(
    new AWS.S3({
      region: region,
      params: { Bucket: bucket }
    })
  );
}

module.exports = function(region, bucket, params)
{
  function createHandler(err)
  {
    console.log(err);

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

  var promise = s3.getBucketLocationAsync().tap(debug).then(function(response)
  {
    return createS3(response.LocationConstraint, bucket);
  });

  if (create) { promise = promise.catch(createHandler); }
  return promise.catch(errHandler);
};
