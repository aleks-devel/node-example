import { Field, ObjectType } from "@nestjs/graphql";
import { IconMiddleware } from "@server/common/iconMiddleware";

@ObjectType()
export class SocialNetworkIconsModel {
  @Field({
    description: "Иконка по умолчанию, используется везде кроме футера",
    middleware: [IconMiddleware],
  })
  main: string;

  @Field({ description: "Иконка в футере", middleware: [IconMiddleware] })
  footer: string;
}
