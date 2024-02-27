import {
  ApiTags,
  ApiBody,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiCreatedResponse,
  ApiBasicAuth,
  ApiConsumes,
  ApiHeader,
} from "@nestjs/swagger";
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  Req,
  Query,
  CacheInterceptor,
  UploadedFile,
  Res,
  Headers,
} from "@nestjs/common";
import { CohortSearchDto } from "./dto/cohort-search.dto";
import { Request } from "@nestjs/common";
import { CohortDto } from "./dto/cohort.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { editFileName, imageFileFilter } from "./utils/file-upload.utils";
import { diskStorage } from "multer";
import { Response } from "express";

import { CohortAdapter } from "./cohortadapter";
import { CohortCreateDto } from "./dto/cohort-create.dto";
import { ImportCsvDto } from "src/user/dto/user-import-csv.dto";
import { SuccessResponse } from "src/success-response";
import * as winston from 'winston';

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'import_cohort.log' }) // Log file for import
  ]
});

@ApiTags("Cohort")
@Controller("cohort")
export class CohortController {
  constructor(private cohortAdapter: CohortAdapter) {}

  //create cohort
  @Post()
  @ApiConsumes("multipart/form-data")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Cohort has been created successfully." })
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: process.env.IMAGEPATH,
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    })
  )
  @ApiBody({ type: CohortCreateDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiHeader({
    name: "tenantid",
  })
  public async createCohort(
    @Headers() headers,
    @Req() request: Request,
    @Body() cohortCreateDto: CohortCreateDto,
    @UploadedFile() image
  ) {
    let tenantid = headers["tenantid"];
    const payload = {
      image: image?.filename,
      tenantId: tenantid,
    };
    Object.assign(cohortCreateDto, payload);

    return this.cohortAdapter
      .buildCohortAdapter()
      .createCohort(request, cohortCreateDto);
  }


    // IMPORT CSV FILE
    @Post("/importCsv")
    @UseInterceptors(FileInterceptor('file'))
    @ApiBasicAuth("access-token")
    @ApiBody({ type: ImportCsvDto })
    @ApiForbiddenResponse({ description: "Forbidden" })
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiHeader({
      name: "tenantid",
    })
    public async importCsv(
      @Req() request: Request,
      @Headers() headers,
      @UploadedFile() file,
      @Body() importCsvDto: ImportCsvDto
    ) {
        const csvData = file.buffer.toString('utf-8').trim();
        const lines = csvData.split('\n');
        
        // Skip the first line (header) and process the rest
        const data = lines.slice(1).map(line => {
          const [name, type, status, tenantId, programId, attendanceCaptureImage, fieldValues] = line.split(',');
          return {
            name, 
            type, 
            status, 
            tenantId, 
            programId, 
            attendanceCaptureImage, 
            fieldValues
          };
        });
    
        var count = 1;
        // Process each data item

        for (const item of data) {
          
          await this.cohortAdapter          
            try {
              const response = await this.cohortAdapter.buildCohortAdapter().createCohort(request, item);
              await logger.info(`${count}. ${item.name} : User imported successfully `);
            } catch (error) {
              await logger.error(`${count}. ${item.name} : Error importing user ${error.message}`);
            }
            count ++;
        }
        return new SuccessResponse({
          statusCode: 200,
          message: "Data imported successfully."
        });
    }

  //get cohort
  @Get("/:id")
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Cohort detail" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({
    strategy: "excludeAll",
  })
  @ApiHeader({
    name: "tenantid",
  })
  public async getCohort(
    @Headers() headers,
    @Param("id") cohortId: string,
    @Req() request: Request,
    @Res() res: Response
  ) {
    let tenantid = headers["tenantid"];
    return this.cohortAdapter
      .buildCohortAdapter()
      .getCohort(tenantid, cohortId, request, res);
  }

  //search
  @Post("/search")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Cohort list." })
  @ApiBody({ type: CohortSearchDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    strategy: "excludeAll",
  })
  @ApiHeader({
    name: "tenantid",
  })
  public async searchCohort(
    @Headers() headers,
    @Req() request: Request,
    @Body() cohortSearchDto: CohortSearchDto,
    @Res() res: Response
  ) {
    let tenantid = headers["tenantid"];
    return this.cohortAdapter
      .buildCohortAdapter()
      .searchCohort(tenantid, request, cohortSearchDto, res);
  }

  //update
  @Put("/:id")
  @ApiConsumes("multipart/form-data")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Cohort has been updated successfully." })
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: process.env.IMAGEPATH,
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    })
  )
  @ApiBody({ type: CohortCreateDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async updateCohort(
    @Param("id") cohortId: string,
    @Req() request: Request,
    @Body() cohortCreateDto: CohortCreateDto,
    @UploadedFile() image
  ) {
    const response = {
      image: image?.filename,
    };
    Object.assign(cohortCreateDto, response);

    return this.cohortAdapter
      .buildCohortAdapter()
      .updateCohort(cohortId, request, cohortCreateDto);
  }
}
