import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { Request } from "express";
import { BadRequestException } from "@server/common/exceptions/base-exceptions";
import { PromoCodeService } from "@server/promo-code/promo-code.service";

@Controller("/promo")
export class PromoCodeController {
  constructor(private service: PromoCodeService) {}

  @Post("/use")
  async useCode(@Req() req: Request, @Body() data: {code: string}) {
    const clientId: string | null = req.cookies["clientId"];

    if (!clientId) {
      throw new BadRequestException("clientId");
    }

    const promoCode = await this.service.useCode(data.code, clientId);
    return { statusId: promoCode.statusId.toString() };
  }
}
