import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from "typeorm";
import { User } from "@server/user/entities/user.entity";

@Entity("users_referrals_data")
export class UserReferral {
  @PrimaryColumn({ unsigned: true })
  referralId: number;

  @OneToOne(() => User, (user) => user.referralData)
  @JoinColumn()
  referral: User;

  @Column({ unsigned: true })
  refererId: number;

  @ManyToOne(() => User, (user) => user.referralsData)
  referer: User;

  @Column({ unsigned: true })
  @JoinColumn()
  firstStatusId: number;

  // @ManyToOne(() => nda)
  // firstStatus: nda;

  @Column()
  firstStatusEndOrdersCnt: number;

  @Column({ type: "datetime", nullable: true })
  firstStatusEndDate: Date | null;

  @Column({ type: "double" })
  refererPercent: number;
}
