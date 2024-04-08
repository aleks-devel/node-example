import { ArgsType, Field } from "@nestjs/graphql";

@ArgsType()
export class EditorDataArgs {
  @Field(() => [String], { nullable: true })
  ids?: string[];

  @Field(() => [String], { nullable: true })
  hashIds?: string[];
}
