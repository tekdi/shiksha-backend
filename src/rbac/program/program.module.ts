import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Programs } from "./entities/program.entity";
import { HasuraModule } from "src/adapters/hasura/hasura.module";
import { PostgresModule } from "src/adapters/postgres/potsgres-module";
import { PostgresProgramService } from "src/adapters/postgres/rbac/program-adapter";
import { HasuraProgramService } from "src/adapters/hasura/rbac/program.adapter";
import { HttpModule } from "@nestjs/axios";
import { ProgramAdapter } from "./programadapter";
import { ProgramController } from "./program.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([Programs]),
    HttpModule,
    PostgresModule,
    HasuraModule,
  ],
  controllers: [ProgramController],
  providers: [ProgramAdapter, HasuraProgramService, PostgresProgramService],
})
export class ProgramModule {}
