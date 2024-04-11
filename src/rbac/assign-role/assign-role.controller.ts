import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Req, Res, SerializeOptions } from '@nestjs/common';
import { AssignRoleAdapter } from './assign-role.apater';
import { CreateAssignRoleDto } from './dto/create-assign-role.dto';
import { Response, response } from "express";
import { ApiBasicAuth, ApiCreatedResponse, ApiBody, ApiForbiddenResponse, ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';



@Controller('assignrole')
@ApiTags('rbac')
export class AssignRoleController {
  constructor(private readonly assignRoleAdpater: AssignRoleAdapter) {}

  @Post()
  @UsePipes(new ValidationPipe())
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Role has been Assigned successfully." })
  @ApiBody({ type: CreateAssignRoleDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiHeader({ name: "tenantid" })
  public async create(@Req() request: Request,
  @Body() createAssignRoleDto:CreateAssignRoleDto ,
  @Res() response: Response) {
    const result = await this.assignRoleAdpater.buildassignroleAdapter().createAssignRole(request,createAssignRoleDto);
    return response.status(result.statusCode).json(result);
  }

  @Get("/:id")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "Role Detail." })
  @ApiHeader({ name: "tenantid" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({strategy: "excludeAll",})
  public async getRole(
    @Param("id") userId: string,
    @Req() request: Request,
    @Res() response: Response
  ) {
    const result = await this.assignRoleAdpater.buildassignroleAdapter().getAssignedRole(userId, request);
    return response.status(result.statusCode).json(result);
  }

  @Delete("/:id")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Assigend Role deleted successfully." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  public async deleteRole(
    @Param("id") userId: string,
    @Res() response: Response
  ) {
    const result = await this.assignRoleAdpater.buildassignroleAdapter().deleteAssignedRole(userId);
    return response.status(result.statusCode).json(result);
  }
  
}
