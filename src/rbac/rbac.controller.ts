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
import { RoleDto } from "./dto/rbac.dto";
import { RoleSearchDto } from "./dto/rbac-search.dto";
import { RoleService } from "./rbac.service";
import { Response, response } from "express";
import { JwtAuthGuard } from "src/common/guards/keycloak.guard";
import { RbacAdapter } from "./rbacadapter";


@ApiTags("rbac")
@Controller("rbac")
@UseGuards(JwtAuthGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService,private readonly rbacAdapter:RbacAdapter) { }

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
    const result = await this.rbacAdapter.buildRbacAdapter().getRole(roleId, request);
    return response.status(result.statusCode).json(result);
  }

  //Create role
  @Post()
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
    const result = await this.rbacAdapter.buildRbacAdapter().createRole(request, roleDto);
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
    const result = await this.rbacAdapter.buildRbacAdapter().updateRole(roleId, request, roleDto);
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
    const result = await this.rbacAdapter.buildRbacAdapter().searchRole(tenantid,request,roleSearchDto);
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
    const result = await this.rbacAdapter.buildRbacAdapter().deleteRole(roleId);
    return response.status(result.statusCode).json(result);
  }
}
