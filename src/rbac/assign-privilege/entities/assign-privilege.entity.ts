import { Privilege } from 'src/rbac/privilege/entities/privilege.entity';
import { Role } from 'src/rbac/role/entities/role.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn} from 'typeorm';

@Entity({ name: 'Role_Privilege_Mapping' })
export class RolePrivilegeMapping  {
  @PrimaryGeneratedColumn('uuid')
  Id: string;

  @Column('uuid')
  roleId: string;

  @Column('uuid')
  privilegeId: string;

  @ManyToOne(() => Privilege)
  @JoinColumn({ name: 'privilege' })
  privilege: Privilege;

  @ManyToOne(() => Role, {nullable:true})
  @JoinColumn({ name: 'roleId' })
  role: Role;
}


