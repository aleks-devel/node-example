import { Injectable } from "@nestjs/common";
import {
  ExtendedRepositoryService,
  InjectExtendedCustomRepo,
} from "@server/db/extended-repository.service";
import { Order } from "@server/purchase/entities/order.entity";
import { OrderProduct } from "@server/purchase/entities/order-product.entity";
import { StatusMatrix } from "@server/admin/discount-matrix/entities/status-matrix.entity";
import { DataSource, EntityManager, In, LessThanOrEqual } from "typeorm";
import { OrderStatus } from "@server/purchase/entities/purchase-related-statuses.enum";
import { PurchaseUserInfo } from "@server/purchase/utils/user.service";
import { PromoCode } from "@server/promo-code/entities/promo-code.entity";
import { NotFoundException } from "@server/common/exceptions/base-exceptions";
import { round } from "@server/common/utils/math-utils";
import { TransactionService } from "@server/db/transaction-service";

@Injectable()
export class PurchaseUtilsService extends TransactionService {
  constructor(
    @InjectExtendedCustomRepo(Order)
    private orderRepo: ExtendedRepositoryService<Order>,
    @InjectExtendedCustomRepo(StatusMatrix)
    private statusMatrixRepo: ExtendedRepositoryService<StatusMatrix>,
    @InjectExtendedCustomRepo(PromoCode)
    private promoCodeRepo: ExtendedRepositoryService<PromoCode>,
    dataSource: DataSource,
  ) {
    super(dataSource);
  }

  getForTransaction(manager: EntityManager) {
    return new PurchaseUtilsService(
      this.orderRepo.fromManager(manager),
      this.statusMatrixRepo.fromManager(manager),
      this.promoCodeRepo.fromManager(manager),
      manager.connection,
    );
  }

  async createOrder(promoCode: string | undefined, userId?: number) {
    return this.orderRepo.insertAndReturn({
      status: OrderStatus.waitForPayment,
      userId,
      netPrice: 0,
      cashback: 0,
      promoCode,
    });
  }

  async usePromoCode(code: string | undefined) {
    if (code === undefined) {
      return undefined;
    }

    const promoCode = await this.promoCodeRepo.findOneBy({
      code,
    });

    if (!promoCode || promoCode.isUnavailable) {
      throw new NotFoundException("promoCode");
    } else {
      await this.promoCodeRepo.update(
        { code: promoCode.code },
        { isUnavailable: true },
      );
    }

    return promoCode;
  }

  async getStatusId(code: PromoCode | undefined, user: PurchaseUserInfo) {
    const userStatusId = user.statusId;
    const referralStatusId = user.referralStatusId;
    const promoStatusId = code?.statusId;

    if (promoStatusId) {
      return promoStatusId;
    } else if (referralStatusId) {
      return referralStatusId;
    } else {
      return userStatusId;
    }
  }

  async getNewStatusId(totalSum: number) {
    const newStatus = await this.statusMatrixRepo.findOne({
      where: { isHidden: false, threshold: LessThanOrEqual(totalSum) },
      order: { threshold: "desc" },
    });
    return newStatus ? newStatus.id : undefined;
  }

  async getCashback(
    products: OrderProduct[],
    newStatusId: number | undefined,
    currentStatusId?: number,
  ) {
    // TODO: пакет?
    let cashback = 0;

    if (newStatusId === undefined || newStatusId === currentStatusId) {
      return cashback;
    }

    for (const product of products) {
      let statusValue = product.product.getStatusDiscount(newStatusId);

      if (currentStatusId) {
        const currentStatusVal =
          product.product.getStatusDiscount(currentStatusId);

        statusValue -= currentStatusVal;
      }

      if (statusValue > 0) {
        const totalWithoutDiscount =
          product.netPrice + product.discount + product.statusDiscount;
        cashback += totalWithoutDiscount * statusValue;
      }
    }

    return round(cashback, 2);
  }
}
