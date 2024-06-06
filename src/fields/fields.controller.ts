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
import { JwtAuthGuard } from "src/common/guards/keycloak.guard";
import { AllExceptionsFilter } from "src/common/filters/exception.filter";
import { APIID } from "src/common/utils/api-id.config";
import { FieldOptionsDto } from "src/fields/dto/field-values-create.dto";

@ApiTags("Fields")
@Controller("fields")
@UseGuards(JwtAuthGuard)
export class FieldsController {
  constructor(
    private fieldsAdapter: FieldsAdapter,
  ) { }

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
    return await this.fieldsAdapter.buildFieldsAdapter().searchFieldValues(
      request,
      fieldValuesSearchDto,
      response
    );
  }


  //Get Field Option
  @Post("/fieldOptions")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Field Options list." })
  @ApiBody({ type: FieldsSearchDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  // @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    strategy: "excludeAll",
  })

  public async getFieldOptions(
    @Headers() headers,
    @Req() request: Request,
    @Body() fieldOptionsDto: FieldOptionsDto,
    @Res() response: Response
  ) {
    return await this.fieldsAdapter.buildFieldsAdapter().getFieldOptions(request, fieldOptionsDto, response);
  }
}
