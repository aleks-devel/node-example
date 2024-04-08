import { Injectable } from "@nestjs/common";
import {
  ExtendedRepositoryService,
  InjectExtendedCustomRepo,
} from "@server/db/extended-repository.service";
import { User } from "@server/user/entities/user.entity";
import { TransactionService } from "@server/db/transaction-service";
import { DataSource, EntityManager } from "typeorm";
import { Order } from "@server/purchase/entities/order.entity";

export type PurchaseUserInfo = {
  id: number;
  statusId?: number;
  referralStatusId?: number;
  balance: number;
  ordersCnt: number;
  totalPayed: number;
};

@Injectable()
export class UserService extends TransactionService {
  constructor(
    @InjectExtendedCustomRepo(User)
    private userRepo: ExtendedRepositoryService<User>,
    @InjectExtendedCustomRepo(Order)
    private orderRepo: ExtendedRepositoryService<Order>,
    dataSource: DataSource,
  ) {
    super(dataSource);
  }

  getForTransaction(manager: EntityManager) {
    return new UserService(
      this.userRepo.fromManager(manager),
      this.orderRepo.fromManager(manager),
      manager.connection,
    );
  }

  async getUserInfo(requestUser: RequestUser) {
    const user = await this.userRepo.findOneOrFail({
      where: {
        id: requestUser.id,
      },
      relations: {
        status: true,
        referralData: true,
      },
    });

    const ordersInfo = await this.orderRepo
      .createQueryBuilder("order")
      .select("COUNT(total)", "count")
      .addSelect("SUM(total)", "sum")
      .where("order.userId = :userId", { userId: requestUser.id })
      .getRawOne();

    const userInfo = {
      id: user.id,
      statusId: user.statusId ?? undefined,
      balance: user.balance,
      ordersCnt: ordersInfo.count,
      totalPayed: ordersInfo.sum ?? 0,
    } as PurchaseUserInfo;

    if (user.referralData && !user.referralData.firstStatusEndDate) {
      userInfo.referralStatusId = user.referralData.firstStatusId;
    }

    return userInfo;
  }

  async setNewStatus(userId: number, newStatusId: number) {
    await this.userRepo.update({ id: userId }, { statusId: newStatusId });
  }
}
