import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { OrderProductSupplierStatus } from "@server/purchase/entities/purchase-related-statuses.enum";

@Entity()
export class DispatchSupplier {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id: string;

  @Column({ type: "bigint", unsigned: true })
  orderProductId: string;

  @Column()
  isSubProduct: boolean;

  @Column({ type: "bigint", unsigned: true })
  serviceId: string;

  // service: nda;

  // @ManyToOne(() => nda, (supplier) => supplier.orders)
  // supplier: nda;

  @Column({ type: "varchar", nullable: true })
  supplierOrderId: string | null;

  @Column({ type: "int" })
  status: OrderProductSupplierStatus;

  @CreateDateColumn()
  createdAt: Date;
}
