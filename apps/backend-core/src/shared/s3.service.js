const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy'
  }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'crm-digital-products';

class S3Service {
  /**
   * Upload a file to S3
   * @param {Buffer} fileBuffer
   * @param {string} fileName
   * @param {string} mimetype
   * @returns {Promise<string>} S3 object key or URL
   */
  static async uploadFile(fileBuffer, fileName, mimetype) {
    const key = `uploads/${Date.now()}-${fileName}`;
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: mimetype
    });

    await s3Client.send(command);
    return key;
  }

  /**
   * Get a pre-signed URL for secure downloading
   * @param {string} key S3 object key
   * @param {number} expiresIn Expiration time in seconds
   * @returns {Promise<string>} Pre-signed URL
   */
  static async getSignedDownloadUrl(key, expiresIn = 900) {
    // If the key is already a full URL (e.g. from older data), return as is
    if (key.startsWith('http')) return key;

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });
    
    return await getSignedUrl(s3Client, command, { expiresIn });
  }
}

module.exports = S3Service;
