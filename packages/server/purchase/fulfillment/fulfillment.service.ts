import { Injectable, Logger } from "@nestjs/common";
import { OrderProduct } from "@server/purchase/entities/order-product.entity";
import {
  ExtendedRepositoryService,
  InjectExtendedCustomRepo,
} from "@server/db/extended-repository.service";
import { DataSource, EntityManager, IsNull } from "typeorm";
import { TransactionService } from "@server/db/transaction-service";
import { DispatchSupplier } from "@server/purchase/entities/dispatch-supplier.entity";
import {
  InjectSortedCustomRepo,
  SortedRepository,
} from "@server/db/sorted-repository.service";
import { firstValueFrom } from "rxjs";
import {
  OrderProductStatus,
  OrderProductSupplierStatus,
  OrderStatus,
  SupplierStatuses,
} from "@server/purchase/entities/purchase-related-statuses.enum";
import { Cron, CronExpression } from "@nestjs/schedule";
import { OrderSubProduct } from "@server/purchase/entities/order-sub-product.entity";
import { Order } from "@server/purchase/entities/order.entity";
import { OrderCancelReasons } from "@server/purchase/entities/order-cancel-reasons.enum";

export type MergedData = {
  product: OrderSubProduct | OrderProduct;
  sub: boolean;
};

type FetchStatusData = {
  key: string;
  url: string;
  ids: string[];
};

type ResultStatus = "done" | "partial" | "canceled" | "waitForSupplier";

@Injectable()
export class FulfillmentService extends TransactionService {
  private readonly logger = new Logger(FulfillmentService.name);

  constructor(
    @InjectExtendedCustomRepo(Order)
    private orderRepo: ExtendedRepositoryService<Order>,
    @InjectExtendedCustomRepo(OrderProduct)
    private orderProductRepo: ExtendedRepositoryService<OrderProduct>,
    @InjectExtendedCustomRepo(OrderSubProduct)
    private orderSubProdRepo: ExtendedRepositoryService<OrderSubProduct>,
    // @InjectExtendedCustomRepo(nda)
    // private subProductRepo: ExtendedRepositoryService<nda>,
    @InjectExtendedCustomRepo(DispatchSupplier)
    private dispatchSupRepo: ExtendedRepositoryService<DispatchSupplier>,
    // @InjectSortedCustomRepo(nda)
    // private productSupplierRepo: SortedRepository<nda>,
    // private apiService: nda,
    dataSource: DataSource,
  ) {
    super(dataSource);
  }

  getForTransaction(manager: EntityManager) {
    return new FulfillmentService(
      this.orderRepo.fromManager(manager),
      this.orderProductRepo.fromManager(manager),
      this.orderSubProdRepo.fromManager(manager),
      // this.subProductRepo.fromManager(manager),
      this.dispatchSupRepo.fromManager(manager),
      // this.productSupplierRepo.fromManager(manager),
      // this.apiService,
      manager.connection,
    );
  }

  async sendSupportTicket(reason: "noSuppliers" | "allSuppliersDeclined") {
    // nda
  }

  async updateProductStatus(
    productId: string,
    isSub: boolean,
    newStatus: OrderProductStatus,
  ) {
    const args = [{ id: productId }, { status: newStatus }] as const;

    if (isSub) {
      await this.orderSubProdRepo.update(...args);
    } else {
      await this.orderProductRepo.update(...args);
    }
  }

  async trySuppliers(
    product: OrderProduct | OrderSubProduct,
    isSub: boolean,
    skipServicesIds?: string[],
  ) {
    // nda
  }

  getMergedData(products: OrderProduct[]) {
    // nda
  }

  async startFulfillment(orderId: string) {
    // nda
  }

  async cancelOrder(orderId: string) {
    // nda
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkProgress() {
    // nda
  }
}
