import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { OrderProduct } from "@server/purchase/entities/order-product.entity";
import { User } from "@server/user/entities/user.entity";
import {
  OrderStatus,
  PaymentMethods,
} from "@server/purchase/entities/purchase-related-statuses.enum";
import { OrderCancelReasons } from "@server/purchase/entities/order-cancel-reasons.enum";
import { PromoCode } from "@server/promo-code/entities/promo-code.entity";

@Entity()
export class Order {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id: string;

  @OneToMany(() => OrderProduct, (product) => product.order)
  products: OrderProduct[];

  @Column({ unsigned: true, nullable: true })
  userId: number | null;

  @ManyToOne(() => User, (user) => user.orders, { nullable: true })
  user: User | null;

  @Column({ type: "int" })
  status: OrderStatus;

  @Column({ type: "int", nullable: true })
  cancelReason: OrderCancelReasons | null;

  @Column({ type: "decimal" })
  netPrice: number;

  @Column({ type: "decimal" })
  cashback: number;

  @Column({ type: "varchar", nullable: true })
  @JoinColumn()
  promoCode: string | null;

  @ManyToOne(() => PromoCode, (code) => code.orders, { nullable: true })
  promo: PromoCode | null;

  @Column({ type: "int", nullable: true })
  paidFrom: PaymentMethods | null;

  @CreateDateColumn()
  createdAt: Date;
}
