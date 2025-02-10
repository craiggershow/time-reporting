import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists with absolute path
const uploadsDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'));
      return;
    }
    cb(null, true);
  },
});

export async function processAndSaveImage(file: Express.Multer.File): Promise<string> {
  try {
    const filename = `logo-${Date.now()}${path.extname(file.originalname)}`;
    const filepath = path.join(uploadsDir, filename);

    await sharp(file.buffer)
      .resize(500, 86, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toFile(filepath);

    return filename;
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
} 