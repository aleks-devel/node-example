import {
  ArgumentMetadata,
  BadRequestException,
  FileValidator,
  Injectable,
  MaxFileSizeValidator,
  ParseFilePipe,
  PipeTransform,
} from "@nestjs/common";
import * as fs from "node:fs/promises";
import * as fsCommon from "node:fs";
import * as path from "path";
import { resolve } from "app-root-path";

@Injectable()
export class ImageValidationPipe implements PipeTransform {
  constructor(
    protected maxFileSize = 10_000_000,
    private extensions = ["png", "jpg", "jpeg", "gif", "webp"],
  ) {}

  async checkFileSize(value: Express.Multer.File) {
    const parseFilePipe = new ParseFilePipe({
      validators: [new MaxFileSizeValidator({ maxSize: this.maxFileSize })],
    });

    try {
      await parseFilePipe.transform(value);
    } catch (e) {
      if (e instanceof BadRequestException) {
        await this.removeFileAndThrow(value);
      }
      throw e;
    }
  }

  async transform(value: Express.Multer.File, metadata: ArgumentMetadata) {
    await this.checkFileSize(value);

    const ext = path.extname(value.filename).slice(1);

    if (!ext || !this.extensions.includes(ext)) {
      await this.removeFileAndThrow(value);
    }

    const { fileTypeFromFile } = await eval('import("file-type")');
    const imageType = await fileTypeFromFile(value.path);

    if (imageType === undefined || !this.extensions.includes(imageType.ext)) {
      await this.removeFileAndThrow(value);
    }

    const destination = resolve(`../uploads/image/`);
    const resPath = destination + value.filename;

    const callback = (error: any) => {
      if (error !== null) {
        console.error(error);
      }
    };

    const readStream = fsCommon.createReadStream(value.path);
    const writeStream = fsCommon.createWriteStream(resPath);

    readStream.on("error", callback);
    writeStream.on("error", callback);

    readStream.on("close", () => {
      fsCommon.unlink(value.path, callback);
    });

    readStream.pipe(writeStream);

    return {
      ...value,
      path: resPath,
      destination,
    };
  }

  async removeFileAndThrow(value: any) {
    await fs.unlink(value.path);
    throw new BadRequestException("Unsupported file type");
  }
}
