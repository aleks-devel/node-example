import { Extensions, Field, Float, ID, ObjectType } from "@nestjs/graphql";
import { SubProductModel } from "@server/main-site/socials/models/sub-product.model";
import { SocialNetworkModel } from "./social-network.model";
import { IconMiddleware } from "@server/common/iconMiddleware";

@ObjectType()
export class SocialProductModel {
  @Field(() => ID)
  @Extensions({ alwaysSelect: true })
  id: string;

  @Field()
  orderIndex: number;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field({ middleware: [IconMiddleware] })
  icon: string;

  @Field()
  socialIcon: string;

  @Field()
  socialName: string;

  @Field()
  url: string;

  @Field()
  seoTitle: string;

  @Field()
  seoText: string;

  @Field()
  fullUrl: string;

  // @Field(() => nda)
  // type: nda;

  @Field()
  price: number;

  @Field(() => Float)
  minPrice: number;

  @Field()
  packageCount: number;

  @Field(() => Float)
  min: number;

  @Field(() => Float)
  max: number;

  @Field(() => [SubProductModel])
  subProducts: SubProductModel[];

  // nda
}
