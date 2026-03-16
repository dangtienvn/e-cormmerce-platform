const jwt = require('jsonwebtoken');

class LocalStorageProvider {
  /**
   * Generates a secure, time-limited URL for downloading a file locally
   * @param {string} filePath - Path to the file
   * @param {number} expiresInSeconds - Token expiration time
   * @returns {Promise<string>}
   */
  async getPresignedUrl(filePath, expiresInSeconds = 3600) {
    const secret = process.env.JWT_SECRET || 'secret';
    // Create a temporary token that encodes the file path
    const token = jwt.sign({ filePath }, secret, { expiresIn: expiresInSeconds });
    
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
    return `${baseUrl}/api/files/download?token=${token}`;
  }
}

module.exports = LocalStorageProvider;
