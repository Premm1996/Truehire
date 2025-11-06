const AWS = require('aws-sdk');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Upload profile photo to S3
const uploadProfilePhoto = async (base64Image, userId) => {
  try {
    // Extract base64 data
    const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 image format');
    }

    const imageBuffer = Buffer.from(matches[2], 'base64');
    const fileName = `profile_${userId}_${Date.now()}.png`;
    const key = `profiles/${fileName}`;

    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: imageBuffer,
      ContentType: 'image/png',
      ACL: 'public-read' // Make the file publicly accessible
    };

    const result = await s3.upload(uploadParams).promise();

    // Return the public URL
    return result.Location;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload image to S3');
  }
};

// Delete profile photo from S3
const deleteProfilePhoto = async (photoUrl) => {
  try {
    if (!photoUrl || !photoUrl.includes(process.env.S3_BUCKET_NAME)) {
      return; // Not an S3 URL, skip deletion
    }

    // Extract key from URL
    const urlParts = photoUrl.split('/');
    const key = urlParts.slice(-2).join('/'); // profiles/filename.png

    const deleteParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key
    };

    await s3.deleteObject(deleteParams).promise();
    console.log('Profile photo deleted from S3:', key);
  } catch (error) {
    console.error('S3 delete error:', error);
    // Don't throw error for delete failures
  }
};

module.exports = {
  s3,
  uploadProfilePhoto,
  deleteProfilePhoto
};
