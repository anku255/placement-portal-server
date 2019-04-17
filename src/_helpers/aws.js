import aws from 'aws-sdk';
import archiver from 'archiver';
import stream from 'stream';

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_ID,
  secretAccessKey: process.env.AWS_ACCESS_KEY,
  region: 'ap-south-1',
};

// Configure AWS
aws.config.update(awsConfig);

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

const listFilesInABucket = params => {
  return new Promise((resolve, reject) => {
    s3.listObjectsV2(params, (err, data) => {
      if (err) return reject(err);

      const fileNames = data.Contents.map(itm => itm.Key);
      return resolve(fileNames);
    });
  });
};

const getFileFromS3 = params => {
  return new Promise((resolve, reject) => {
    s3.getObject(params, (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
  });
};

// This returns us a stream..
// consider it as a real pipe sending fluid to S3 bucket.. Don't forget it
const streamTo = (bucket, key) => {
  const pass = new stream.PassThrough();
  s3.upload({ Bucket: bucket, Key: key, Body: pass }, (err, data) => {
    /* ...Handle Errors Here */
  });
  return pass;
};

const getAllCVAsZip = async (prefix, outputDir, callback) => {
  return new Promise(async (resolve, reject) => {
    // Get all the fileNames in the cv bucket
    const keys = await listFilesInABucket({
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: prefix,
    });

    if (keys.length === 0) {
      return reject(new Error('No CVs found!'));
    }

    // Get all files from S3 and store it in list
    const list = await Promise.all(
      keys.map(
        key =>
          new Promise(_resolve => {
            getFileFromS3({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: key,
            }).then(data =>
              _resolve({ data: data.Body, name: `${key.split('/').pop()}` })
            );
          })
      )
    ).catch(err => {
      throw new Error(err);
    });

    // Make an archive and upload it to S3
    await new Promise((_resolve, _reject) => {
      const myStream = streamTo(process.env.AWS_BUCKET_NAME, outputDir); // Now we instantiate that pipe...

      const archive = archiver('zip');
      archive.on('error', err => {
        throw new Error(err);
      });

      // Your promise gets resolved when the fluid stops running...
      // so that's when you get to close and resolve
      myStream.on('close', _resolve);
      myStream.on('end', _resolve);
      myStream.on('error', reject);

      archive.pipe(myStream); // archiver will pass the zip to myStream
      list.forEach(itm => archive.append(itm.data, { name: itm.name })); // And then we start adding files to it
      archive.finalize(); // Tell is, that's all we want to add. Then when it finishes, the promise will resolve in one of those events up there
    }).catch(err => {
      throw new Error(err);
    });

    // call the cb which was passed in the argument
    callback();
    return resolve();
  });
};

const copyFileInS3 = params => {
  return new Promise((resolve, reject) => {
    s3.copyObject(params, (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
  });
};

const deleteFileInS3 = params => {
  return new Promise((resolve, reject) => {
    s3.deleteObject(params, (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
  });
};

export {
  aws,
  s3,
  uploadToS3,
  isFileInS3,
  getSignedURL,
  getAllCVAsZip,
  copyFileInS3,
  deleteFileInS3,
};
