import aws from 'aws-sdk';

// Configure AWS
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_ID,
  secretAccessKey: process.env.AWS_ACCESS_KEY,
});

// Instantiate a new S3 instance
const s3 = new aws.S3();

const uploadToS3 = params => {
  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
  });
};

const isFileInS3 = params => {
  return new Promise(resolve => {
    s3.headObject(params, err => {
      if (err && err.code === 'NotFound') {
        /* eslint-disable-next-line */
        return resolve(false);
      }
      return resolve(true);
    });
  });
};

const getSignedURL = params => {
  return s3.getSignedUrl('getObject', params);
};

export { aws, s3, uploadToS3, isFileInS3, getSignedURL };
