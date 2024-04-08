import { Injectable } from "@nestjs/common";
import { BasketProductsService } from "@server/purchase/basket/basket-products.service";
import {
  ExtendedRepositoryService,
  InjectExtendedCustomRepo,
} from "@server/db/extended-repository.service";
import { Order } from "@server/purchase/entities/order.entity";
import { OrderProduct } from "@server/purchase/entities/order-product.entity";
import { OrderSubProduct } from "@server/purchase/entities/order-sub-product.entity";
import { BadRequestException } from "@server/common/exceptions/base-exceptions";
import {
  AbstractTypeService,
  PreOrderProduct,
} from "@server/purchase/products-types-services/abstract-type.service";
import { HttpService } from "@nestjs/axios";
import { EntityManager, IsNull } from "typeorm";
import {
  findDIff,
  getPaymentData,
  PaymentData,
} from "@server/purchase/utils/utils";
import {
  BasketItem,
  BasketItemModel_SERVER,
  PackageItemModel_SERVER,
} from "@server/purchase/basket/models/basket-item.model";
import { OrderStatus } from "@server/purchase/entities/purchase-related-statuses.enum";

@Injectable()
export class BasketService {
  public static productsServices = {
  };

  static productsConverters = {
  };

  constructor(
    private httpService: HttpService,
    private productsService: BasketProductsService,
    @InjectExtendedCustomRepo(Order)
    private orderRepo: ExtendedRepositoryService<Order>,
    @InjectExtendedCustomRepo(OrderProduct)
    private orderProductRepo: ExtendedRepositoryService<OrderProduct>,
    @InjectExtendedCustomRepo(OrderSubProduct)
    private orderSubProductRepo: ExtendedRepositoryService<OrderSubProduct>,
  ) {}

  public getForTransaction(manager: EntityManager) {
    return new BasketService(
      this.httpService,
      this.productsService,
      this.orderRepo.fromManager(manager),
      this.orderProductRepo.fromManager(manager),
      this.orderSubProductRepo.fromManager(manager),
    );
  }

  private async getPackageEntity(
    item: any/*nda*/,
    statusId: number | undefined,
  ): Promise<Omit<PreOrderProduct, "product">> {
    const hasChildPackage = item.items.some((e: any) => "items" in e);
    if (hasChildPackage) {
      throw new BadRequestException("packageInPackage");
    }

    const packageEntities = await this.getOrderProductsEntities(
      item.items.map((i: any) => ({ ...i, target: item.target }) as BasketItem),
      statusId,
    );

    const total = packageEntities.reduce((accum, val) => ({
      ...accum,
      discount: accum.discount + val.discount,
      statusDiscount: accum.statusDiscount + val.statusDiscount,
      quantity: accum.quantity + val.quantity,
      netPrice: accum.netPrice + val.netPrice,
    }));

    return {
      discount: total.discount,
      discountMatrixId: null,
      statusDiscount: total.statusDiscount,
      quantity: total.quantity,
      target: item.target,
      productId: Number(item.productId),
      netPrice: total.netPrice,
      apiData: null,
      items: packageEntities,
    };
  }

  private async getOrderProductsEntities(
    items: BasketItem[],
    statusId: number | undefined,
  ): Promise<PreOrderProduct[]> {
    const products = await this.productsService.getProductsMap(items);
    const entities: PreOrderProduct[] = [];

    for (const item of items) {
      const product = products.get(item.productId);

      if (!product) throw new BadRequestException("product.unknown");

      if (item.type === "nda") {
        const packageEntity = await this.getPackageEntity(item, statusId);
        entities.push({
          ...packageEntity,
          product,
        });
      } else {
        // const serviceClass = BasketService.productsServices[item.type]; nda
        //
        // if (!serviceClass) throw new BadRequestException("type.unknown");
        //
        // const service = new serviceClass(
        //   this.httpService,
        //   item,
        // ) as AbstractTypeService;
        //
        // await service.validate(true);
        //
        // entities.push(await service.writeToDb(product, statusId));
      }
    }

    return entities;
  }

