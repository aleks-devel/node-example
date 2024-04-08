import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { Order } from "@server/purchase/entities/order.entity";
import { UserReferral } from "@server/user/entities/user-referral.entity";

@Entity()
@Unique(["email"])
export class User {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column()
  email: string;

  @Column({ type: "varchar", nullable: true })
  fullName: string | null;

  @Column()
  password: string;

  @Column({ type: "varchar", nullable: true })
  avatar: string | null;

  @Column({ type: "double", default: 0 })
  balance: number;

  @Column({ type: "int", unsigned: true, nullable: true })
  statusId: number | null;

  // @ManyToOne(() => nda, (status) => status.users, { nullable: true })
  // status: nda | null;

  @Column()
  referralCode: string;

  @Column({ type: "varchar", nullable: true })
  refreshToken: string | null;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => UserReferral, (ref) => ref.referral, { nullable: true })
  referralData: UserReferral | null;

  @OneToMany(() => UserReferral, (ref) => ref.referer)
  referralsData: UserReferral[];

  @CreateDateColumn()
  createdAt: Date;
}
