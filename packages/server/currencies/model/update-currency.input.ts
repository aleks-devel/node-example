import { Field, Float, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateCurrencyInput {
  @Field()
  code: string;

  @Field(() => Float)
  rateToUsd: number;

  @Field(() => Float)
  addedValue: number;
}
