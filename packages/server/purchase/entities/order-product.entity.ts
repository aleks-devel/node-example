import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Order } from "@server/purchase/entities/order.entity";
import { OrderSubProduct } from "@server/purchase/entities/order-sub-product.entity";
import { DispatchSupplier } from "@server/purchase/entities/dispatch-supplier.entity";
import { OrderProductStatus } from "@server/purchase/entities/purchase-related-statuses.enum";

@Entity("orders_products")
export class OrderProduct {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id: string;

  @Column({ unsigned: true })
  productId: number;

  // @ManyToOne(() => nda, (product) => product.ordered)
  // product: nda;

  @Column()
  target: string;

  @Column({ type: "decimal" })
  netPrice: number;

  // Decimal, not percent
  @Column({ type: "decimal" })
  discount: number;

  @Column({ type: "int", unsigned: true, nullable: true })
  discountMatrixId: number | null;

  // @ManyToOne(() => nda, (matrix) => matrix.orders)
  // discountMatrix: nda;

  // Decimal, not percent
  @Column({ type: "decimal" })
  statusDiscount: number;

  @Column({ type: "int" })
  quantity: number;

  @Column({ type: "bigint", unsigned: true })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.products)
  order: Order;

  @OneToMany(() => OrderSubProduct, (sub) => sub.orderProduct)
  subProducts: OrderSubProduct[];

  @Column({ type: "bigint", unsigned: true, nullable: true })
  packageId: string | null;

  @ManyToOne(() => OrderProduct, (product) => product.items, { nullable: true })
  package: OrderProduct | null;

  @Column({ type: "int", nullable: true })
  status: OrderProductStatus | null;

  @Column({ type: "json", nullable: true })
  apiData: Record<string, any> | null;

  @OneToMany(() => OrderProduct, (product) => product.package)
  items: OrderProduct[];

  dispatchSuppliers: DispatchSupplier[];
}
