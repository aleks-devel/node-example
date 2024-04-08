import { Module } from "@nestjs/common";
import { PaymentModule } from "@server/payments/payment.module";
import { PurchaseController } from "@server/purchase/purchase.controller";
import { PurchaseUtilsService } from "@server/purchase/utils/purchase-utils.service";
import { CustomRepositoryModule } from "@server/db/custom-repository.module";
import { ExtendedRepositoryService } from "@server/db/extended-repository.service";
import { HttpModule } from "@nestjs/axios";
import { Order } from "@server/purchase/entities/order.entity";
import { User } from "@server/user/entities/user.entity";
import { PurchasePublicService } from "@server/purchase/purchase-public.service";
import { PurchaseUserService } from "@server/purchase/purchase-user.service";
import { BasketModule } from "@server/purchase/basket/basket.module";
import { PromoCode } from "@server/promo-code/entities/promo-code.entity";
import { UserService } from "@server/purchase/utils/user.service";

@Module({
  imports: [
    HttpModule,
    PaymentModule,
    BasketModule,
    CustomRepositoryModule.forFeature(ExtendedRepositoryService, [
      Order,
      User,
      // nda,
      PromoCode,
    ]),
  ],
  controllers: [PurchaseController],
  providers: [
    PurchaseUtilsService,
    PurchasePublicService,
    PurchaseUserService,
    UserService,
  ],
})
export class PurchaseModule {}
