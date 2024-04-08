import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { OrderProduct } from "@server/purchase/entities/order-product.entity";
import { DispatchSupplier } from "@server/purchase/entities/dispatch-supplier.entity";
import { OrderProductStatus } from "@server/purchase/entities/purchase-related-statuses.enum";

@Entity("orders_sub_products")
export class OrderSubProduct {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id: string;

  @Column({ unsigned: true })
  productId: number;

  // @ManyToOne(() => nda, (product) => product.orders)
  // product: nda;

  @Column({ type: "int" })
  quantity: number;

  @Column({ type: "bigint", unsigned: true })
  orderProductId: string;

  @ManyToOne(() => OrderProduct, (order) => order.subProducts)
  orderProduct: OrderProduct;

  @Column({ type: "int", nullable: true })
  status: OrderProductStatus | null;

  @Column({ type: "json" })
  apiData: Record<string, any>;

  dispatchSuppliers: DispatchSupplier[];
}
