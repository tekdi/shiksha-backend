import { CohortMembers } from "src/cohortMembers/entities/cohort-member.entity";
import { FieldValues } from "src/fields/entities/fields-values.entity";
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  PrimaryGeneratedColumn,
  OneToMany,
} from "typeorm";

@Entity({ name: "Cohort" })
export class Cohort {
  @PrimaryGeneratedColumn('uuid')  
  cohortId: string;

  @Column({ nullable: true })
  parentId: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  status: boolean;

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

  @Column()
  createdBy: string;

  @Column()
  updatedBy: string;

  // @OneToMany(() => CohortMembers, cohortMembers => cohortMembers.cohortId)
  // cohortMembers: CohortMembers[];

  @OneToMany(() => CohortMembers, cohortMember => cohortMember.cohort)
  cohortMembers: CohortMembers[];

}
