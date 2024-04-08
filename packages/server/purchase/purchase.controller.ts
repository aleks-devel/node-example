import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import {
  NewFastPurchaseFromUserDto,
  NewFastPurchaserDto,
  NewPurchaseDto,
  NewPurchaseFromUserDto,
} from "@server/purchase/dto/new-purchase.dto";
import { User } from "@server/common/user.decorator";
import { JwtAuthGuard } from "@server/user-auth/guards/jwt-auth.guard";
import { PurchaseUserService } from "@server/purchase/purchase-user.service";
import { PurchasePublicService } from "@server/purchase/purchase-public.service";

@Controller()
export class PurchaseController {
  constructor(
    private userPurchaseService: PurchaseUserService,
    private publicPurchaseService: PurchasePublicService,
  ) {}

  @Post("/purchase/one-click")
  async newFastPurchase(@Body() data: NewFastPurchaserDto) {
    return this.publicPurchaseService.runInTransaction(
      async (service: PurchasePublicService) => {
        return service.newFastPurchase(data);
      },
    );
  }

  @Post("/purchase")
  async newPurchase(@Body() data: NewPurchaseDto) {
    return this.publicPurchaseService.runInTransaction(
      async (service: PurchasePublicService) => {
        return service.newPurchase(data);
      },
    );
  }

  @Post("/user/purchase/one-click")
  @UseGuards(JwtAuthGuard)
  async newFastUserPurchase(
    @Body() data: NewFastPurchaseFromUserDto,
    @User() user: RequestUser,
  ) {
    return this.userPurchaseService.runInTransaction(
      async (service: PurchaseUserService) => {
        return service.newFastPurchaseFromUser(data, user);
      },
    );
  }

  @Post("/user/purchase")
  @UseGuards(JwtAuthGuard)
  async newUserPurchase(
    @Body() data: NewPurchaseFromUserDto,
    @User() user: RequestUser,
  ) {
    return this.userPurchaseService.runInTransaction(
      async (service: PurchaseUserService) => {
        return service.newPurchaseFromUser(data, user);
      },
    );
  }
}
