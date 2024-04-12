import { IsUUID } from "class-validator";
import { Programs } from "src/rbac/program/entities/program.entity";
import { Role } from "src/rbac/role/entities/rbac.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";



@Entity({name:"Programs_Role_Mapping"})
export class ProgramsRoleMapping {

    @PrimaryGeneratedColumn('uuid')
    Id: string;

    @IsUUID()
    @Column('uuid')
    programId:string

    @IsUUID()
    @Column('uuid')
    roleId: string;

    @ManyToOne(() => Role)
    @JoinColumn({ name: 'roleId' })
    role: Role;

    @ManyToOne(() => Programs)
    @JoinColumn({ name: 'programId' })
    programs:Programs;
  }