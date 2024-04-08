import { Module } from "@nestjs/common";
import { EditorController } from "@server/main-site/editor/editor.controller";
import { EditorService } from "@server/main-site/editor/editor.service";
import { CustomRepositoryModule } from "@server/db/custom-repository.module";
import { ExtendedRepositoryService } from "@server/db/extended-repository.service";
import { EditorData } from "@server/main-site/editor/entities/editor-data.entity";

@Module({
  imports: [
    CustomRepositoryModule.forFeature(ExtendedRepositoryService, [EditorData]),
  ],
  providers: [EditorService],
  controllers: [EditorController],
})
export class EditorModule {}
