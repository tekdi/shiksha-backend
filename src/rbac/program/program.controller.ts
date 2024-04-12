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
import { ProgramDto } from "./dto/program.dto";
import { ProgramSearchDto } from "./dto/program-search.dto";
import { Response, response } from "express";
import { JwtAuthGuard } from "src/common/guards/keycloak.guard";
import { ProgramAdapter } from "./programadapter";
@UseGuards(JwtAuthGuard)
@ApiTags("program")
@Controller("program")
export class ProgramController {
  constructor(private readonly programAdapter: ProgramAdapter) {}

  //Get program
  @Get("/:id")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "Program Detail." })
  @ApiHeader({ name: "tenantid" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({ strategy: "excludeAll" })
  public async getProgram(
    @Param("id") programId: string,
    @Req() request: Request,
    @Res() response: Response
  ) {
    const result = await this.programAdapter
      .buildProgramAdapter()
      .getProgram(programId, request);
    return response.status(result.statusCode).json(result);
  }

  //Create program
  @Post()
  @UsePipes(new ValidationPipe())
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Program has been created successfully." })
  @ApiBody({ type: ProgramDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiHeader({ name: "tenantid" })
  public async createProgram(
    @Req() request: Request,
    @Body() programDto: ProgramDto,
    @Res() response: Response
  ) {
    const result = await this.programAdapter
      .buildProgramAdapter()
      .createProgram(request, programDto);
    return response.status(result.statusCode).json(result);
  }

  //Update Program
  @Put("/:id")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Program updated successfully." })
  @ApiBody({ type: ProgramDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiHeader({ name: "tenantid" })
  public async updateProgram(
    @Param("id") programId: string,
    @Req() request: Request,
    @Body() programDto: ProgramDto,
    @Res() response: Response
  ) {
    const result = await this.programAdapter
      .buildProgramAdapter()
      .updateProgram(programId, request, programDto);
    return response.status(result.statusCode).json(result);
  }

  // search Program
  @Post("/search")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Program List." })
  @ApiBody({ type: ProgramSearchDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UsePipes(ValidationPipe)
  @SerializeOptions({ strategy: "excludeAll" })
  @ApiHeader({ name: "tenantid" })
  public async searchProgram(
    @Headers() headers,
    @Req() request: Request,
    @Body() programSearchDto: ProgramSearchDto,
    @Res() response: Response
  ) {
    let tenantid = headers["tenantid"];
    const result = await this.programAdapter
      .buildProgramAdapter()
      .searchProgram(tenantid, request, programSearchDto);
    return response.status(result.statusCode).json(result);
  }

  //delete program
  @Delete("/:id")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Program deleted successfully." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  public async deleteProgram(
    @Param("id") programId: string,
    @Res() response: Response
  ) {
    const result = await this.programAdapter
      .buildProgramAdapter()
      .deleteProgram(programId);
    return response.status(result.statusCode).json(result);
  }
}
