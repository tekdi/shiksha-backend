import {
  ApiTags,
  ApiBody,
  ApiForbiddenResponse,
  ApiCreatedResponse,
  ApiBasicAuth,
} from "@nestjs/swagger";
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  Req,
  CacheInterceptor,
  Request,
} from "@nestjs/common";

import { CohortMembersDto } from "./dto/cohortMembers.dto";
import { CohortMembersSearchDto } from "./dto/cohortMembers-search.dto";
import { CohortMembersService } from "src/adapters/hasura/cohortMembers.adapter";

@ApiTags("Group Membership")
@Controller("groupmembership")
export class CohortMembersController {
  constructor(private service: CohortMembersService) {}

  @Get("/:id")
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Group Membership detail" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({
    strategy: "excludeAll",
  })
  public async getCohortMembers(
    @Param("id") cohortMembersId: string,
    @Req() request: Request
  ) {
    return this.service.getCohortMembers(cohortMembersId, request);
  }

  @Post()
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({
    description: "Group Membership has been created successfully.",
  })
  @ApiBody({ type: CohortMembersDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async createCohortMembers(
    @Req() request: Request,
    @Body() cohortMembersDto: CohortMembersDto
  ) {
    return this.service.createCohortMembers(request, cohortMembersDto);
  }

  @Put("/:id")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({
    description: "Group Membership has been updated successfully.",
  })
  @ApiBody({ type: CohortMembersDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async updateCohortMembers(
    @Param("id") cohortMembersId: string,
    @Req() request: Request,
    @Body() groupMembersipDto: CohortMembersDto
  ) {
    return this.service.updateCohortMembers(
      cohortMembersId,
      request,
      groupMembersipDto
    );
  }

  @Post("/search")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Group Membership list." })
  @ApiBody({ type: CohortMembersSearchDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    strategy: "excludeAll",
  })
  public async searchCohortMembers(
    @Req() request: Request,
    @Body() cohortMembersSearchDto: CohortMembersSearchDto
  ) {
    return this.service.searchCohortMembers(
      request,
      cohortMembersSearchDto
    );
  }
}
