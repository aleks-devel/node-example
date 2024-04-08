import { Field, Float, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class CurrencyModel {
  @Field()
  code: string;

  @Field()
  name: string;

  @Field(() => Float)
  rateToUsd: number;

  @Field(() => Float)
  addedValue: number;
}
