import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { BasketItemModel_SERVER } from "@server/purchase/basket/models/basket-item.model";

@ObjectType()
export class BasketModel {
  @Field(() => ID)
  orderId: string;

  @Field(() => [BasketItemModel_SERVER])
  items: BasketItemModel_SERVER[];

  @Field(() => Int)
  itemsCnt: number;
}
