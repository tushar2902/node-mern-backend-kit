const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const multer = require('multer');
const multerS3 = require('multer-s3');
const OPTIONS = require('../../config/options');

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
  sslEnabled: false,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

const params = {
  Bucket: process.env.AWS_INPUT_BUCKET,
};

const postCloudStorage = multerS3({
  s3,
  bucket: process.env.AWS_INPUT_BUCKET,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  contentDisposition: 'attachment',
  metadata(request, file, abCallback) {
    const fieldname = file.fieldname.split(' ').join('_');
    abCallback(null, { fieldname });
  },
  key(request, file, abCallback) {
    const r = Math.random().toString(36).substring(7);
    const { ext } = path.parse(file.originalname);
    let newFileName = `${Date.now() + r}-${path.parse(file.originalname).name}`;
    newFileName = newFileName
      .split(' ')
      .join('_')
      .replace(/[^a-zA-Z0-9]/g, '');
    const fullPath = `uploads/${newFileName}${ext}`;
    abCallback(null, fullPath);
  },
});

exports.postUpload = multer({
  storage: postCloudStorage,
});

exports.generateSignedURL = async (filePath) => {
  params.Key = `${filePath}`;
  const command = new PutObjectCommand(params);
  return await getSignedUrl(s3, command, {
    expiresIn: OPTIONS.signedUrlExpireSeconds,
  });
};
