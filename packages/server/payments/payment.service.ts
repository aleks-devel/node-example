import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import {
  ExtendedRepositoryService,
  InjectExtendedCustomRepo,
} from "@server/db/extended-repository.service";
import { User } from "@server/user/entities/user.entity";
import { BadRequestException } from "@server/common/exceptions/base-exceptions";
import { EntityManager } from "typeorm";
import { round } from "@server/common/utils/math-utils";
import { PaymentTransaction } from "@server/payments/entities/payment-transaction.entity";
import { TransactionStatus } from "@server/payments/entities/transaction-status.enum";
import { TransactionCancelReasons } from "@server/payments/entities/transaction-cancel-reasons.enum";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { AxiosError } from "axios";

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private httpService: HttpService,
    @InjectExtendedCustomRepo(User)
    private userRepo: ExtendedRepositoryService<User>,
    @InjectExtendedCustomRepo(PaymentTransaction)
    private transactionRepo: ExtendedRepositoryService<PaymentTransaction>,
    private eventEmitter: EventEmitter2,
  ) {}

  public getForTransaction(manager: EntityManager) {
    return new PaymentService(
      this.httpService,
      this.userRepo.fromManager(manager),
      this.transactionRepo.fromManager(manager),
      this.eventEmitter,
    );
  }

  // nda

  // nda

  async createPayment(
    amount: number,
    type: "nda", // TransactionType.,
    toId: string,
    products: { description: string; netPrice: number; quantity: number }[],
  ): Promise<string | undefined>;
  async createPayment(
    amount: number,
    type: "nda", //TransactionType.,
    toId: string,
  ): Promise<string | undefined>;
  async createPayment(
    amount: number,
    type: "nda", //TransactionType. | TransactionType.,
    toId: string,
    products?: { description: string; netPrice: number; quantity: number }[],
  ): Promise<string | undefined> {
    let receiptItems;

    if (type === "nda" /*TransactionType.*/) {
      if (!products) {
        throw new BadRequestException("products.undefined");
      }

      receiptItems = "nda";
    } else {
      receiptItems = "nda";
    }

    try {
      // const response = await firstValueFrom(
      //   // nda
      // );
      await this.transactionRepo.insert({
        amount,
        status: TransactionStatus.pending,
        type: type as any,
        toId,
        fromId: 0 as any,
      });
      return "nda";
    } catch (e) {
      if (e instanceof AxiosError) {
        this.logger.error(
          `createPayment - Error on sending payment to nda. Response: ${JSON.stringify(
            e.response,
          )}`,
        );
      } else {
        this.logger.error(`createPayment - Unknown error. Error: ${e}`);
      }

      await this.transactionRepo.insert({
        amount,
        status: TransactionStatus.canceled,
        cancelReason: TransactionCancelReasons.errorOnResponse,
        type: type as any,
        toId,
        fromId: null,
      });
      return undefined;
    }
  }

  async purchaseFromUserBalance(
    userId: number,
    orderId: string,
    sum: number,
  ): Promise<number> {
    if (
      !this.userRepo.queryRunner?.isTransactionActive ||
      !this.transactionRepo.queryRunner?.isTransactionActive
    ) {
      return this.userRepo.manager.transaction(async (manager) => {
        const service = this.getForTransaction(manager);
        return service.purchaseFromUserBalance(userId, orderId, sum);
      });
    }

    const user = await this.userRepo.findOneByOrFail({
      id: userId,
    });

    const roundSum = round(sum, 2);

    if (user.balance < roundSum) {
      throw new BadRequestException("notEnoughFounds");
    }

    const newBalance = round(user.balance - roundSum, 2);

    await this.userRepo.update({ id: userId }, { balance: newBalance });
    await this.transactionRepo.insert({
      amount: roundSum,
      status: TransactionStatus.done,
      type: "nda" as any /*TransactionType.*/,
      toId: orderId,
      fromId: userId.toString(),
    });

    return user.balance - roundSum;
  }

  async paymentNotification(paymentId: string) {
    const paymentObj = "nda" as any;

    if (paymentObj.status === ("nda" as any) /*PaymentStatus.*/) {
      return;
    } else if (paymentObj.status === "nda" /*PaymentStatus.*/) {
      throw new BadRequestException("unsupported");
    }

    const transaction = await this.transactionRepo.updateAndReturnOrFail(
      { fromId: paymentObj.id },
      {
        status:
          paymentObj.status === "nda" /*PaymentStatus.*/
            ? TransactionStatus.done
            : TransactionStatus.canceled,
        cancelReason:
          paymentObj.status === "nda" /*PaymentStatus.*/ ? null : null,
      },
    );

    let event = `transaction.${transaction.type}.`;

    if (paymentObj.status === "nda"/*PaymentStatus.*/) {
      event += "succeeded";
    } else if (paymentObj.status === "nda"/*PaymentStatus.*/) {
      event += "canceled";
    } else {
      throw new BadRequestException("event");
    }

    if (paymentObj.test) {
      event += ".test";
    }

    await this.eventEmitter.emitAsync(event, {
      transaction,
    });
  }
}
