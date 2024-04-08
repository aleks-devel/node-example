import { OnEvent } from "@nestjs/event-emitter";
import { TransactionType } from "@server/payments/entities/transaction-types.enum";
import { PaymentTransaction } from "@server/payments/entities/payment-transaction.entity";
import { FulfillmentService } from "@server/purchase/fulfillment/fulfillment.service";

const test =
  process.env.APP_ENV === "staging" || process.env.APP_ENV === "development"
    ? ".test"
    : "";

export class FulfillmentController {
  constructor(private service: FulfillmentService) {}

  @OnEvent(`transaction.${TransactionType.orderPaymentGate}.succeeded${test}`)
  async onSuccessOrderPayment(data: PaymentTransaction) {
    return this.service.runInTransaction((service: FulfillmentService) => {
      return service.startFulfillment(data.toId);
    });
  }

  @OnEvent(`transaction.${TransactionType.orderPaymentGate}.canceled${test}`)
  async onCanceledOrderPayment(data: PaymentTransaction) {
    return this.service.runInTransaction((service: FulfillmentService) => {
      return service.cancelOrder(data.toId);
    });
  }
}
