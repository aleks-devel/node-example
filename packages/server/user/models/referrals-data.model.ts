import { Field, Float, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ReferralsDataModel {
  @Field(() => Int)
  invited: number;

  @Field(() => Float)
  earned: number;
}