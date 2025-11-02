import parser from 'datauri/parser';
import * as path from 'path';

export const getBuffer = (file: Express.Multer.File) => {
  const dataUri = new parser();
  const extName = path.extname(file.originalname).toString();
  return dataUri.format(extName, file.buffer);
};
