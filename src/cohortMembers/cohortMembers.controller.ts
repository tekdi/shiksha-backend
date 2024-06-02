import {
  ApiTags,
  ApiBody,
  ApiForbiddenResponse,
  ApiCreatedResponse,
  ApiBasicAuth,
  ApiHeader,
  ApiOkResponse,
  ApiQuery,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from "@nestjs/swagger";
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  SerializeOptions,
  Req,
  Headers,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Query,
  UseFilters,
} from "@nestjs/common";
import { CohortMembersSearchDto } from "./dto/cohortMembers-search.dto";
import { Request } from "@nestjs/common";
import { CohortMembersDto } from "./dto/cohortMembers.dto";
import { CohortMembersAdapter } from "./cohortMembersadapter";
import { CohortMembersUpdateDto } from "./dto/cohortMember-update.dto";
import { JwtAuthGuard } from "src/common/guards/keycloak.guard";
import { Response, query } from "express";
import { AllExceptionsFilter } from "src/common/filters/exception.filter";
import { APIID } from "src/common/utils/api-id.config";

@ApiTags("Cohort Member")
@Controller("cohortmember")
@UseGuards(JwtAuthGuard)
export class CohortMembersController {
  constructor(
    private readonly cohortMemberAdapter: CohortMembersAdapter
  ) { }

  //create cohort members
  @UseFilters(new AllExceptionsFilter(APIID.COHORT_MEMBER_CREATE))
  @Post("/create")
  @UsePipes(new ValidationPipe())
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({
    description: "Cohort Member has been created successfully.",
  })
  @ApiBody({ type: CohortMembersDto })
  @ApiHeader({
    name: "tenantid",
  })
  public async createCohortMembers(
    @Headers() headers,
    @Req() request,
    @Body() cohortMembersDto: CohortMembersDto,
    @Res() response: Response
  ) {
    const loginUser = request.user.userId;
    const tenantId = headers["tenantid"];
    const result = await this.cohortMemberAdapter
      .buildCohortMembersAdapter()
      .createCohortMembers(loginUser, cohortMembersDto, response, tenantId);
    return response.status(result.statusCode).json(result);
  }

  //get cohort members
  @UseFilters(new AllExceptionsFilter(APIID.COHORT_MEMBER_GET))
  @Get("/read/:cohortId")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Cohort Member detail" })
  @ApiNotFoundResponse({ description: "Data not found" })
  @ApiBadRequestResponse({ description: "Bad request" })
  @SerializeOptions({ strategy: "excludeAll" })
  @ApiHeader({ name: "tenantid" })
  @ApiQuery({
    name: "fieldvalue",
    description: "Send True to Fetch Custom Field of User",
    required: false,
  })
  public async getCohortMembers(
    @Headers() headers,
    @Param("cohortId") cohortId: string,
    @Req() request: Request,
    @Res() response: Response,
    @Query("fieldvalue") fieldvalue: string | null = null
  ) {
    const tenantId = headers["tenantid"];
    const result = await this.cohortMemberAdapter
      .buildCohortMembersAdapter()
      .getCohortMembers(cohortId, tenantId, fieldvalue, response);
  }

  // search;
  @UseFilters(new AllExceptionsFilter(APIID.COHORT_MEMBER_SEARCH))
  @Post("/list")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Cohort Member list." })
  @ApiNotFoundResponse({ description: "Data not found" })
  @ApiBadRequestResponse({ description: "Bad request" })
  @ApiBody({ type: CohortMembersSearchDto })
  @SerializeOptions({
    strategy: "excludeAll",
  })
  @ApiHeader({
    name: "tenantid",
  })
  @ApiQuery({
    name: "fieldvalue",
    description: "Send True to Fetch Custom Field of User",
    required: false,
  })
  public async searchCohortMembers(
    @Headers() headers,
    @Req() request: Request,
    @Res() response: Response,
    @Body() cohortMembersSearchDto: CohortMembersSearchDto,
    @Query("fieldvalue") fieldvalue: boolean | null = null
  ) {
    const tenantId = headers["tenantid"];
    const finalFieldValue = fieldvalue !== null ? fieldvalue : false;

    const result = await this.cohortMemberAdapter
      .buildCohortMembersAdapter()
      .searchCohortMembers(cohortMembersSearchDto, finalFieldValue, tenantId, response);
  }

  //update
  @UseFilters(new AllExceptionsFilter(APIID.COHORT_MEMBER_UPDATE))
  @Put("/update/:id")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({
    description: "Cohort Member has been updated successfully.",
  })
  @ApiNotFoundResponse({ description: "Data not found" })
  @ApiBadRequestResponse({ description: "Bad request" })
  @ApiBody({ type: CohortMembersUpdateDto })
  public async updateCohortMembers(
    @Param("id") cohortMembersId: string,
    @Req() request,
    @Body() cohortMemberUpdateDto: CohortMembersUpdateDto,
    @Res() response: Response
  ) {
    const loginUser = request.user.userId;

    const result = await this.cohortMemberAdapter
      .buildCohortMembersAdapter()
      .updateCohortMembers(
        cohortMembersId,
        loginUser,
        cohortMemberUpdateDto,
        response
      );
  }

  //delete
  @UseFilters(new AllExceptionsFilter(APIID.COHORT_MEMBER_DELETE))
  @Delete("/delete/:id")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Cohort member deleted successfully" })
  @ApiNotFoundResponse({ description: "Data not found" })
  @SerializeOptions({
    strategy: "excludeAll",
  })
  @ApiHeader({
    name: "tenantid",
  })
  public async deleteCohortMember(
    @Headers() headers,
    @Param("id") cohortMembershipId: string,
    @Req() request: Request,
    @Res() response: Response
  ) {
    let tenantid = headers["tenantid"];

    const result = await this.cohortMemberAdapter
      .buildCohortMembersAdapter()
      .deleteCohortMemberById(tenantid, cohortMembershipId, response);
  }
}