  private async writeEntitiesToDb(
    entities: PreOrderProduct[],
    orderId: string,
  ) {
    const resEntities: OrderProduct[] = [];

    for (const entity of entities) {
      const resEntity = {
        ...entity,
        orderId: orderId,
      } as OrderProduct;

      const insertRes = await this.orderProductRepo.insert(resEntity);
      resEntity.id = insertRes.identifiers[0].id;

      if (entity.subProducts && entity.subProducts.length > 0) {
        resEntity.subProducts = [];

        for (const sub of entity.subProducts) {
          const subInsertRes = await this.orderSubProductRepo.insert({
            ...sub,
            orderProductId: resEntity.id,
          });

          resEntity.subProducts.push({
            ...sub,
            id: subInsertRes.identifiers[0].id,
            orderProductId: resEntity.id,
          } as OrderSubProduct);
        }
      }

      if (entity.items && entity.items.length > 0) {
        const packageItems = entity.items.map((i) => ({
          ...i,
          packageId: resEntity.id,
        }));
        resEntity.items = await this.writeEntitiesToDb(packageItems, orderId);
      }

      resEntities.push(resEntity);
    }

    return resEntities;
  }

  async addProductsToOrder(
    orderId: string,
    items: BasketItem[],
    statusId: number | undefined,
  ) {
    const entities = await this.getOrderProductsEntities(items, statusId);
    return this.writeEntitiesToDb(entities, orderId);
  }

  async addProductToOrder(
    orderId: string,
    item: BasketItem,
    statusId: number | undefined,
  ) {
    const entities = await this.getOrderProductsEntities([item], statusId);
    const products = await this.writeEntitiesToDb(entities, orderId);
    return products[0];
  }

  async updateProductsInOrder(
    products: OrderProduct[],
    statusId: number | undefined,
  ) {
    const updatedProducts: OrderProduct[] = [];

    for (const product of products) {
      if (product.items.length > 0) {
        await this.updateProductsInOrder(product.items, statusId);
      } else {
        const oldPaymentData: PaymentData = {
          discount: product.discount,
          discountMatrixId: product.discountMatrixId,
          statusDiscount: product.statusDiscount,
          quantity: product.quantity,
          netPrice: product.netPrice,
        };
        const newPaymentData = getPaymentData(
          product.quantity,
          product.product,
          statusId,
        );
        const diff = findDIff(oldPaymentData, newPaymentData);

        if (diff !== undefined) {
          await this.orderProductRepo.update({ id: product.id }, diff);

          updatedProducts.push({
            ...product,
            ...newPaymentData,
          });
        }
      }
    }

    return updatedProducts;
  }

  getBasketItemFromProduct(
    product: OrderProduct,
    inPackage?: false,
  ): BasketItemModel_SERVER;
  getBasketItemFromProduct(
    product: OrderProduct,
    inPackage: true,
  ): PackageItemModel_SERVER;
  getBasketItemFromProduct(
    product: OrderProduct,
    inPackage?: boolean,
  ): BasketItemModel_SERVER | PackageItemModel_SERVER {
    const { type } = product.product;
    let data: BasketItemModel_SERVER | PackageItemModel_SERVER;

    if (type === "nda") {
      data = {
        ...new BasketItemModel_SERVER(),
        type: "nda" as any,
        target: product.target,
        productId: product.productId.toString(),
        items: product.items.map((item) => ({
          ...new PackageItemModel_SERVER(),
          ...this.getBasketItemFromProduct(item, true),
        })),
      };
    } else {
      data = "test" as any; // nda
      // const converterClass = BasketService.productsConverters[type];
      // const converter = new converterClass();
      //
      // const model = inPackage
      //   ? new nda()
      //   : new BasketItemModel_SERVER();
      //
      // data = {
      //   ...model,
      //   ...converter.getDataFromOrderProduct(product),
      // };
    }

    return data;
  }

  async getBasket(user: RequestUser | undefined) {
    if (!user) {
      return null;
    }

    const order = await this.orderRepo.findOne({
      where: {
        status: OrderStatus.stillOrdering,
        userId: user.id,
        products: {
          packageId: IsNull(),
        },
      },
      relations: {
        products: {
          subProducts: true,
          items: true,
          product: true,
        },
      },
    });

    if (!order) return null;

    return {
      orderId: order.id,
      items: order.products.map((product) =>
        this.getBasketItemFromProduct(product),
      ),
      itemsCnt: order.products.length,
    };
  }
}
