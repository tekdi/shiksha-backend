import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'Fields', schema: 'public' })
export class Field {
  @PrimaryGeneratedColumn('uuid')
  fieldId: string;

  @Column({ type: 'varchar', nullable: true })
  assetId: string;

  @Column({ type: 'varchar' })
  context: string;

  @Column({ type: 'varchar', nullable: true })
  groupId: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  label: string;

  @Column({ type: 'varchar', nullable: true })
  defaultValue: string;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text' })
  state: string;

  @Column({ type: 'boolean' })
  required: boolean;

  @Column({ type: 'integer' })
  ordering: number;

  @Column({ type: 'text' })
  metadata: string;

  @Column({ type: 'varchar', nullable: true })
  access: string;

  @Column({ type: 'boolean' })
  onlyUseInSubform: boolean;

  @Column({ type: 'uuid' })
  tenantId: string;

  @CreateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', nullable: true })
  updatedBy: string;

  @Column({ type: 'uuid', nullable: true })
  contextId: string;

  @Column({ type: 'varchar', nullable: true })
  render: string;

  @Column({ type: 'varchar', nullable: true })
  contextType: string;

  @Column({ type: 'jsonb', nullable: true })
  fieldParams: object;
}
