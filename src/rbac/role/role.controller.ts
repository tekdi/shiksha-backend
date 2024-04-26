import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  SerializeOptions,
  Req,
  UsePipes,
  ValidationPipe,
  Res,
  Headers,
  Delete,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBody,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiCreatedResponse,
  ApiBasicAuth,
  ApiHeader,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from "@nestjs/swagger";
import { Request } from "@nestjs/common";
import { CreateRolesDto, RoleDto } from "./dto/role.dto";
import { RoleSearchDto } from "./dto/role-search.dto";
import { Response, response } from "express";
import { JwtAuthGuard } from "src/common/guards/keycloak.guard";
import { RoleAdapter } from "./roleadapter"


@ApiTags("rbac")
@Controller("rbac/roles")
@UseGuards(JwtAuthGuard)
export class RoleController {
  constructor(private readonly roleAdapter:RoleAdapter) { }

  //Get role
  @Get("/:id")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "Role Detail." })
  @ApiHeader({ name: "tenantid" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({strategy: "excludeAll",})
  public async getRole(
    @Param("id") roleId: string,
    @Req() request: Request,
    @Res() response: Response
  ) {
    const result = await this.roleAdapter.buildRbacAdapter().getRole(roleId, request);
    return response.status(result.statusCode).json(result);
  }

  //Create role
  @Post("/create")
  @UsePipes(new ValidationPipe())
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Role has been created successfully." })
  @ApiBody({ type: CreateRolesDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiHeader({ name: "tenantid" })
  public async createRole(
    @Req() request: Request,
    @Body() createRolesDto: CreateRolesDto,
    @Res() response: Response
  ) {
    const result = await this.roleAdapter.buildRbacAdapter().createRole(request, createRolesDto);
    return response.status(result.statusCode).json(result);
  }

  //Update Role
  @Put("/:id")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Role updated successfully." })
  @ApiBody({ type: RoleDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiHeader({ name: "tenantid", })
  public async updateRole(
    @Param("id") roleId: string,
    @Req() request: Request,
    @Body() roleDto: RoleDto,
    @Res() response: Response
  ) {
    const result = await this.roleAdapter.buildRbacAdapter().updateRole(roleId, request, roleDto);
    return response.status(result.statusCode).json(result);
  }

  // search Role
  @Post("/list-roles")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Role List." })
  @ApiBody({ type: RoleSearchDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  // @UsePipes(ValidationPipe)
  @SerializeOptions({ strategy: "excludeAll", })
  @ApiHeader({ name: "tenantid" })
  public async searchRole(
    @Headers() headers,
    @Req() request: Request,
    @Body() roleSearchDto: RoleSearchDto,
    @Res() response: Response
  ) {
    // let tenantid = headers["tenantid"];
    const result = await this.roleAdapter.buildRbacAdapter().searchRole(roleSearchDto);
    return response.status(result.statusCode).json(result);
  }

  //delete role
  @Delete("/:roleId")
  @ApiBasicAuth("access-token")
  @ApiHeader({ name: "tenantid" })
  @ApiOkResponse({ description: "Role deleted successfully." })
  @ApiNotFoundResponse({ description: "Data not found" })
  @ApiBadRequestResponse({ description: "Bad request" })
  public async deleteRole(
    @Param("roleId") roleId: string,
    @Res() response: Response
  ) {
    const result = await this.roleAdapter.buildRbacAdapter().deleteRole(roleId);
    return response.status(result.statusCode).json(result);
  }
}
