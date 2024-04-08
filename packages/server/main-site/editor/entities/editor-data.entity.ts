import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("editor_data")
export class EditorData {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column()
  dkey: string;

  @Column()
  type: string;

  @Column("json")
  data: Record<string, any>;

  @Column()
  isChanged: boolean;
}
