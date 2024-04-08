
import {
  BadRequestException,
  NotFoundException,
} from "@server/common/exceptions/base-exceptions";
import {
  ExtendedRepositoryService,
  InjectExtendedCustomRepo,
} from "@server/db/extended-repository.service";
import { Injectable } from "@nestjs/common";
import {
  BasketItem,
} from "@server/purchase/basket/models/basket-item.model";

@Injectable()
export class BasketProductsService {
  constructor(
  ) {}

  private getProductsIds(products: (BasketItem /*| nda*/)[]): number[] {
    const ids = products.reduce((ids, item) => {
      const id = Number(item.productId);

      if (isNaN(id)) throw new BadRequestException("item.id");

      if (item.type === "nda" as any) {
        return [...ids, ...this.getProductsIds(item.items), id];
      }

      return [...ids, id];
    }, [] as number[]);

    return ids.reduce((accum: any, id: any) => {
      if (accum.includes(id)) {
        return accum;
      } else {
        return [...accum, id];
      }
    }, [] as number[]);
  }

  private async getProductsFromBasket(basketProducts: BasketItem[]) {
    const productsIds = this.getProductsIds(basketProducts);

    const products = "nda" as any /*await this.ndaRepo*/;

    if (products.length < productsIds.length) {
      throw new NotFoundException("item");
    }

    return new Map(products.map((product: any) => [product.id.toString(), product]));
  }

  private validateProducts(productsMap: any) {
    // nda
  }

  public async getProductsMap(products: BasketItem[]) {
    const productsMap = await this.getProductsFromBasket(products);
    this.validateProducts(productsMap);
    return productsMap;
  }
}
