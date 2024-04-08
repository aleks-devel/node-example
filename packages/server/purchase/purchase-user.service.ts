import { Injectable } from "@nestjs/common";
import { Order } from "@server/purchase/entities/order.entity";
import {
  PurchaseUserInfo,
  UserService,
} from "@server/purchase/utils/user.service";
import { round } from "@server/common/utils/math-utils";
import { TransactionType } from "@server/payments/entities/transaction-types.enum";
import {
  NewFastPurchaseFromUserDto,
  NewPurchaseFromUserDto,
} from "@server/purchase/dto/new-purchase.dto";
import { OrderStatus } from "@server/purchase/entities/purchase-related-statuses.enum";
import { BadRequestException } from "@server/common/exceptions/base-exceptions";
import { PurchaseUtilsService } from "@server/purchase/utils/purchase-utils.service";
import { TransactionService } from "@server/db/transaction-service";
import { DataSource, EntityManager } from "typeorm";
import {
  ExtendedRepositoryService,
  InjectExtendedCustomRepo,
} from "@server/db/extended-repository.service";
import { PaymentService } from "@server/payments/payment.service";
import { BasketService } from "@server/purchase/basket/basket.service";

@Injectable()
export class PurchaseUserService extends TransactionService {
  constructor(
    private purchaseService: PurchaseUtilsService,
    private basketService: BasketService,
    @InjectExtendedCustomRepo(Order)
    private orderRepo: ExtendedRepositoryService<Order>,
    private paymentService: PaymentService,
    private userService: UserService,
    dataSource: DataSource,
  ) {
    super(dataSource);
  }

  public getForTransaction(manager: EntityManager) {
    return new PurchaseUserService(
      this.purchaseService.getForTransaction(manager),
      this.basketService.getForTransaction(manager),
      this.orderRepo.fromManager(manager),
      this.paymentService.getForTransaction(manager),
      this.userService.getForTransaction(manager),
      manager.connection,
    );
  }

  private async createPurchaseFromUser(order: Order, user: PurchaseUserInfo) {
    const total = order.products.reduce(
      (accum, val) => accum + val.netPrice,
      0,
    );
    const newStatusId = await this.purchaseService.getNewStatusId(
      total + user.balance + user.totalPayed,
    );
    const cashback = await this.purchaseService.getCashback(
      order.products,
      newStatusId,
      user.statusId,
    );

    if (newStatusId && newStatusId !== user.statusId) {
      await this.userService.setNewStatus(user.id, newStatusId);
    }

    const netPrice = round(total - cashback, 2);

    await this.orderRepo.update({ id: order.id }, { cashback, netPrice });

    if (netPrice <= user.balance) {
      await this.paymentService.purchaseFromUserBalance(
        user.id,
        order.id,
        netPrice,
      );
    } else {
      return this.paymentService.createPayment(
        netPrice,
        TransactionType.orderPaymentGate,
        order.id,
        order.products.map((product) => ({
          description: "nda",
          netPrice: product.netPrice,
          quantity: product.netPrice,
        })),
      );
    }
  }

  async newFastPurchaseFromUser(
    data: NewFastPurchaseFromUserDto,
    requestUser: RequestUser,
  ) {
    const user = await this.userService.getUserInfo(requestUser);
    const order = await this.purchaseService.createOrder(
      data.promoCode,
      user.id,
    );
    const statusId = await this.purchaseService.getStatusId(
      await this.purchaseService.usePromoCode(data.promoCode),
      user,
    );

    order.products = [
      await this.basketService.addProductToOrder(
        order.id,
        data.product,
        statusId,
      ),
    ];

    return this.createPurchaseFromUser(order, user);
  }

  async newPurchaseFromUser(
    data: NewPurchaseFromUserDto,
    requestUser: RequestUser,
  ) {
    const order = await this.orderRepo.findOneOrFail({
      where: { id: data.orderId },
      relations: { products: { items: true } },
    });

    if (order.status !== OrderStatus.stillOrdering) {
      throw new BadRequestException("order.finished");
    } else if (order.products.length === 0) {
      throw new BadRequestException("order.noProducts");
    }

    const user = await this.userService.getUserInfo(requestUser);
    const statusId = await this.purchaseService.getStatusId(
      await this.purchaseService.usePromoCode(data.promoCode),
      user,
    );

    order.products = await this.basketService.updateProductsInOrder(
      order.products,
      statusId,
    );

    return this.createPurchaseFromUser(order, user);
  }
}
