import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ScheduleModule } from "@nestjs/schedule";
import {
  AnnouncementsService,
  AnnouncementsToken,
} from "../adapters/hasura/announcements.adapter";
import { AnnouncementsController } from "./announcements.controller";

@Module({
  imports: [HttpModule, ScheduleModule.forRoot()],
  providers: [
    AnnouncementsService,
    {
      provide: AnnouncementsToken,
      useClass: AnnouncementsService,
    },
  ],
  controllers: [AnnouncementsController],
})
export class AnnouncementsModule {}
