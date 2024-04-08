import { Injectable } from "@nestjs/common";
import {
  ExtendedRepositoryService,
  InjectExtendedCustomRepo,
} from "@server/db/extended-repository.service";
import { Setting } from "@server/settings/entities/setting.entity";
import { Settings } from "@server/settings/entities/settings.enum";

@Injectable()
export class SettingsService {
  constructor(
    @InjectExtendedCustomRepo(Setting)
    private settingRepo: ExtendedRepositoryService<Setting>,
  ) {}

  async getSettingOrThrow(key: Settings) {
    const setting = await this.settingRepo.findOneByOrFail({ name: key });
    return setting.value;
  }
}
