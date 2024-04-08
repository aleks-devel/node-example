import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { PaymentService } from "@server/payments/payment.service";

@Controller("/payments")
export class PaymentController {
  constructor(private service: PaymentService) {}

  // nda
}
