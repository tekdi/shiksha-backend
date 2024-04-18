import {
  ApiTags,
  ApiBody,
  ApiForbiddenResponse,
  ApiCreatedResponse,
  ApiBasicAuth,
  ApiHeader,
  ApiOkResponse,
  ApiQuery,
} from "@nestjs/swagger";
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  Req,
  Headers,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Query,
} from "@nestjs/common";
import { CohortMembersSearchDto } from "./dto/cohortMembers-search.dto";
import { Request } from "@nestjs/common";
import { CohortMembersDto } from "./dto/cohortMembers.dto";
import { CohortMembersAdapter } from "./cohortMembersadapter";
import { CohortMembersService } from "./cohortMember.service";
// import { Response } from "@nestjs/common";
import { CohortMembersUpdateDto } from "./dto/cohortMember-update.dto";
import { JwtAuthGuard } from "src/common/guards/keycloak.guard";
import { Response } from "express";

@ApiTags("Cohort Members")
@Controller("cohortmembers")
@UseGuards(JwtAuthGuard)
export class CohortMembersController {
  constructor(
    private readonly cohortMembersService: CohortMembersService,
    private readonly cohortMemberAdapter: CohortMembersAdapter
  ) {}

  //create cohort members
  @Post()
  @UsePipes(new ValidationPipe())
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({
    description: "Cohort Members has been created successfully.",
  })
  @ApiBody({ type: CohortMembersDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  // @UseInterceptors(ClassSerializerInterceptor)
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
    let tenantid = headers["tenantid"];
    const payload = {
      tenantId: tenantid,
    };
    Object.assign(cohortMembersDto, payload);

    const result = await this.cohortMemberAdapter
      .buildCohortMembersAdapter()
      .createCohortMembers(loginUser, cohortMembersDto, response);
    return response.status(result.statusCode).json(result);
  }

  //get cohort members
  @Get("/:userId")
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Cohort Members detail" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({ strategy: "excludeAll" })
  @ApiHeader({ name: "tenantid" })
  @ApiQuery({
    name: "fieldvalue",
    description: "The field Value (optional)",
    required: false,
  })
  public async getCohortMembers(
    @Headers() headers,
    @Param("userId") userId: string,
    @Req() request: Request,
    @Res() response: Response,
    @Query("fieldvalue") fieldvalue: string | null = null
  ) {
    let tenantid = headers["tenantid"];

    const result = await this.cohortMemberAdapter
      .buildCohortMembersAdapter()
      .getCohortMembers(userId, fieldvalue);

    return response.status(result.statusCode).json(result);
  }

  search;
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
    @Res() response: Response,
    @Body() cohortMembersSearchDto: CohortMembersSearchDto
  ) {
    let tenantid = headers["tenantid"];

    const result = await this.cohortMemberAdapter
      .buildCohortMembersAdapter()
      .searchCohortMembers(cohortMembersSearchDto);
    return response.status(result.statusCode).json(result);
  }

  //update
  @Put("/:id")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({
    description: "Cohort Members has been updated successfully.",
  })
  @ApiBody({ type: CohortMembersUpdateDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  // @UseInterceptors(ClassSerializerInterceptor)
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
    return response.status(result.statusCode).json(result);
  }

  //delete
  @Delete("/:id")
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Cohort member deleted successfully" })
  @ApiForbiddenResponse({ description: "Forbidden" })
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
      .deleteCohortMemberById(tenantid, cohortMembershipId, response, request);
    return response.status(result.statusCode).json(result);
  }
}
