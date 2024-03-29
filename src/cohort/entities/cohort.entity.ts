import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from "typeorm";

@Entity({ name: "Cohort" })
export class Cohort {
  @PrimaryColumn({ type: "uuid" })
  cohortId: string;

  @Column({ nullable: true })
  parentId: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  referenceId: string;

  @Column({ nullable: true })
  metadata: string;

  @Column({ nullable: true })
  tenantId: string;

  @Column({ nullable: true })
  programId: string;

  @Column()
  attendanceCaptureImage: boolean;

  @CreateDateColumn({
    type: "timestamp with time zone",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: "timestamp with time zone",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @CreateDateColumn({
    type: "timestamp with time zone",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdBy: Date;

  @UpdateDateColumn({
    type: "timestamp with time zone",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedBy: Date;

}
