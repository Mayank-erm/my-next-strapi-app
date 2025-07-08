// src/pages/api/files/[...path].ts - SECURE FILE SERVING
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';

// Security: Define allowed file extensions
const ALLOWED_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.txt', '.csv', '.html', '.htm',
  '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp',
  '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm',
  '.mp3', '.wav', '.flac', '.aac', '.ogg',
  '.zip', '.rar', '.7z', '.tar', '.gz'
];

// Security: Define base upload directory
const UPLOAD_BASE_PATH = process.env.UPLOAD_BASE_PATH || 'C:\\Users\\mayank.kumar\\OneDrive - ERM\\Documents\\Workspace\\cms-strapi-app\\public\\uploads';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { path: filePath } = req.query;
    
    if (!filePath || !Array.isArray(filePath)) {
      return res.status(400).json({ error: 'Invalid file path' });
    }

    // Construct the full file path
    const requestedPath = filePath.join('/');
    const fullFilePath = path.join(UPLOAD_BASE_PATH, requestedPath);

    // Security: Ensure the path is within the upload directory (prevent directory traversal)
    const normalizedBasePath = path.normalize(UPLOAD_BASE_PATH);
    const normalizedFilePath = path.normalize(fullFilePath);
    
    if (!normalizedFilePath.startsWith(normalizedBasePath)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Security: Check file extension
    const fileExtension = path.extname(fullFilePath).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return res.status(403).json({ error: 'File type not allowed' });
    }

    // Check if file exists
    if (!fs.existsSync(fullFilePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Get file stats
    const stats = fs.statSync(fullFilePath);
    if (!stats.isFile()) {
      return res.status(404).json({ error: 'Not a file' });
    }

    // Determine MIME type
    const mimeType = mime.lookup(fullFilePath) || 'application/octet-stream';
    
    // Security: Set appropriate headers
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Handle range requests for video/audio files
    const range = req.headers.range;
    if (range && (mimeType.startsWith('video/') || mimeType.startsWith('audio/'))) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunksize = (end - start) + 1;
      
      const fileStream = fs.createReadStream(fullFilePath, { start, end });
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': mimeType,
      });
      
      fileStream.pipe(res);
    } else {
      // Regular file serving
      const fileStream = fs.createReadStream(fullFilePath);
      fileStream.pipe(res);
    }

    // Log file access for analytics
    console.log(`File accessed: ${requestedPath} (${mimeType}) - ${stats.size} bytes`);

  } catch (error) {
    console.error('File serving error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Disable body parsing for file serving
export const config = {
  api: {
    bodyParser: false,
  },
};