import { Module } from "@nestjs/common";
import { PaymentController } from "@server/payments/payment.controller";
import { PaymentService } from "@server/payments/payment.service";
import { HttpModule } from "@nestjs/axios";
import { CustomRepositoryModule } from "@server/db/custom-repository.module";
import { ExtendedRepositoryService } from "@server/db/extended-repository.service";
import { Order } from "@server/purchase/entities/order.entity";
import { User } from "@server/user/entities/user.entity";
import { PaymentTransaction } from "@server/payments/entities/payment-transaction.entity";

@Module({
  imports: [
    HttpModule,
    CustomRepositoryModule.forFeature(ExtendedRepositoryService, [
      Order,
      User,
      PaymentTransaction,
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
