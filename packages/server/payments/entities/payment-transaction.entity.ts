import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { TransactionType } from "@server/payments/entities/transaction-types.enum";
import { TransactionStatus } from "@server/payments/entities/transaction-status.enum";

@Entity()
export class PaymentTransaction {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "double" })
  amount: number;

  @Column({ type: "tinyint" })
  status: TransactionStatus;

  @Column({ type: "varchar", nullable: true })
  cancelReason: string | null;

  @Column({ type: "varchar" })
  type: TransactionType;

  @Column({ type: "varchar" })
  toId: string;

  @Column({ type: "varchar", nullable: true })
  fromId: string | null;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
