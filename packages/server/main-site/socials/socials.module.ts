import { Module } from "@nestjs/common";
import { SocialsResolver } from "@server/main-site/socials/socials.resolver";
import { SocialsService } from "@server/main-site/socials/socials.service";
import { CustomRepositoryModule } from "@server/db/custom-repository.module";
import { SortedRepository } from "@server/db/sorted-repository.service";
import { SocialsProductsResolver } from "@server/main-site/socials/socials-products.resolver";

@Module({
  imports: [
    CustomRepositoryModule.forFeature(SortedRepository, [
      // nda
    ]),
  ],
  providers: [
    SocialsResolver,
    SocialsService,
    SocialsProductsResolver,
    // nda,
  ],
})
export class SocialsModule {}
