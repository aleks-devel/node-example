import { Module } from "@nestjs/common";
import { BasketService } from "@server/purchase/basket/basket.service";
import { BasketResolver } from "@server/purchase/basket/basket.resolver";
import { CustomRepositoryModule } from "@server/db/custom-repository.module";
import { ExtendedRepositoryService } from "@server/db/extended-repository.service";
import { HttpModule } from "@nestjs/axios";
import { BasketProductsService } from "@server/purchase/basket/basket-products.service";
import { Order } from "@server/purchase/entities/order.entity";
import { OrderProduct } from "@server/purchase/entities/order-product.entity";
import { OrderSubProduct } from "@server/purchase/entities/order-sub-product.entity";
import { StatusMatrix } from "@server/admin/discount-matrix/entities/status-matrix.entity";
import { SocialProduct } from "@server/admin/social/products/entities/social-product.entity";

@Module({
  imports: [
    HttpModule,
    CustomRepositoryModule.forFeature(ExtendedRepositoryService, [
      Order,
      OrderProduct,
      OrderSubProduct,
      StatusMatrix,
      SocialProduct,
    ]),
  ],
  providers: [BasketService, BasketProductsService, BasketResolver],
  exports: [BasketService],
})
export class BasketModule {}
