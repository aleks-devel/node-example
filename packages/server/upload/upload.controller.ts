import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { VectorValidationPipe } from "@server/upload/vector-validation.pipe";
import { FileInterceptor } from "@nestjs/platform-express";
import { ImageValidationPipe } from "@server/upload/image-validation.pipe";

@Controller("/upload")
export class UploadController {
  getUrl(url: string, type: "vector" | "image") {
    let protocol = "https://";

    if (process.env.APP_ENV === "development") {
      protocol = "http://";
    }

    return `${protocol}${process.env.STATIC_HOST}/uploads/${type}/${url}`;
  }

  @Post("/image")
  @UseInterceptors(FileInterceptor("file"))
  async postImage(
    @UploadedFile(new ImageValidationPipe())
    file: Express.Multer.File,
  ) {
    return this.getUrl(file.filename, "image");
  }

  @Post("/vector")
  @UseInterceptors(FileInterceptor("file"))
  async postVector(
    @UploadedFile(new VectorValidationPipe())
    file: Express.Multer.File,
  ) {
    return this.getUrl(file.filename, "vector");
  }
}
