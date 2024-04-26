import { ConsoleLogger, HttpStatus, Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { ErrorResponse } from "src/error-response";
const resolvePath = require("object-resolve-path");
import jwt_decode from "jwt-decode";
import { CohortDto } from "src/cohort/dto/cohort.dto";
import { CohortSearchDto } from "src/cohort/dto/cohort-search.dto";
import { UserDto } from "src/user/dto/user.dto";
import { CohortCreateDto } from "src/cohort/dto/cohort-create.dto";
import { CohortUpdateDto } from "src/cohort/dto/cohort-update.dto";
import { FieldValuesDto } from "src/fields/dto/field-values.dto";
import { FieldValuesUpdateDto } from "src/fields/dto/field-values-update.dto";
import { FieldValuesSearchDto } from "src/fields/dto/field-values-search.dto";
import { IsNull, Not, Repository, getConnection, getRepository } from "typeorm";
import { Cohort } from "src/cohort/entities/cohort.entity";
import { Fields } from "src/fields/entities/fields.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { PostgresFieldsService } from "./fields-adapter"
// import { FieldValues } from "src/fields/entities/field-values.entity";
import { response } from "express";
import APIResponse from "src/utils/response";
import { FieldValues } from "../../fields/entities/fields-values.entity";
import { v4 as uuidv4 } from 'uuid';
import { CohortMembers } from "src/cohortMembers/entities/cohort-member.entity";
import { ErrorResponseTypeOrm } from "src/error-response-typeorm";
import { isUUID } from "class-validator";



@Injectable()
export class PostgresCohortService {


  constructor(
    @InjectRepository(Cohort)
    private cohortRepository: Repository<Cohort>,
    @InjectRepository(CohortMembers)
    private cohortMembersRepository: Repository<CohortMembers>,
    @InjectRepository(FieldValues)
    private fieldValuesRepository: Repository<FieldValues>,
    @InjectRepository(Fields)
    private fieldsRepository: Repository<Fields>,
    private fieldsService: PostgresFieldsService,
  ) { }

  public async getCohortList(
    tenantId: string,
    userId: string,
    request: any,
    response: any
  ) {
    const apiId = "api.concept.editminiScreeningAnswer";
    try {
      let findCohortId = await this.findCohortName(userId);
      let result = {
        cohortData: [],
      };

      for (let data of findCohortId) {
        let cohortData = {
          cohortId: data.cohortId,
          name: data.name,
          parentId: data.parentId,
          customField: {}
        };
        const getDetails = await this.getCohortListDetails(data.cohortId);
        cohortData.customField = getDetails
        result.cohortData.push(cohortData);
      }

      return new SuccessResponse({
        statusCode: HttpStatus.OK,
        message: "Ok.",
        data: result,
      });
    } catch (error) {
      return new ErrorResponseTypeOrm({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessage: error,
      });
    }
  }

  public async getCohortsDetails(cohortId: string) {
    try {
      console.log(cohortId);

      if (!isUUID(cohortId)) {
        return new ErrorResponseTypeOrm({
          statusCode: HttpStatus.BAD_REQUEST,
          errorMessage: "Please Enter valid (UUID)",
        });
      }
      const checkData = await this.checkAuthAndValidData(cohortId);

      if (checkData === true) {
        const result = await this.getCohortDataWithCustomfield(cohortId);
        return new SuccessResponse({
          statusCode: HttpStatus.OK,
          message: "Cohort detais fetched succcessfully.",
          data: result,
        });
      } else {
        return new ErrorResponseTypeOrm({
          statusCode: HttpStatus.NOT_FOUND,
          errorMessage: "Cohort not found",
        });
      }


    } catch (error) {
      return new ErrorResponseTypeOrm({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessage: error,
      });
    }
  }

  public async getCohortDataWithCustomfield(cohortId: string) {
    const result = {
      cohortData: {
      }
    };

    let customFieldsArray = [];

    const [filledValues, cohortDetails, customFields] = await Promise.all([
      this.findFilledValues(cohortId),
      this.findCohortDetails(cohortId),
      this.findCustomFields()
    ]);


    result.cohortData = cohortDetails;
    const filledValuesMap = new Map(filledValues.map(item => [item.fieldId, item.value]));
    for (let data of customFields) {
      const fieldValue = filledValuesMap.get(data.fieldId);
      const customField = {
        fieldId: data.fieldId,
        label: data.label,
        value: fieldValue || '',
        options: data?.fieldParams?.['options'] || {},
        type: data.type || ''
      };
      customFieldsArray.push(customField);
    }
    result.cohortData['customFields'] = customFieldsArray;
    return result
  }


  async findFilledValues(cohortId: string) {
    let query = `SELECT C."cohortId",F."fieldId",F."value" FROM public."Cohort" C 
    LEFT JOIN public."FieldValues" F
    ON C."cohortId" = F."itemId" where C."cohortId" =$1`;
    let result = await this.cohortRepository.query(query, [cohortId]);
    return result;
  }

  async findCohortDetails(cohortId: string) {
    let whereClause: any = { cohortId: cohortId };
    let cohortDetails = await this.cohortRepository.findOne({
      where: whereClause
    })
    return cohortDetails;
  }

  async findCustomFields() {
    let customFields = await this.fieldsRepository.find({
      where: {
        context: 'COHORT',
        contextType: 'COHORT'
      }
    })
    return customFields;
  }

  public async findCohortName(userId: any) {
    let query = `SELECT c."name",c."cohortId",c."parentId"
    FROM public."CohortMembers" AS cm
    LEFT JOIN public."Cohort" AS c ON cm."cohortId" = c."cohortId"
    WHERE cm."userId"=$1 AND c.status=true`;
    let result = await this.cohortMembersRepository.query(query, [userId]);
    return result;
  }

  public async getCohortListDetails(userId) {
    let query = `SELECT DISTINCT f."label", fv."value", f."type", f."fieldParams"
    FROM public."CohortMembers" cm
    LEFT JOIN (
        SELECT DISTINCT ON (fv."fieldId", fv."itemId") fv.*
        FROM public."FieldValues" fv
    ) fv ON fv."itemId" = cm."cohortId"
    INNER JOIN public."Fields" f ON fv."fieldId" = f."fieldId"
    WHERE cm."cohortId" = $1;`;
    let result = await this.cohortMembersRepository.query(query, [
      userId
    ]);
    return result;
  }

  public async createCohort(request: any, cohortCreateDto: CohortCreateDto) {
    try {
      // console.log(request.user.userId)
      const decoded: any = jwt_decode(request.headers.authorization);
      cohortCreateDto.createdBy = decoded?.sub
      cohortCreateDto.updatedBy = decoded?.sub
      cohortCreateDto.status = true;
      cohortCreateDto.attendanceCaptureImage = false;

      let response;
      if (cohortCreateDto.name && cohortCreateDto.parentId) {
        const existData = await this.cohortRepository.find({
          where: { name: cohortCreateDto.name, parentId: cohortCreateDto.parentId }
        })
        if (existData.length == 0) {
          response = await this.cohortRepository.save(cohortCreateDto);
        } else {
          return new SuccessResponse({
            statusCode: HttpStatus.CONFLICT,
            message: "Cohort name already exist for this parent.",
            data: existData,
          });
        }
      } else {
        const existData = await this.cohortRepository.find({
          where: { name: cohortCreateDto.name }
        })
        if (existData.length == 0) {
          response = await this.cohortRepository.save(cohortCreateDto);
        } else {
          return new SuccessResponse({
            statusCode: HttpStatus.CONFLICT,
            message: "Cohort name already exists.",
            data: existData,
          });
        }
      }


      let cohortId = response?.cohortId;


      let field_value_array = cohortCreateDto.fieldValues.split("|");

      if (field_value_array.length > 0) {
        let field_values = [];
        for (let i = 0; i < field_value_array.length; i++) {

          let fieldValues = field_value_array[i].split(":");
          let fieldValueDto: FieldValuesDto = {
            value: fieldValues[1] ? fieldValues[1].trim() : "",
            itemId: cohortId,
            fieldId: fieldValues[0] ? fieldValues[0].trim() : "",
            createdBy: cohortCreateDto?.createdBy,
            updatedBy: cohortCreateDto?.updatedBy,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const fieldValue = await this.fieldsService.createFieldValues(request, fieldValueDto);

        }
      }

      return new SuccessResponse({
        statusCode: HttpStatus.CREATED,
        message: "Cohort Created Successfully.",
        data: response,
      });

    } catch (e) {
      return new ErrorResponseTypeOrm({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessage: e,
      });
    }
  }

  public async updateCohort(
    cohortId: string,
    request: any,
    cohortUpdateDto: CohortUpdateDto
  ) {
    try {
      const decoded: any = jwt_decode(request.headers.authorization);
      cohortUpdateDto.updatedBy = decoded?.sub
      cohortUpdateDto.createdBy = decoded?.sub
      cohortUpdateDto.status = true;


      if (!isUUID(cohortId)) {
        return new ErrorResponseTypeOrm({
          statusCode: HttpStatus.BAD_REQUEST,
          errorMessage: "Please Enter valid (UUID)",
        });
      }

      const checkData = await this.checkAuthAndValidData(cohortId);

      if (checkData === true) {
        let updateData = {};
        let fieldValueData = {};

        // Iterate over all keys in cohortUpdateDto
        for (let key in cohortUpdateDto) {
          if (cohortUpdateDto.hasOwnProperty(key) && cohortUpdateDto[key] !== null) {
            if (key !== 'fieldValues') {
              updateData[key] = cohortUpdateDto[key];
            } else {
              fieldValueData[key] = cohortUpdateDto[key];
            }
          }
        }

        const response = await this.cohortRepository.update(cohortId, updateData);


        if (fieldValueData['fieldValues']) {

          let field_value_array = cohortUpdateDto.fieldValues.split("|");
          if (field_value_array.length > 0) {

            for (let i = 0; i < field_value_array.length; i++) {
              let fieldValues = field_value_array[i].split(":");
              let fieldId = fieldValues[0] ? fieldValues[0].trim() : "";
              try {
                console.log("hii");
                
                const fieldVauesRowId = await this.fieldsService.searchFieldValueId(cohortId, fieldId)
                const rowid = fieldVauesRowId.fieldValuesId;

                let fieldValueUpdateDto: FieldValuesUpdateDto = {
                  fieldValuesId: rowid,
                  value: fieldValues[1] ? fieldValues[1].trim() : ""
                };
                await this.fieldsService.updateFieldValues(rowid, fieldValueUpdateDto);
              } catch {
                console.log("hii1");

                let fieldValueDto: FieldValuesDto = {
                  value: fieldValues[1] ? fieldValues[1].trim() : "",
                  itemId: cohortId,
                  fieldId: fieldValues[0] ? fieldValues[0].trim() : "",
                  createdBy: cohortUpdateDto?.createdBy,
                  updatedBy: cohortUpdateDto?.updatedBy,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                // console.log(fieldValueDto);
                
                await this.fieldsService.createFieldValues(request, fieldValueDto);
              }
            }
          }
        }

        return new SuccessResponse({
          statusCode: HttpStatus.OK,
          message: "Cohort updated successfully.",
          data: {
            rowCount: response.affected,
          }
        });
      } else {
        return new ErrorResponseTypeOrm({
          statusCode: HttpStatus.NOT_FOUND,
          errorMessage: "Cohort not found",
        });
      }
    } catch (e) {
      return new ErrorResponseTypeOrm({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessage: e,
      });
    }
  }

  public async searchCohort(
    tenantId: string,
    request: any,
    cohortSearchDto: CohortSearchDto,
  ) {
    try {

      let { limit, page, filters } = cohortSearchDto;

      let offset = 0;
      if (page > 1) {
        offset = (limit) * (page - 1);
      }

      if (limit === 0) {
        limit = 0;
      }
      const MAX_LIMIT = 20;
      const PAGE_LIMIT = 100000;

      // Validate the limit parameter
      if (limit > MAX_LIMIT) {
        return new ErrorResponseTypeOrm({
          statusCode: HttpStatus.BAD_REQUEST,
          errorMessage: `Limit exceeds maximum allowed value of ${MAX_LIMIT}`,
        });
      }

      if (page > PAGE_LIMIT) {
        return new ErrorResponseTypeOrm({
          statusCode: HttpStatus.BAD_REQUEST,
          errorMessage: `Page limit exceeds maximum allowed value of ${PAGE_LIMIT}`,
        });
      }

      const whereClause = {};
      if (filters && Object.keys(filters).length > 0) {
        Object.entries(filters).forEach(([key, value]) => {
          whereClause[key] = value;
        });
      }
      let results = {
        cohortDetails: [],
      };

      if (whereClause['userId']) {
        const [cohortData] = await this.cohortMembersRepository.findAndCount({
          where: whereClause,
          skip: offset,
          take: limit,
        });

        for (let data of cohortData) {
          let cohortDetails = await this.getCohortDataWithCustomfield(data.cohortId);
          results.cohortDetails.push(cohortDetails);
        }

      } else {
        const [cohortData] = await this.cohortRepository.findAndCount({
          where: whereClause,
          skip: offset,
          take: limit,
        });
        for (let data of cohortData) {
          let cohortDetails = await this.getCohortDataWithCustomfield(data.cohortId);
          results.cohortDetails.push(cohortDetails);
        }
      }

      if (results.cohortDetails.length > 0) {
        return new SuccessResponse({
          statusCode: HttpStatus.OK,
          message: 'Cohort detais fetched succcessfully',
          data: results,
        });
      } else {
        return new ErrorResponseTypeOrm({
          statusCode: HttpStatus.NOT_FOUND,
          errorMessage: "No data found.",
        });
      }



    } catch (e) {
      return new ErrorResponseTypeOrm({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessage: e,
      });
    }
  }

  public async mappedResponse(result: any) {
    const cohortValueResponse = result.map((item: any) => {
      const cohortMapping = {
        tenantId: item?.tenantId ? `${item.tenantId}` : "",
        programId: item?.programId ? `${item.programId}` : "",
        cohortId: item?.cohortId ? `${item.cohortId}` : "",
        parentId: item?.parentId ? `${item.parentId}` : "",
        name: item?.name ? `${item.name}` : "",
        type: item?.type ? `${item.type}` : "",
        status: item?.status ? `${item.status}` : "",
        image: item?.image ? `${item.image}` : "",
        createdAt: item?.createdAt ? `${item.createdAt}` : "",
        updatedAt: item?.updatedAt ? `${item.updatedAt}` : "",
        createdBy: item?.createdBy ? `${item.createdBy}` : "",
        updatedBy: item?.updatedBy ? `${item.updatedBy}` : "",
        referenceId: item?.referenceId ? `${item.referenceId}` : "",
        metadata: item?.metadata ? `${item.metadata}` : "",
      };
      return new CohortDto(cohortMapping);
    })
    return cohortValueResponse;

  }

  public async updateCohortStatus(
    cohortId: string,
    request: any
  ) {
    try {
      const decoded: any = jwt_decode(request.headers.authorization);
      // const createdBy = decoded?.sub;
      const updatedBy = decoded?.sub

      if (!isUUID(cohortId)) {
        return new ErrorResponseTypeOrm({
          statusCode: HttpStatus.BAD_REQUEST,
          errorMessage: "Please Enter valid (UUID)",
        });
      }
      const checkData = await this.checkAuthAndValidData(cohortId);

      if (checkData === true) {
        let query = `UPDATE public."Cohort"
        SET "status" = false,
        "updatedBy" = '${updatedBy}'
        WHERE "cohortId" = $1`;
        await this.cohortRepository.query(query, [cohortId]);

        await this.cohortMembersRepository.delete(
          {cohortId:cohortId}
        );
        await this.fieldValuesRepository.delete(
          {itemId:cohortId}
        );
        

        return new SuccessResponse({
          statusCode: HttpStatus.OK,
          message: "Cohort Deleted Successfully.",
        });
      } else {
        return new ErrorResponseTypeOrm({
          statusCode: HttpStatus.NOT_FOUND,
          errorMessage: "User not found",
        });
      }
    } catch (e) {
      return new ErrorResponseTypeOrm({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessage: e,
      });
    }
  }

  public async checkAuthAndValidData(id: any) {

    const existData = await this.cohortRepository.find({
      where: {
        cohortId: id
      }
    })
    if (existData.length !== 0) {
      return true;
    } else {
      return false;
    }

  }
}
