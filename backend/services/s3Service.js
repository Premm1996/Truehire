const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();

// S3 Service class
class S3Service {
  constructor() {
    this.bucketName = process.env.AWS_S3_BUCKET_NAME;
    this.cloudfrontUrl = process.env.AWS_CLOUDFRONT_URL;
  }

  // Upload file to S3
  async uploadFile(fileBuffer, fileName, mimeType, folder = 'uploads') {
    try {
      const key = `${folder}/${Date.now()}-${fileName}`;

      const params = {
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
        ACL: 'private', // Files are private, accessed via CloudFront
        Metadata: {
          uploadedAt: new Date().toISOString(),
          originalName: fileName
        }
      };

      const result = await s3.upload(params).promise();

      return {
        success: true,
        key: result.Key,
        url: this.getCloudFrontUrl(result.Key),
        bucket: result.Bucket,
        etag: result.ETag
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete file from S3
  async deleteFile(key) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key
      };

      await s3.deleteObject(params).promise();

      return {
        success: true,
        key: key
      };
    } catch (error) {
      console.error('S3 delete error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get signed URL for private files
  getSignedUrl(key, expiresIn = 3600) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Expires: expiresIn
      };

      const signedUrl = s3.getSignedUrl('getObject', params);
      return signedUrl;
    } catch (error) {
      console.error('S3 signed URL error:', error);
      return null;
    }
  }

  // Get CloudFront URL for public files
  getCloudFrontUrl(key) {
    if (!this.cloudfrontUrl) {
      // Fallback to S3 URL if CloudFront not configured
      return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
    }
    return `${this.cloudfrontUrl}/${key}`;
  }

  // List files in bucket with prefix
  async listFiles(prefix = '', maxKeys = 1000) {
    try {
      const params = {
        Bucket: this.bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys
      };

      const result = await s3.listObjectsV2(params).promise();

      return {
        success: true,
        files: result.Contents || [],
        isTruncated: result.IsTruncated,
        nextContinuationToken: result.NextContinuationToken
      };
    } catch (error) {
      console.error('S3 list error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get file metadata
  async getFileMetadata(key) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key
      };

      const result = await s3.headObject(params).promise();

      return {
        success: true,
        metadata: {
          contentType: result.ContentType,
          contentLength: result.ContentLength,
          lastModified: result.LastModified,
          etag: result.ETag,
          metadata: result.Metadata
        }
      };
    } catch (error) {
      console.error('S3 metadata error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Multer configuration for S3 uploads
const multerS3Storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_S3_BUCKET_NAME,
  acl: 'private',
  metadata: (req, file, cb) => {
    cb(null, {
      uploadedAt: new Date().toISOString(),
      originalName: file.originalname
    });
  },
  key: (req, file, cb) => {
    const folder = req.body.folder || 'uploads';
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, `${folder}/${fileName}`);
  }
});

// File filter for uploads
const fileFilter = (req, file, cb) => {
  // Allow common file types
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`), false);
  }
};

// Multer upload middleware
const upload = multer({
  storage: multerS3Storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per request
  }
});

// Single file upload
const uploadSingle = (fieldName) => upload.single(fieldName);

// Multiple files upload
const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);

// Export service instance and utilities
const s3Service = new S3Service();

module.exports = {
  S3Service,
  s3Service,
  upload,
  uploadSingle,
  uploadMultiple
};
