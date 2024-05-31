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
  UseFilters,
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
import { AllExceptionsFilter } from "src/common/filters/exception.filter";
import { APIID } from "src/common/utils/api-id.config";
import { LoggerService } from "src/common/loggers/logger.service";

@ApiTags("Fields")
@Controller("fields")
@UseGuards(JwtAuthGuard)
export class FieldsController {
  constructor(
    private fieldsAdapter: FieldsAdapter,
    private readonly fieldsService: FieldsService,
    private readonly logger:LoggerService
  ) {}

  //fields
  //create fields
  @Post("/create")
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
    this.logger.log(`Creating fields`, "createFields",request['user'].userId, "info");
    Object.assign(fieldsDto, payload);
    return await this.fieldsAdapter.buildFieldsAdapter().createFields(request, fieldsDto, response);
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
    this.logger.log(`Getting fields list`, "searchFields",request['user'].userId, "info");
    let tenantid = headers["tenantid"];
    return await this.fieldsAdapter.buildFieldsAdapter().searchFields(
      tenantid,
      request,
      fieldsSearchDto,
      response
    );
  }

  //field values
  //create fields values
  @UseFilters(new AllExceptionsFilter(APIID.FIELDVALUES_CREATE))
  @Post("/values/create")
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
    this.logger.log(`Creating field values`, "createFieldValues",request['user'].userId, "info");
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
    this.logger.log(`Getting field values list`, "searchFieldValues",request['user'].userId, "info");
    const result = await this.fieldsAdapter.buildFieldsAdapter().searchFieldValues(
      request,
      fieldValuesSearchDto,
      response
    );
  }
}
