import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
  Request,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBasicAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiExcludeController,
  ApiForbiddenResponse,
  ApiOkResponse,
} from "@nestjs/swagger";
import { IServicelocator } from "src/adapters/announcementsservicelocator";
import {
  AnnouncementsService,
  AnnouncementsToken,
} from "src/adapters/hasura/announcements.adapter";
import { AnnouncementsFilterDto } from "./dto/announcements-filter.dto";
import { AnnouncementsDto } from "./dto/announcements.dto";
@ApiExcludeController()
@Controller("announcements")
export class AnnouncementsController {
  constructor(
    private hasuraService: AnnouncementsService,
    @Inject(AnnouncementsToken) private provider: IServicelocator
  ) {}

  @Get("/:id")
  @UseInterceptors(ClassSerializerInterceptor)
  // @ApiBasicAuth("access-token")
  // @ApiCreatedResponse({ description: "Get announcement detail" })
  // @ApiForbiddenResponse({ description: "Forbidden" })
  public async getAnnouncement(
    @Param("id") announcementId: string,
    @Req() request: Request
  ) {
    return this.hasuraService.getAnnouncement(announcementId, request);
  }

  @Get("")
  @UseInterceptors(ClassSerializerInterceptor)
  // @ApiBasicAuth("access-token")
  // @ApiCreatedResponse({ description: "Get announcements" })
  // @ApiForbiddenResponse({ description: "Forbidden" })
  public async getAnnouncementSet(
    @Query() query: AnnouncementsFilterDto,
    @Req() request: Request
  ) {
    return this.hasuraService.getAnnouncementSet(request, query);
  }

  @Put("/:id")
  // @ApiConsumes("multipart/form-data")
  // @ApiBasicAuth("access-token")
  // @ApiCreatedResponse({
  //   description: "Announcement has been Updated successfully.",
  // })
  // @ApiBody({ type: AnnouncementsDto })
  // @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async updateAnnouncement(
    @Param("id") announcementId: string,
    @Req() request: Request,
    @Body() announcementData: any
  ) {
    const updatedData = JSON.parse(announcementData?.data);
    return this.hasuraService.updateAnnouncement(
      announcementId,
      request,
      updatedData
    );
  }

  @Post()
  // @ApiConsumes("multipart/form-data")
  // @ApiBasicAuth("access-token")
  // @ApiCreatedResponse({
  //   description: "Announcement has been created successfully.",
  // })
  // @ApiBody({ type: AnnouncementsDto })
  // @ApiForbiddenResponse({ description: "Forbidden" })
  public async createAnnouncement(
    @Req() request: Request,
    @Body() announcementData: AnnouncementsDto
  ) {
    return this.hasuraService.createAnnouncement(request, announcementData);
  }

  @Delete("/:id")
  @UseInterceptors(ClassSerializerInterceptor)
  // @ApiBasicAuth("access-token")
  // @ApiOkResponse({ description: "Deleted the announcement " })
  public async deleteAnnouncement(
    @Param("id") announcementId: string,
    @Req() request: Request
  ) {
    return this.hasuraService.deleteAnnouncement(announcementId, request);
  }
}
