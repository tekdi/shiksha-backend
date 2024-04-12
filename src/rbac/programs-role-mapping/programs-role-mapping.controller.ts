import { Controller, Get, Post, Body, Patch, Param, Delete, SerializeOptions, UsePipes, ValidationPipe, Req, Res,Request, UseGuards, Put } from '@nestjs/common';
import { ProgramsRoleMappingDto } from './dto/programs-role-mapping.dto';
import { ApiBasicAuth, ApiBody, ApiCreatedResponse, ApiForbiddenResponse, ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProgramRoleMappingAdapter } from './programsRoleMappingadapter';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/common/guards/keycloak.guard';



@UseGuards(JwtAuthGuard)
@ApiTags("rbac")
@Controller('programs-role-mapping')
export class ProgramsRoleMappingController {
  constructor(private readonly programsRoleMappingAdapter: ProgramRoleMappingAdapter) {}

  @Post()
  @UsePipes(new ValidationPipe())
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Privilege has been created successfully." })
  @ApiBody({ type: ProgramsRoleMappingDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiHeader({ name: "tenantid" })
  public async createProgramsRoleMapping(
    @Req() request: Request,
    @Body() programsRoleMappingDto: ProgramsRoleMappingDto,
    @Res() response: Response
  ) {
    const result = await this.programsRoleMappingAdapter.buildProgramRoleMappingAdapter().createProgramsRoleMapping(request, programsRoleMappingDto);
    return response.status(result.statusCode).json(result);
  }


  @Get("/:mappingId")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "Privilege Detail." })
  @ApiHeader({ name: "tenantid" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({strategy: "excludeAll",})
  public async getProgramRoleMapping(
    @Param("mappingId") Id: string,
    @Req() request: Request,
    @Res() response: Response
  ) {
    const result = await this.programsRoleMappingAdapter.buildProgramRoleMappingAdapter().getProgramRoleMapping(Id, request);
    return response.status(result.statusCode).json(result);
  }


  @Get()
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "Privilege Detail." })
  @ApiHeader({ name: "tenantid" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({strategy: "excludeAll",})
  public async getAllProgramRoleMApping(
    @Req() request: Request,
    @Res() response: Response
  ) {
    const result = await this.programsRoleMappingAdapter.buildProgramRoleMappingAdapter().getAllProgramRoleMapping(request);
    return response.status(result.statusCode).json(result);
  }


  @Delete("/:mappingId")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Role updated successfully." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiHeader({ name: "tenantid", })
  public async deleteProgramRoleMapping(
    @Param("mappingId") Id: string,
    @Req() request: Request,
    @Res() response: Response
  ) {
    const result = await this.programsRoleMappingAdapter.buildProgramRoleMappingAdapter().deleteProgramRoleMapping(Id, request);
    return response.status(result.statusCode).json(result);
  } 

  @Put("/:mappingId")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Role updated successfully." })
  @ApiBody({ type:ProgramsRoleMappingDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiHeader({ name: "tenantid", })
  @UsePipes(new ValidationPipe())
  public async updateProgramsRoleMapping(
    @Param("mappingId") Id: string,
    @Req() request: Request,
    @Body() programsRoleMappingDto: ProgramsRoleMappingDto,
    @Res() response: Response
  ) {
    const result = await this.programsRoleMappingAdapter.buildProgramRoleMappingAdapter().updateProgramsRoleMapping(Id, request, programsRoleMappingDto);
    return response.status(result.statusCode).json(result);
  } 


  
}
