import {
  ApiTags,
  ApiBody,
  ApiForbiddenResponse,
  ApiCreatedResponse,
  ApiBasicAuth,
  ApiHeader,
  ApiConsumes,
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
  Headers,
} from "@nestjs/common";
import { CohortMembersSearchDto } from "./dto/cohortMembers-search.dto";
import { Request } from "@nestjs/common";
import { CohortMembersDto } from "./dto/cohortMembers.dto";
import { CohortMembersAdapter } from "./cohortMembersadapter";
import { CohortMembersService } from "./cohortMember.service";

@ApiTags("Cohort Members")
@Controller("cohortmembers")
export class CohortMembersController {
  constructor(
    private cohortMembersAdapter: CohortMembersAdapter,
    private readonly cohortMembersService: CohortMembersService
    ) {}

  //create cohort members
  @Post()
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({
    description: "Cohort Members has been created successfully.",
  })
  @ApiBody({ type: CohortMembersDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiHeader({
    name: "tenantid",
  })
  public async createCohortMembers(
    @Headers() headers,
    @Req() request: Request,
    @Body() cohortMembersDto: CohortMembersDto
  ) {
    let tenantid = headers["tenantid"];
    const payload = {
      tenantId: tenantid,
    };
    Object.assign(cohortMembersDto, payload);

    return this.cohortMembersAdapter
      .buildCohortMembersAdapter()
      .createCohortMembers(request, cohortMembersDto);
  }

  //get cohort members
  @Get("/:id")
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Cohort Members detail" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({
    strategy: "excludeAll",
  })
  @ApiHeader({
    name: "tenantid",
  })
  public async getCohortMembers(
    @Headers() headers,
    @Param("id") cohortMembersId: string,
    @Req() request: Request
  ) {
    let tenantid = headers["tenantid"];
    return this.cohortMembersAdapter
      .buildCohortMembersAdapter()
      .getCohortMembers(tenantid, cohortMembersId, request);
  }

  //search
  @Post("/search")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Cohort Members list." })
  @ApiBody({ type: CohortMembersSearchDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    strategy: "excludeAll",
  })
  @ApiHeader({
    name: "tenantid",
  })
  public async searchCohortMembers(
    @Headers() headers,
    @Req() request: Request,
    @Body() cohortMembersSearchDto: CohortMembersSearchDto
  ) {
    let tenantid = headers["tenantid"];
    return this.cohortMembersService.searchCohortMembers(tenantid, request, cohortMembersSearchDto);
  }

  //update
  @Put("/:id")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({
    description: "Cohort Members has been updated successfully.",
  })
  @ApiBody({ type: CohortMembersDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async updateCohortMembers(
    @Param("id") cohortMembersId: string,
    @Req() request: Request,
    @Body() cohortMembersipDto: CohortMembersDto
  ) {
    return this.cohortMembersAdapter.buildCohortMembersAdapter().updateCohortMembers(
      cohortMembersId,
      request,
      cohortMembersipDto
    );
  }
}
