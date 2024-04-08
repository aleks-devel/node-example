import { Column, Entity, PrimaryColumn } from "typeorm";
import { Settings } from "@server/settings/entities/settings.enum";

@Entity()
export class Setting {
  @PrimaryColumn({ type: "varchar" })
  name: Settings;

  @Column()
  value: string;
}
