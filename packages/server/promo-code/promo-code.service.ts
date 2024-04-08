import { Injectable } from "@nestjs/common";
import { ClientService } from "@server/client-metric/client.service";
import {
  ExtendedRepositoryService,
  InjectExtendedCustomRepo,
} from "@server/db/extended-repository.service";
import { PromoCode } from "@server/promo-code/entities/promo-code.entity";
import { SettingsService } from "@server/settings/settings.service";
import { Settings } from "@server/settings/entities/settings.enum";
import { NotFoundException } from "../common/exceptions/base-exceptions";

@Injectable()
export class PromoCodeService {
  constructor(
    private clientService: ClientService,
    @InjectExtendedCustomRepo(PromoCode)
    private promoRepo: ExtendedRepositoryService<PromoCode>,
    private settingsService: SettingsService,
  ) {}

  async getOrCreate(clientId: string | null, ip: string) {
    // nda
  }

  async useCode(code: string, clientId: string) {
    // nda
  }
}
