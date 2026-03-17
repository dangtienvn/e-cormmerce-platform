const LocalStorageProvider = require('./providers/local.provider');
const S3StorageProvider = require('./providers/s3.provider');

class StorageService {
  constructor() {
    const providerType = process.env.STORAGE_PROVIDER || 'local';
    
    if (providerType === 's3') {
      this.provider = new S3StorageProvider();
    } else {
      this.provider = new LocalStorageProvider();
    }
  }

  /**
   * Gets a secure download link for a file
   * @param {string} filePath 
   * @returns {Promise<string>}
   */
  async getDownloadLink(filePath) {
    return this.provider.getPresignedUrl(filePath, 3600); // 1 hour expiry
  }
}

module.exports = new StorageService();
