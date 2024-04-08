import {
  ArgumentMetadata, BadRequestException, FileTypeValidator,
  FileValidator,
  Injectable,
  MaxFileSizeValidator,
  ParseFilePipe,
  PipeTransform
} from "@nestjs/common";
import { IFile } from "@nestjs/common/pipes/file/interfaces";
import * as fs from "node:fs/promises";
import * as path from "path";
import { ImageValidationPipe } from "@server/upload/image-validation.pipe";
import * as DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { optimize } from "svgo";
import { resolve } from "app-root-path";

@Injectable()
export class VectorValidationPipe extends ImageValidationPipe {
  constructor(
    protected maxFileSize = 10_000_000,
  ) {
    super(maxFileSize, ["svg"]);
  }

  async transform(value: Express.Multer.File, metadata: ArgumentMetadata) {
    await this.checkFileSize(value);

    const ext = path.extname(value.filename).slice(1);

    if (!ext || ext !== "svg") {
      await this.removeFileAndThrow(value);
    }

    const svgContent = await fs.readFile(value.path, { encoding: "utf8" });

    const { window } = new JSDOM("<!DOCTYPE html>");
    const purify = DOMPurify(window);
    const cleanSvg = purify.sanitize(svgContent);
    const optimizedSvg = optimize(cleanSvg);

    const destination = resolve(`../uploads/vector/`);
    const resPath = destination + value.filename;
    await fs.writeFile(resPath, optimizedSvg.data);
    await fs.unlink(value.path);

    return {
      ...value,
      path: resPath,
      destination
    };
  }
}
