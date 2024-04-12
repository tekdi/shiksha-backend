import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from 'src/user/entities/user-entity'; 
import { Role } from '../../role/entities/rbac.entity';

@Entity({ name: 'User_Role_Mapping' })
export class UserRoleMapping {
  @PrimaryGeneratedColumn('uuid')
  Id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  roleId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'roleId' })
  role: Role;
}

