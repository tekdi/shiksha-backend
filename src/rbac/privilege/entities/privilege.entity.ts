// export class Privilege {}
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: "Privilege" })
export class Privilege {
  @PrimaryGeneratedColumn('uuid')
  privilegeId: string;

  @Column()
  privilegeName: string;
}
