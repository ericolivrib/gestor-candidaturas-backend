import { registerAs } from "@nestjs/config";
import { MulterModuleOptions } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import { extname } from "node:path";
import { FILE_DESTINATION } from "src/shared/constants/file-destination";

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
  })
}));