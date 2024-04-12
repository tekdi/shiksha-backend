import { HttpModule } from '@nestjs/axios';
import { ProgramsRoleMappingController } from './programs-role-mapping.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramsRoleMapping } from './entities/programs-role-mapping.entity';
import { HasuraProgramsRoleMappingService } from 'src/adapters/hasura/rbac/programRoleMapping.adapter';
import { PostgresProgramsRoleMappingService } from 'src/adapters/postgres/rbac/programRoleMapping-adapter';
import { ProgramRoleMappingAdapter } from './programsRoleMappingadapter';
import { Module } from '@nestjs/common';
import { Programs } from '../program/entities/program.entity';



@Module({
  imports:[TypeOrmModule.forFeature([ProgramsRoleMapping,Programs]),HttpModule],
  controllers: [ProgramsRoleMappingController],
  providers: [ProgramRoleMappingAdapter,HasuraProgramsRoleMappingService,PostgresProgramsRoleMappingService]
})
export class ProgramsRoleMappingModule {}
