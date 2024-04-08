import { Field, ID, ObjectType } from "@nestjs/graphql";
import { EditorDataType } from "@server/main-site/editor/entities/editor-data-type.enum";

/**
 * @deprecated
 */
@ObjectType()
export class EditorDataModel {
  @Field(() => ID)
  id: string;

  @Field()
  hashId: string;

  @Field()
  value: string;

  @Field({ nullable: true })
  attr?: string;

  @Field({ nullable: true })
  client?: boolean;

  @Field(() => EditorDataType)
  type: EditorDataType;
}
