import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from "typeorm";
import { Client } from "@server/client-metric/entities/client.entity";
import { Order } from "@server/purchase/entities/order.entity";

@Entity()
export class PromoCode {
  @PrimaryColumn()
  code: string;

  @Column()
  @JoinColumn()
  clientId: string;

  @OneToOne(() => Client, (client) => client.promoCode)
  client: Client;

  @Column({ unsigned: true })
  statusId: number;

  // @ManyToOne(() => nda, (status) => status.promoCodes)
  // status: nda;

  @Column({ default: false })
  isUnavailable: boolean;

  @OneToMany(() => Order, (order) => order.promo)
  orders: Order[];
}
