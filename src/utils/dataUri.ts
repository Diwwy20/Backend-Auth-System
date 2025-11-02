import * as DataUriParser from 'datauri/parser';
import * as path from 'path';

export const getBuffer = (file: Express.Multer.File) => {
  const parser = new DataUriParser();
  const extName = path.extname(file.originalname).toString();
  return parser.format(extName, file.buffer);
};
