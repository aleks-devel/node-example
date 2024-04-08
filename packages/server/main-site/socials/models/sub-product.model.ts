import { Extensions, Field, ID, ObjectType } from "@nestjs/graphql";
import { IconMiddleware } from "@server/common/iconMiddleware";

@ObjectType()
export class SubProductModel {
  @Field(() => ID)
  @Extensions({ alwaysSelect: true })
  id: string;

  @Field()
  orderIndex: number;

  @Field()
  name: string;

  @Field({ nullable: true, middleware: [IconMiddleware] })
  icon?: string;

  @Field()
  packageCount: number;
}
