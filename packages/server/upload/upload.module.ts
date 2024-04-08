import { Module } from "@nestjs/common";
import { UploadController } from "@server/upload/upload.controller";
import { MulterModule } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import * as path from "path";
import { v4 as uuidV4 } from "uuid";

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        filename(req, file, callback) {
          const ext = path.extname(file.originalname);

          callback(null, uuidV4() + ext);
        },
      }),
    })
  ],
  providers: [],
  controllers: [UploadController]
})
export class UploadModule {}
