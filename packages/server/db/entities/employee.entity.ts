import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { EmployeeAccess } from "@server/db/entities/employee-access.entity";
import { EmployeeFavorite } from "@server/db/entities/employee-favorite.entity";

@Entity()
@Unique(["login"])
export class Employee {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column()
  login: string;

  @Column()
  password: string;

  @Column()
  job: string;

  // nda

  @OneToMany(() => EmployeeAccess, (access) => access.employee)
  rights: EmployeeAccess[];

  @OneToMany(() => EmployeeFavorite, (favorite) => favorite.employee)
  favorites: EmployeeFavorite[];

  @Column({ type: "varchar", nullable: true })
  refreshToken: string | null;

  // nda
}
