import { ArgsType, Field, ID } from "@nestjs/graphql";

@ArgsType()
export class SocialProductsArgs {
  @Field(() => [ID], { nullable: true })
  ids?: string[];

  @Field({ nullable: true })
  search?: string;

  @Field({ nullable: true })
  showPackage?: boolean;
}