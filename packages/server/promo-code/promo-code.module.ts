import { Module } from "@nestjs/common";
import { PromoCodeController } from "@server/promo-code/promo-code.controller";
import { SettingsModule } from "@server/settings/settings.module";
import { ClientModule } from "@server/client-metric/client.module";
import { CustomRepositoryModule } from "@server/db/custom-repository.module";
import { ExtendedRepositoryService } from "@server/db/extended-repository.service";
import { PromoCode } from "@server/promo-code/entities/promo-code.entity";
import { PromoCodeService } from "@server/promo-code/promo-code.service";
import { PromoCodeResolver } from "./promo-code.resolver";

@Module({
  imports: [
    SettingsModule,
    ClientModule,
    CustomRepositoryModule.forFeature(ExtendedRepositoryService, [PromoCode]),
  ],
  controllers: [PromoCodeController],
  providers: [PromoCodeService, PromoCodeResolver],
})
export class PromoCodeModule {}
