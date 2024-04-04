import { CacheModule, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { WorksheetController } from "./worksheet.controller";
import { WorksheetService } from "src/adapters/hasura/worksheet.adapter";

@Module({
  imports: [HttpModule],
  controllers: [WorksheetController],
  providers: [WorksheetService],
})
export class WorksheetModule {}
