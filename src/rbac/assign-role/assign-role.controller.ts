import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Req, Res, SerializeOptions } from '@nestjs/common';
import { AssignRoleAdapter } from './assign-role.apater';
import { CreateAssignRoleDto } from './dto/create-assign-role.dto';
import { Response, Request } from "express";
import { ApiBasicAuth, ApiCreatedResponse, ApiBody, ApiForbiddenResponse, ApiHeader, ApiOkResponse, ApiTags, ApiBadRequestResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { DeleteAssignRoleDto } from './dto/delete-assign-role.dto';



@Controller('rbac/assignrole')
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

  @Delete("/:userId")
  @ApiBasicAuth("access-token")
  @ApiHeader({ name: "tenantid" })
  @ApiOkResponse({ description: "Role deleted successfully." })
  @ApiNotFoundResponse({ description: "Data not found" })
  @ApiBadRequestResponse({ description: "Bad request" })
  public async deleteRole(
    @Body() deleteAssignRoleDto: DeleteAssignRoleDto, // Modify this line to accept DeleteAssignRoleDto
    @Res() response: Response
  ) {
    const result = await this.assignRoleAdpater
      .buildassignroleAdapter()
      .deleteAssignedRole(deleteAssignRoleDto);
    return response.status(result.statusCode).json(result);
  }
  
}
