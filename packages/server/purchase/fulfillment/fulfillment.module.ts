import { Module } from "@nestjs/common";
import { FulfillmentController } from "@server/purchase/fulfillment/fulfillment.controller";
import { FulfillmentService } from "@server/purchase/fulfillment/fulfillment.service";
import { CustomRepositoryModule } from "@server/db/custom-repository.module";
import { ExtendedRepositoryService } from "@server/db/extended-repository.service";
import { Order } from "@server/purchase/entities/order.entity";
import { OrderProduct } from "@server/purchase/entities/order-product.entity";
import { DispatchSupplier } from "@server/purchase/entities/dispatch-supplier.entity";

@Module({
  imports: [
    CustomRepositoryModule.forFeature(ExtendedRepositoryService, [
      Order,
      OrderProduct,
      DispatchSupplier,
    ]),
  ],
  controllers: [FulfillmentController],
  providers: [FulfillmentService],
})
export class FulfillmentModule {}
