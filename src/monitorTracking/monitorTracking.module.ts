import { HttpModule } from "@nestjs/axios";
import { CacheModule, Module } from "@nestjs/common";
import { MonitorTrackingService } from "src/adapters/hasura/monitorTracking.adapter";

import { MonitorTrackingController } from "./monitorTracking.controller";

@Module({
  imports: [HttpModule],
  controllers: [MonitorTrackingController],
  providers: [MonitorTrackingService],
})
export class MonitorTrackingModule {}
