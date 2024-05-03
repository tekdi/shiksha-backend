import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
  } from "typeorm";

  @Entity({ name: "UserTenantMapping" })
  export class UserTenantMapping {
    @PrimaryGeneratedColumn("uuid")
    Id: string;
  
    @Column("uuid")
    userId: string;
  
    @Column("uuid")
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
  
    @Column()
    createdBy: string;
  
    @Column()
    updatedBy: string;
  }
  