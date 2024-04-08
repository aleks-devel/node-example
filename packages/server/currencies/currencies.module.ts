import { Module } from "@nestjs/common";
import { CurrenciesService } from "@server/currencies/currencies.service";
import { HttpModule } from "@nestjs/axios";
import { CustomRepositoryModule } from "@server/db/custom-repository.module";
import { ExtendedRepositoryService } from "@server/db/extended-repository.service";
import { Currency } from "@server/currencies/entities/currency.entity";
import { CurrenciesResolver } from "@server/currencies/currencies.resolver";

@Module({
  providers: [CurrenciesService, CurrenciesResolver],
  imports: [
    HttpModule,
    // nda,
    CustomRepositoryModule.forFeature(ExtendedRepositoryService, [Currency])
  ]
})
export class CurrenciesModule {}
