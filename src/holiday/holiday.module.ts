import { HttpModule } from "@nestjs/axios";
import { CacheModule, Module } from "@nestjs/common";
import { HasuraModule } from "src/adapters/hasura/hasura.module";
import { HolidayController } from "./holiday.controller";
import { HolidayAdapter } from "./holidayadapter";

@Module({
  imports: [HasuraModule, HttpModule],
  controllers: [HolidayController],
  providers: [HolidayAdapter],
})
export class HolidayModule {}
