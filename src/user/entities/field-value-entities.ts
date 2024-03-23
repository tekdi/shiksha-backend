import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
// import { Field } from './Field'; // Assuming you have a Field entity defined

@Entity({ name: 'FieldValues' })
export class FieldValue {
    @PrimaryGeneratedColumn('uuid', { name: 'fieldValuesId' })
    fieldValuesId: string;

    @Column({ type: 'text', nullable: false })
    value: string;

    @Column({ type: 'uuid', nullable: false, default: () => 'gen_random_uuid()' })
    itemId: string;

    @Column({ type: 'uuid', nullable: false, name: 'fieldId' })
    fieldId: string;

    // @ManyToOne(() => Field, field => field.fieldValues)
    // @JoinColumn({ name: 'fieldId' })
    // field: Field;

    @CreateDateColumn({ name: 'createdAt', type: 'timestamp with time zone' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp with time zone' })
    updatedAt: Date;

    @Column({ type: 'text', nullable: true, name: 'createdBy' })
    createdBy: string;

    @Column({ type: 'text', nullable: true, name: 'updatedBy' })
    updatedBy: string;
}
