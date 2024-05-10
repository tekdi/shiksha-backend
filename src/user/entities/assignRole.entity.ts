import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
  } from "typeorm";
  @Entity({ name: "UserRolesMapping" })
  export class AssignUserRole {
    @PrimaryGeneratedColumn("uuid")
    userRolesId: string;
  
    @Column("uuid")
    userId: string;
  
    @Column("uuid")
    tenantId: string;
  
    @Column("uuid")
    roleId: string;
  
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
  