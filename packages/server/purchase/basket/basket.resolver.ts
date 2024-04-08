import { Query, Resolver } from "@nestjs/graphql";
import { BasketModel } from "@server/purchase/basket/models/basket.model";
import { UseGuards } from "@nestjs/common";
import { WeekJwtAuthGuard } from "@server/user-auth/guards/week-jwt-auth.guard";
import { User } from "@server/common/user.decorator";
import { BasketService } from "@server/purchase/basket/basket.service";

@Resolver(() => BasketModel)
export class BasketResolver {
  constructor(private service: BasketService) {}

  @UseGuards(WeekJwtAuthGuard)
  @Query(() => BasketModel, { nullable: true })
  async basket(@User() user?: RequestUser): Promise<BasketModel | null> {
    return this.service.getBasket(user);
  }
}
