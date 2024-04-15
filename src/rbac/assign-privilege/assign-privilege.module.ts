import { Module } from '@nestjs/common';
import { AssignPrivilegeAdapter } from './assign-privilege.apater';
import { AssignPrivilegeController } from './assign-privilege.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgresAssignPrivilegeService } from 'src/adapters/postgres/rbac/privilegerole.adapter';
import { HasuraAssignPrivilegeService } from 'src/adapters/hasura/rbac/privilegerole.adapter';
import { HttpModule } from '@nestjs/axios';
import { RolePrivilegeMapping } from './entities/assign-privilege.entity';


@Module({
  imports:[TypeOrmModule.forFeature([RolePrivilegeMapping]),HttpModule],
  controllers: [AssignPrivilegeController],
  providers: [AssignPrivilegeAdapter,HasuraAssignPrivilegeService,PostgresAssignPrivilegeService]
})
export class AssignPrivilegeModule {}
