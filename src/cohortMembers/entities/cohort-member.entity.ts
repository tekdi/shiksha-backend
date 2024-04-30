import { Cohort } from "src/cohort/entities/cohort.entity";
import { FieldValues } from "src/fields/entities/fields-values.entity";
import { User } from "src/user/entities/user-entity";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  JoinColumn,
  ManyToOne,
} from "typeorm";

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

  @ManyToOne(() => Cohort, cohort => cohort.cohortMembers)
  @JoinColumn({ name: 'cohortId' })
  cohort: Cohort;

  @ManyToOne(() => User, user => user.cohortMembers)
  @JoinColumn({ name: 'userId' })
  user: User;

 
}
