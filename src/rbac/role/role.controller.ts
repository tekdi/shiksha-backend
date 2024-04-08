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
} from "@nestjs/swagger";
import { Request } from "@nestjs/common";
import { RoleDto } from "./dto/role.dto";
import { RoleSearchDto } from "./dto/role-search.dto";
import { Response, response } from "express";
import { JwtAuthGuard } from "src/common/guards/keycloak.guard";
import { RoleAdapter } from "./roleadapter"


@ApiTags("rbac")
@Controller("role")
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
  @Post()
  @UsePipes(new ValidationPipe())
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Role has been created successfully." })
  @ApiBody({ type: RoleDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiHeader({ name: "tenantid" })
  public async createRole(
    @Req() request: Request,
    @Body() roleDto: RoleDto,
    @Res() response: Response
  ) {
    const result = await this.roleAdapter.buildRbacAdapter().createRole(request, roleDto);
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
  @Post("/search")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Role List." })
  @ApiBody({ type: RoleSearchDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UsePipes(ValidationPipe)
  @SerializeOptions({ strategy: "excludeAll", })
  @ApiHeader({ name: "tenantid" })
  public async searchRole(
    @Headers() headers,
    @Req() request: Request,
    @Body() roleSearchDto: RoleSearchDto,
    @Res() response: Response
  ) {
    let tenantid = headers["tenantid"];
    const result = await this.roleAdapter.buildRbacAdapter().searchRole(tenantid,request,roleSearchDto);
    return response.status(result.statusCode).json(result);
  }

  //delete role
  @Delete("/:id")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Role deleted successfully." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  public async deleteRole(
    @Param("id") roleId: string,
    @Res() response: Response
  ) {
    const result = await this.roleAdapter.buildRbacAdapter().deleteRole(roleId);
    return response.status(result.statusCode).json(result);
  }
}
