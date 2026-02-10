const jwt = require('jsonwebtoken');
const path = require('path');

const FileController = {
  /**
   * API: /api/files/download
   * Handles local secure download using a temporary JWT token
   */
  async downloadLocalSecure(req, res, next) {
    try {
      const { token } = req.query;
      if (!token) {
        return res.status(401).json({ success: false, message: 'Missing token' });
      }

      const secret = process.env.JWT_SECRET || 'secret';
      let decoded;
      try {
        decoded = jwt.verify(token, secret);
      } catch (err) {
        return res.status(403).json({ success: false, message: 'Invalid or expired download link' });
      }

      const filePath = decoded.filePath;
      if (!filePath) {
        return res.status(400).json({ success: false, message: 'Invalid token payload' });
      }

      // Serve the file safely. In a real scenario, make sure path traversal is prevented.
      const safePath = path.resolve(__dirname, '../../../uploads', filePath);
      
      // Ensure the resolved path is actually within the uploads directory
      if (!safePath.startsWith(path.resolve(__dirname, '../../../uploads'))) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      res.download(safePath);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = FileController;
