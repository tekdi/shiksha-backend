import {
  ApiTags,
  ApiBody,
  ApiForbiddenResponse,
  ApiCreatedResponse,
  ApiBasicAuth,
  ApiHeader,
} from "@nestjs/swagger";
import {
  Controller,
  Post,
  Body,
  SerializeOptions,
  Req,
  Headers,
  UseGuards,
  Res,
} from "@nestjs/common";
import { FieldsSearchDto } from "./dto/fields-search.dto";
import { Request } from "@nestjs/common";
import { FieldsDto } from "./dto/fields.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { Response } from "express";
import { FieldsAdapter } from "./fieldsadapter";
import { FieldValuesDto } from "./dto/field-values.dto";
import { FieldValuesSearchDto } from "./dto/field-values-search.dto";
import { FieldsService } from "./fields.service";
import { JwtAuthGuard } from "src/common/guards/keycloak.guard";

@ApiTags("Fields")
@Controller("fields")
@UseGuards(JwtAuthGuard)
export class FieldsController {
  constructor(
    private fieldsAdapter: FieldsAdapter,
    private readonly fieldsService: FieldsService
  ) {}

  //fields
  //create fields
  @Post()
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Fields has been created successfully." })
  @ApiBody({ type: FieldsDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  // @UseInterceptors(ClassSerializerInterceptor)
  @ApiHeader({
    name: "tenantid",
  })
  public async createFields(
    @Headers() headers,
    @Req() request: Request,
    @Body() fieldsDto: FieldsDto,
    @Res() response: Response
  ) {
    let tenantid = headers["tenantid"];
    const payload = {
      tenantId: tenantid,
    };
    Object.assign(fieldsDto, payload);
    const result = await this.fieldsAdapter.buildFieldsAdapter().createFields(request, fieldsDto);
    return response.status(result.statusCode).json(result);
  }

  //search
  @Post("/search")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Fields list." })
  @ApiBody({ type: FieldsSearchDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  // @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    strategy: "excludeAll",
  })
  @ApiHeader({
    name: "tenantid",
  })
  public async searchFields(
    @Headers() headers,
    @Req() request: Request,
    @Body() fieldsSearchDto: FieldsSearchDto,
    @Res() response: Response
  ) {
    let tenantid = headers["tenantid"];
    const result = await this.fieldsAdapter.buildFieldsAdapter().searchFields(
      tenantid,
      request,
      fieldsSearchDto
    );
    return response.status(result.statusCode).json(result);
  }

  //field values
  //create fields values
  @Post("/values")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({
    description: "Fields Values has been created successfully.",
  })
  @ApiBody({ type: FieldValuesDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  // @UseInterceptors(ClassSerializerInterceptor)
  public async createFieldValues(
    @Req() request: Request,
    @Body() fieldValuesDto: FieldValuesDto,
    @Res() response: Response
  ) {
    return await this.fieldsAdapter.buildFieldsAdapter().createFieldValues(
      request,
      fieldValuesDto,
      response
    );  
    
  }

  //search fields values
  @Post("/values/search")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Fields Values list." })
  @ApiBody({ type: FieldValuesSearchDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  // @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    strategy: "excludeAll",
  })
  public async searchFieldValues(
    @Req() request: Request,
    @Body() fieldValuesSearchDto: FieldValuesSearchDto,
    @Res() response: Response
  ) {
    const result = await this.fieldsAdapter.buildFieldsAdapter().searchFieldValues(
      request,
      fieldValuesSearchDto
    );
    return response.status(result.statusCode).json(result);
  }
}
