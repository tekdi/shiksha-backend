import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'Fields' })
export class Fields {

  @PrimaryColumn({ type: "uuid" })
  fieldId: string;

  @Column({ type: 'varchar' })
  assetId: string;

  @Column({ type: 'varchar' })
  context: string;

  @Column({ type: 'varchar' })
  groupId: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  label: string;

  @Column({ type: 'varchar' })
  defaultValue: string;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'text' })
  note: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  state: string;

  @Column({ type: 'boolean' })
  required: boolean;

  @Column({ type: 'int' })
  ordering: number;

  @Column({ type: 'text' })
  metadata: string;

  @Column({ type: 'varchar' })
  access: string;

  @Column({ type: 'boolean' })
  onlyUseInSubform: boolean;

  @Column({ type: 'uuid' })
  tenantId: string;

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

  @Column({ type: 'uuid' })
  contextId: string;

  @Column({ type: 'varchar' })
  render: string;

  @Column({ type: 'varchar' })
  contextType: string;

  @Column({ type: 'jsonb' })
  fieldParams: object;

  @Column({ type: 'jsonb', nullable: true })
  sourceDetails: any;

  @Column({ type: 'jsonb', nullable: true })
  fieldAttributes: any;

  @Column({ type: 'boolean' })
  dependsOn: boolean;
}
