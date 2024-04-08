import { Field, ID, Int, ObjectType } from "@nestjs/graphql";

enum ProductType {
  nda = "nda"
}

@ObjectType("ReactionModel")
export class ReactionModel_SERVER {
  @Field(() => ID)
  subProductId: string;

  @Field()
  quantity: number;
}

@ObjectType("PackageItemModel")
export class PackageItemModel_SERVER {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  productId: string;

  @Field(() => ProductType)
  type: Exclude<ProductType, ProductType.nda>;

  @Field({ nullable: true })
  quantity?: number;

  @Field({ nullable: true })
  postsQuantity?: number;

  @Field(() => Int, { nullable: true })
  voteFor?: number;

  @Field(() => [ReactionModel_SERVER], { nullable: true })
  reactions?: ReactionModel_SERVER[];

  @Field(() => [String], { nullable: true })
  comments?: string[];
}

/**
 * На фронте лучше использовать BasketItem, а не этот класс
 * @see BasketItem
 */
@ObjectType("BasketItemModel")
export class BasketItemModel_SERVER {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  productId: string;

  @Field(() => String)
  target: string;

  @Field(() => ProductType)
  type: ProductType;

  @Field({ nullable: true })
  quantity?: number;

  @Field({ nullable: true })
  postsQuantity?: number;

  @Field(() => Int, { nullable: true })
  voteFor?: number;

  @Field(() => [ReactionModel_SERVER], { nullable: true })
  reactions?: ReactionModel_SERVER[];

  @Field(() => [String], { nullable: true })
  comments?: string[];

  @Field(() => [PackageItemModel_SERVER], { nullable: true })
  items?: PackageItemModel_SERVER[];
}

// export type InPackage<
//   T extends
// > = Omit<T, "target">;

// export type PackageItem = InPackage<
// >;

export type BasketItem = any; // nda

export type BasketProduct = {
  productId: string;
  target: string;
};

type BasketProductWithQuantity = BasketProduct & { quantity: number };
