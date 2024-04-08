import { Injectable } from "@nestjs/common";
import {
  NewFastPurchaserDto,
  NewPurchaseDto,
} from "@server/purchase/dto/new-purchase.dto";
import { round } from "@server/common/utils/math-utils";
import { TransactionType } from "@server/payments/entities/transaction-types.enum";
import { PurchaseUtilsService } from "@server/purchase/utils/purchase-utils.service";
import { BasketService } from "@server/purchase/basket/basket.service";
import {
  ExtendedRepositoryService,
  InjectExtendedCustomRepo,
} from "@server/db/extended-repository.service";
import { Order } from "@server/purchase/entities/order.entity";
import { PaymentService } from "@server/payments/payment.service";
import { DataSource, EntityManager } from "typeorm";
import { TransactionService } from "@server/db/transaction-service";

@Injectable()
export class PurchasePublicService extends TransactionService {
  constructor(
    private purchaseService: PurchaseUtilsService,
    private basketService: BasketService,
    @InjectExtendedCustomRepo(Order)
    private orderRepo: ExtendedRepositoryService<Order>,
    private paymentService: PaymentService,
    dataSource: DataSource,
  ) {
    super(dataSource);
  }

  public getForTransaction(manager: EntityManager) {
    return new PurchasePublicService(
      this.purchaseService.getForTransaction(manager),
      this.basketService.getForTransaction(manager),
      this.orderRepo.fromManager(manager),
      this.paymentService.getForTransaction(manager),
      manager.connection,
    );
  }

  async newFastPurchase(data: NewFastPurchaserDto) {
    const order = await this.purchaseService.createOrder(data.promoCode);
    const code = await this.purchaseService.usePromoCode(data.promoCode);

    const orderProduct = await this.basketService.addProductToOrder(
      order.id,
      data.product,
      code?.statusId,
    );

    const total = orderProduct.netPrice;
    const newStatusId = await this.purchaseService.getNewStatusId(total);
    const cashback = await this.purchaseService.getCashback(
      [orderProduct],
      newStatusId,
    );

    const netPrice = round(total, 2);

    await this.orderRepo.update({ id: order.id }, { cashback, netPrice });

    return this.paymentService.createPayment(
      netPrice,
      TransactionType.orderPaymentGate,
      order.id,
      [
        {
          description: "nda",
          netPrice: orderProduct.netPrice,
          quantity: orderProduct.quantity,
        },
      ],
    );
  }

  async newPurchase(data: NewPurchaseDto) {
    const order = await this.purchaseService.createOrder(data.promoCode);
    const code = await this.purchaseService.usePromoCode(data.promoCode);

    const orderProducts = await this.basketService.addProductsToOrder(
      order.id,
      data.products,
      code?.statusId,
    );

    const total = orderProducts.reduce((accum, val) => accum + val.netPrice, 0);
    const newStatusId = await this.purchaseService.getNewStatusId(total);
    const cashback = await this.purchaseService.getCashback(
      orderProducts,
      newStatusId,
    );

    const netPrice = round(total, 2);

    await this.orderRepo.update({ id: order.id }, { cashback, netPrice });

    return this.paymentService.createPayment(
      netPrice,
      TransactionType.orderPaymentGate,
      order.id,
      orderProducts.map((orderProduct) => ({
        description: "nda",
        netPrice: orderProduct.netPrice,
        quantity: orderProduct.quantity,
      })),
    );
  }
}
