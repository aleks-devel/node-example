import { Field, InputType } from "@nestjs/graphql";
import { Equals, IsEmail } from "class-validator";

@InputType()
export class NewUserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  password: string;

  @Field()
  @Equals(true)
  agreement: boolean;

  @Field()
  subscription: boolean;
}
