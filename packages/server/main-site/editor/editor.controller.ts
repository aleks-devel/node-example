import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { GetEditorDataDto } from "@server/main-site/editor/dto/get-editor-data.dto";
import { EditorService } from "@server/main-site/editor/editor.service";
import * as process from "process";
import { UnauthorizedException } from "@server/common/exceptions/base-exceptions";
import { UpdateDataDto } from "@server/main-site/editor/dto/update-data.dto";

@Controller("/editor")
export class EditorController {
  constructor(private service: EditorService) {}

  @Get("/data/all")
  async allEditorData(@Query("ids") ids: string[]) {
    return this.service.getAllData(ids);
  }

  @Post("/data/all")
  async updateData(@Body() data: UpdateDataDto[]) {
    return this.service.runInTransaction(async (service: EditorService) => {
      return service.updateData(data);
    });
  }

  @Post("/data")
  async initializeData(@Body() data: GetEditorDataDto) {
    if (data.token !== process.env.EDITOR_TOKEN) {
      throw new UnauthorizedException("token");
    }

    return this.service.runInTransaction(async (service: EditorService) => {
      return service.initializeData(data.data);
    });
  }
}
