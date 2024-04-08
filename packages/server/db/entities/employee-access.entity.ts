import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { Employee } from "@server/db/entities/employee.entity";
import { JoinColumn } from "typeorm";
import { AccessRule } from "@server/db/types/access-rights";

@Entity("employees_access")
export class EmployeeAccess {
  @PrimaryColumn({ unsigned: true })
  @JoinColumn()
  employeeId: number;

  @ManyToOne(() => Employee, (employee) => employee.rights)
  employee: Employee;

  @PrimaryColumn({ type: "int" })
  accessRule: AccessRule;
}
