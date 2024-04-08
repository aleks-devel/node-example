import { Field, InputType } from "@nestjs/graphql";
import { IsEmail } from "class-validator";

@InputType()
export class UpdateUserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field()
  name: string;
}
