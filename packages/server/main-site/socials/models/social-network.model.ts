import { Extensions, Field, ID, ObjectType } from "@nestjs/graphql";
import { SocialNetworkIconsModel } from "@server/main-site/socials/models/social-network-icons.model";
import { SocialProductModel } from "@server/main-site/socials/models/social-product.model";

@ObjectType()
export class SocialNetworkModel {
  @Field(() => ID)
  @Extensions({ alwaysSelect: true })
  id: string;

  @Field()
  orderIndex: number;

  @Field()
  name: string;

  @Field()
  shortName: string;

  @Field(() => SocialNetworkIconsModel)
  @Extensions({ name: "icon" })
  icons: SocialNetworkIconsModel;

  @Field()
  seoTitle: string;

  @Field()
  seoText: string;

  @Field()
  url: string;

  @Field(() => [SocialProductModel])
  products: SocialProductModel[];
}
