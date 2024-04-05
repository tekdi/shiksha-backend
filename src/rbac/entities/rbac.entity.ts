import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: "Role" })
export class Role {
  @PrimaryGeneratedColumn('uuid')
  roleId: string;

  @Column()
  roleName: string;
}
