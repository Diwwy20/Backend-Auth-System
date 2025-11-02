import * as path from 'path';

export const getBuffer = (file: Express.Multer.File) => {
  const extName = path.extname(file.originalname).toString();
  const base64 = file.buffer.toString('base64');
  const mimeType = file.mimetype || 'application/octet-stream';
  return `data:${mimeType};base64,${base64}`;
};
