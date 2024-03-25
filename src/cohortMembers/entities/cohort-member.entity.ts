import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";

import { Cohort } from "../../cohort/entities/cohort.entity";

@Entity({ name: "CohortMembers" })
export class CohortMembers {
  @PrimaryGeneratedColumn("uuid")
  cohortMembershipId: string;

  @Column({ type: "varchar", length: 255 })
  role: string;

  @Column({ type: "uuid" })
  tenantId: string;

  @Column({ type: "uuid", nullable: true })
  cohortId: string | null;

  @Column({ type: "uuid" })
  userId: string;

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

  @Column({})
  createdBy: string;

  @Column({})
  updatedBy: string;

  @ManyToMany(() => Cohort, (cohort) => cohort.cohortMembers)
  @JoinTable({ name: "cohort_members_cohort" }) // Specify the join table name here
  cohorts: Cohort[];
}
