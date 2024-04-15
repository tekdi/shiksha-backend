import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Req, Res, SerializeOptions } from '@nestjs/common';
import { AssignPrivilegeAdapter } from './assign-privilege.apater';
import { CreatePrivilegeRoleDto } from './dto/create-assign-privilege.dto';
import { Response} from "express";
import { ApiBasicAuth, ApiCreatedResponse, ApiBody, ApiForbiddenResponse, ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';


@ApiTags('rbac')
@Controller('assignprivilege')
export class AssignPrivilegeController {
  constructor(private readonly assignPrivilegeAdpater: AssignPrivilegeAdapter) {}

  @Post()
  @UsePipes(new ValidationPipe())
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Privilege has been Assigned successfully." })
  @ApiBody({ type: CreatePrivilegeRoleDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiHeader({ name: "tenantid" })
  public async create(@Req() request: Request,
  @Body() createAssignPrivilegeDto:CreatePrivilegeRoleDto ,
  @Res() response: Response) {
    const result = await this.assignPrivilegeAdpater.buildPrivilegeRoleAdapter().createPrivilegeRole(request,createAssignPrivilegeDto);
    return response.status(result.statusCode).json(result);
  }

  @Get("/:id")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "Privilege Details." })
  @ApiHeader({ name: "tenantid" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({strategy: "excludeAll",})
  public async getRole(
    @Param("id") userId: string,
    @Req() request: Request,
    @Res() response: Response
  ) {
    const result = await this.assignPrivilegeAdpater.buildPrivilegeRoleAdapter().getPrivilegeRole(userId, request);
    return response.status(result.statusCode).json(result);
  }

  @Delete("/:id")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Assigend Privililege has been deleted successfully." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  public async deletePrivilegeRole(
    @Param("id") userId: string,
    @Res() response: Response
  ) {
    const result = await this.assignPrivilegeAdpater.buildPrivilegeRoleAdapter().deletePrivilegeRole(userId);
    return response.status(result.statusCode).json(result);
  }
  
}
