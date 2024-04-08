import {
  ArrayNotEmpty,
  IsDefined,
  IsNumberString,
  IsString,
} from "class-validator";
import { Optional } from "@server/common/utils/class-validator-utils";
import { BasketItem } from "@server/purchase/basket/models/basket-item.model";

export class NewFastPurchaseFromUserDto {
  @IsDefined()
  product: BasketItem;

  @IsString()
  @Optional()
  promoCode?: string;
}

export class NewPurchaseFromUserDto {
  @IsNumberString()
  orderId: string;

  @IsString()
  @Optional()
  promoCode?: string;
}

export class NewFastPurchaserDto {
  @IsDefined()
  product: BasketItem;

  @IsString()
  @Optional()
  promoCode?: string;
}

export class NewPurchaseDto {
  @ArrayNotEmpty()
  products: BasketItem[];

  @IsString()
  @Optional()
  promoCode?: string;
}