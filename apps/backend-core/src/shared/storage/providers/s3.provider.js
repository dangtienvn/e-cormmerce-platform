const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

class S3StorageProvider {
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy'
      }
    });
    this.bucketName = process.env.AWS_BUCKET_NAME || 'my-bucket';
  }

  /**
   * Generates a pre-signed URL for S3
   * @param {string} filePath - S3 Object Key
   * @param {number} expiresInSeconds - Expiration time
   * @returns {Promise<string>}
   */
  async getPresignedUrl(filePath, expiresInSeconds = 3600) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: filePath,
    });
    
    return getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });
  }
}

module.exports = S3StorageProvider;
