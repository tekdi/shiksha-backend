import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "Programs" })
export class Programs {
  @PrimaryGeneratedColumn("uuid")
  programId: string;

  @Column()
  programName: string;
}
