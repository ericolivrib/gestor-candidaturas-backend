import { registerAs } from "@nestjs/config";
import { Request } from "express";
import { MulterModuleOptions } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import { extname } from "node:path";
import { FILE_DESTINATION } from "src/shared/constants/file-destination";
import { BadRequestException } from "@nestjs/common";

export default registerAs('multer', (): MulterModuleOptions => ({
  storage: diskStorage({
    destination(req, file, callback) {
      try {
        if (!existsSync(FILE_DESTINATION)) mkdirSync(FILE_DESTINATION, { recursive: true });
        callback(null, FILE_DESTINATION);
      } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        callback(err, '');
      }
    },
    filename(req, file, callback) {
      const ext = extname(file.originalname);
      const filename = `${randomUUID()}${ext}`;
      callback(null, filename);
    },
  }),
  fileFilter(req: Request, file, callback) {    
    if (file.mimetype !== 'application/pdf') {
      const error = new BadRequestException('Tipo de arquivo não encontrado');
      return callback(error, false);
    }
    
    callback(null, true);
  },
}));