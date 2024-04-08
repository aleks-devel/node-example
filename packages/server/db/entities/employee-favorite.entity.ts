import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { Employee } from "@server/db/entities/employee.entity";
import { FavoriteTarget } from "@server/db/types/favorite-target.enum";

@Entity("employees_favorites")
export class EmployeeFavorite {
  @PrimaryColumn({ unsigned: true })
  employeeId: number;

  @ManyToOne(() => Employee, (employee) => employee.favorites)
  employee: Employee;

  @PrimaryColumn({ type: "bigint", unsigned: true })
  targetId: string;

  @Column({ type: "int" })
  target: FavoriteTarget;
}
