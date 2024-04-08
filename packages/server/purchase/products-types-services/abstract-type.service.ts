import { HttpService } from "@nestjs/axios";
import { BadRequestException } from "@server/common/exceptions/base-exceptions";
import { firstValueFrom } from "rxjs";
import { OrderProduct } from "@server/purchase/entities/order-product.entity";
import { OrderSubProduct } from "@server/purchase/entities/order-sub-product.entity";

import { getPaymentData } from "@server/purchase/utils/utils";
import { BasketItem } from "@server/purchase/basket/models/basket-item.model";

export abstract class AbstractTypeService {
  constructor(
    protected httpService: HttpService,
    protected orderData: BasketItem,
  ) {}

  abstract getConverter(): AbstractDataConverter;

  abstract getQuantity(): number;

  protected async validateUrl(urlParam: string) {
    let isUrlValid = true;

    let url = urlParam.trim();

    if (!url.match(/^https?:\/\//)) {
      url = `https://${url}`;
    }

    try {
      const parsedUrl = new URL(url);

      // Checking that this is not an IP address
      if (!parsedUrl.host.match(/[a-zA-Z]/g)) {
        isUrlValid = false;
      } else if (parsedUrl.host === process.env.APP_URL) {
        isUrlValid = false;
      } else {
        const res = await firstValueFrom(this.httpService.get(url));

        if (res.status < 200 || res.status >= 300) {
          isUrlValid = false;
        }
      }
    } catch (e) {
      isUrlValid = false;
    }

    if (!isUrlValid) {
      throw new BadRequestException("targetNotValid", `Target: ${url}`);
    }
  }

  protected validateNumber(quantity: any, fieldName: string) {
    const num = Number(quantity);

    if (isNaN(num) || num <= 0) {
      throw new BadRequestException(fieldName);
    } else {
      return num;
    }
  }

  abstract validate(isInPackage: boolean): Promise<void>;

  async writeToDb(product: any /*nda*/, statusId: number | undefined) {
    const quantity = this.getQuantity();

    return {
      ...getPaymentData(quantity, product, statusId),
      target: this.orderData.target,
      productId: product.id,
      apiData: this.getConverter().getDataForApi(this.orderData),
      product,
    } as PreOrderProduct;
  }
}

export abstract class AbstractDataConverter {
  abstract getDataForApi(orderData: BasketItem): object | null;

  abstract getDataFromOrderProduct(product: OrderProduct): BasketItem;
}

export type PreOrderProduct = Omit<
  OrderProduct,
  | "id"
  | "orderId"
  | "subProducts"
  | "items"
  | "order"
  | "dispatchSuppliers"
  | "package"
  | "packageId"
  | "status"
  | "discountMatrix"
> & {
  subProducts?: Omit<
    OrderSubProduct,
    | "id"
    | "orderProductId"
    | "status"
    | "product"
    | "orderProduct"
    | "dispatchSuppliers"
  >[];
  items?: PreOrderProduct[];
};
