import {Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/rbac.entity';
import { HasuraModule } from 'src/adapters/hasura/hasura.module';
import { PostgresModule } from 'src/adapters/postgres/potsgres-module';
import { PostgresRoleService } from 'src/adapters/postgres/rbac/role-adapter';
import { HasuraRoleService } from 'src/adapters/hasura/rbac.adapter';
import { HttpModule } from '@nestjs/axios';
import { RoleAdapter } from './roleadapter';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
    HttpModule,
    PostgresModule,
    HasuraModule
  ],
  controllers: [RoleController],
  providers: [RoleAdapter,HasuraRoleService,PostgresRoleService],
})
export class RoleModule {}
