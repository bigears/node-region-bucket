A simple wrapper around AWS.S3 that deals with creating a bucket

```
var regionBucket = require('region-bucket');

regionBucket('us-east-1', 'my-bucket', {create: true}).then(function(bucket) {

  bucket.putObjectAsync(...).then(function(response) {

    console.log(response);

  });

});
```
