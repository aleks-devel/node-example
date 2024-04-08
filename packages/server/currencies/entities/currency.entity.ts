import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";

@Entity("currencies")
export class Currency {
  @PrimaryColumn()
  code: string;

  @Column({ default: "" })
  name: string;

  @Column({ type: "double", nullable: true })
  rateToUsd: number | null;

  @Column({ default: 0, type: "double" })
  addedValue: number;

  // @OneToMany(() => nda, (supplier) => supplier.currency)
  // suppliers: nda[];
}
