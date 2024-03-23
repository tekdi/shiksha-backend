import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
// import { Field } from './Field'; // Assuming you have a Field entity defined

@Entity({ name: 'FieldValues' })
export class FieldValues {

    @Column({ type: 'text', nullable: false })
    value: string;

    @PrimaryGeneratedColumn('uuid', { name: 'fieldValuesId' })
    fieldValuesId: string;

    @Column({ type: 'uuid', nullable: false, default: () => 'gen_random_uuid()' })
    itemId: string;

    @Column({ type: 'uuid', nullable: false, name: 'fieldId' })
    fieldId: string;

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
