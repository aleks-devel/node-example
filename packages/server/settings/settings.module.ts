import { Module } from "@nestjs/common";
import { CustomRepositoryModule } from "@server/db/custom-repository.module";
import { ExtendedRepositoryService } from "@server/db/extended-repository.service";
import { Setting } from "@server/settings/entities/setting.entity";
import { SettingsService } from "@server/settings/settings.service";

@Module({
  imports: [
    CustomRepositoryModule.forFeature(ExtendedRepositoryService, [Setting]),
  ],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
