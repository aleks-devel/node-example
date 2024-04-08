import { Field, Float, ID, ObjectType } from "@nestjs/graphql";
import { ReferralsDataModel } from "@server/user/models/referrals-data.model";

@ObjectType()
export class UserModel {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  fullName?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field(() => Float)
  balance: number;

  // @Field(() => nda, { nullable: true })
  // status?: nda;

  @Field()
  referralCode: string;

  @Field()
  referralUrl: string;

  @Field()
  referralsData: ReferralsDataModel;

  @Field(() => Float)
  totalOrdersSum: number;
}
