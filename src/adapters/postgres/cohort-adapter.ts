import { ConsoleLogger, HttpStatus, Injectable } from "@nestjs/common";
import { SuccessResponse } from "src/success-response";
const resolvePath = require("object-resolve-path");
import jwt_decode from "jwt-decode";
import { CohortDto, ReturnResponseBody } from "src/cohort/dto/cohort.dto";
import { CohortSearchDto } from "src/cohort/dto/cohort-search.dto";
import { UserDto } from "src/user/dto/user.dto";
import { CohortCreateDto } from "src/cohort/dto/cohort-create.dto";
import { CohortUpdateDto } from "src/cohort/dto/cohort-update.dto";
import { FieldValuesDto } from "src/fields/dto/field-values.dto";
import { FieldValuesUpdateDto } from "src/fields/dto/field-values-update.dto";
import { IsNull, Not, Repository, getConnection, getRepository } from "typeorm";
import { Cohort } from "src/cohort/entities/cohort.entity";
import { Fields } from "src/fields/entities/fields.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { PostgresFieldsService } from "./fields-adapter"
import { FieldValues } from "../../fields/entities/fields-values.entity";
import { CohortMembers } from "src/cohortMembers/entities/cohort-member.entity";
import { ErrorResponseTypeOrm } from "src/error-response-typeorm";
import { isUUID } from "class-validator";
import { UserTenantMapping } from "src/userTenantMapping/entities/user-tenant-mapping.entity";
import APIResponse from "src/common/responses/response";
import { APIID } from "src/common/utils/api-id.config";
import { State } from "src/cohort/entities/state.entity";

@Injectable()
export class PostgresCohortService {


  constructor(
    @InjectRepository(State)
    private stateRepository: Repository<State>,
    @InjectRepository(Cohort)
    private cohortRepository: Repository<Cohort>,
    @InjectRepository(CohortMembers)
    private cohortMembersRepository: Repository<CohortMembers>,
    @InjectRepository(FieldValues)
    private fieldValuesRepository: Repository<FieldValues>,
    @InjectRepository(Fields)
    private fieldsRepository: Repository<Fields>,
    @InjectRepository(UserTenantMapping)
    private UserTenantMappingRepository: Repository<UserTenantMapping>,
    private fieldsService: PostgresFieldsService,
    
  ) { }

  public async getCohortList(
    tenantId: string,
    userId: string,
    request: any,
    res: any
  ) {
    const apiId = APIID.COHORT_LIST;
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

      return APIResponse.success(res, apiId, result, (HttpStatus.OK), "Cohort list fetched successfully");

    } catch (error) {
      const errorMessage = error.message || 'Internal server error';
      return APIResponse.error(res, apiId, "Internal Server Error", errorMessage, (HttpStatus.INTERNAL_SERVER_ERROR));

    }
  }

  public async getCohortsDetails(cohortId: string, res) {
    const apiId = APIID.COHORT_READ;

    try {

      if (!isUUID(cohortId)) {
        return APIResponse.error(
          res,
          apiId,
          `Please Enter valid (UUID)`,
          'Invalid cohortId',
          (HttpStatus.BAD_REQUEST)
        )
      }
      const checkData = await this.checkAuthAndValidData(cohortId);

      if (checkData === true) {
        const result = await this.getCohortDataWithCustomfield(cohortId);
        return APIResponse.success(res, apiId, result, (HttpStatus.OK), "Cohort details fetched succcessfully.");
      } else {
        return APIResponse.error(
          res,
          apiId,
          `Cohort not found`,
          'Invalid cohortId',
          (HttpStatus.NOT_FOUND)
        )
      }

    } catch (error) {
      const errorMessage = error.message || 'Internal server error';
      return APIResponse.error(res, apiId, "Internal Server Error", errorMessage, (HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  public async getCohortDataWithCustomfield(cohortId: string) {
    const result = {
      cohortData: {}
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
      customField["dependsOn"] = null;
      if(data.source_details){
        // We need to add the dependence Condition here.
        if(data?.source_details?.source === 'table' && data?.source_details.depends_on === "null"){ 
          let dynamicOptions = await this.findDynamicOptions(data?.source_details?.table);
          customField.options = dynamicOptions
          customField["dependsOn"] = null;
        }else if(data?.source_details?.source === 'table' && data?.source_details.depends_on){
          customField.options = {};
          customField["dependsOn"] = data?.source_details.depends_on;
        }else{
          customField["dependsOn"] = null;
          customField.options = data.fieldParams;
        }
      }
      customFieldsArray.push(customField);
    }
    result.cohortData['customFields'] = customFieldsArray;
    return result
  }

  async findDynamicOptions(tableName,whereClause?:{}){
    let query:string;
    let result;
    if(whereClause){
      query = `select * from public."${tableName} where=${whereClause}"`
      result = await this.cohortRepository.query(query);
      if(!result){
        return null;
      }
      return result;
    }
    query = `select * from public."${tableName}"`
    result = await this.cohortRepository.query(query);
    if(!result){
      return null;
    }
    return result.map(result => ({
      value: result.value, 
      label: result.name
  }));
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
    return new ReturnResponseBody(cohortDetails);
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
  public async validateFieldValues(field_value_array: string[]) {
    let encounteredKeys = []
    for (const fieldValue of field_value_array) {
      const [fieldId] = fieldValue.split(":").map(value => value.trim());
      if (encounteredKeys.includes(fieldId)) {
        return { valid: false, fieldId: fieldId };
      }
      encounteredKeys.push(fieldId)
    }
    return { valid: true, fieldId: "true" };
  };
  
  public async createCohort(request: any, cohortCreateDto: CohortCreateDto, res) {
    const apiId = APIID.COHORT_CREATE;

    try {
      let field_value_array = cohortCreateDto.fieldValues.split("|");
      //Check duplicate field
      let valid = await this.validateFieldValues(field_value_array);
      if (valid && valid?.valid === false) {
        return APIResponse.error(
          res,
          apiId,
          `Duplicate fieldId '${valid.fieldId}' found in fieldValues.`,
          `Duplicate fieldId`,
          (HttpStatus.CONFLICT)
        )
      }
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
          if (existData[0].status == false) {
            const updateData = { status: true };
            const cohortId = existData[0].cohortId;
            await this.cohortRepository.update(cohortId, updateData);
            const cohortData = await this.cohortRepository.find({ where: { cohortId: cohortId } })
            response = cohortData[0];
          } else {
            return APIResponse.error(
              res,
              apiId,
              `Cohort name already exist for this parent.`,
              `Cohort already exists`,
              (HttpStatus.CONFLICT)
            )
          }
        }
      } else {
        const existData = await this.cohortRepository.find({
          where: { name: cohortCreateDto.name }
        })
        if (existData.length === 0) {
          response = await this.cohortRepository.save(cohortCreateDto);
        } else {
          if (existData[0].status == false) {
            const updateData = { status: true };
            const cohortId = existData[0].cohortId;
            await this.cohortRepository.update(cohortId, updateData);
            const cohortData = await this.cohortRepository.find({ where: { cohortId: cohortId } })
            response = cohortData[0];
          } else {
            return APIResponse.error(
              res,
              apiId,
              `Cohort name already exists`,
              `Duplicate Cohort name`,
              (HttpStatus.CONFLICT)
            )
          }
        }
      }

      let cohortId = response?.cohortId;

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
          const fieldValue = await this.fieldsService.findAndSaveFieldValues(fieldValueDto);
        }
      }


      response = new ReturnResponseBody(response);
      return APIResponse.success(res, apiId, response, (HttpStatus.CREATED), "Cohort Created Successfully.");


    } catch (error) {
      const errorMessage = error.message || 'Internal server error';
      return APIResponse.error(res, apiId, "Internal Server Error", errorMessage, (HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  public async updateCohort(
    cohortId: string,
    request: any,
    cohortUpdateDto: CohortUpdateDto,
    res
  ) {
    const apiId = APIID.COHORT_UPDATE;
    try {

      let field_value_array = cohortUpdateDto.fieldValues.split("|");
      let valid = await this.validateFieldValues(field_value_array);
      if (valid && valid?.valid === false) {
        return APIResponse.error(
          res,
          apiId,
          `Duplicate fieldId '${valid.fieldId}' found in fieldValues`,
          `Duplicate fieldId`,
          (HttpStatus.CONFLICT)
        )
      }

      const decoded: any = jwt_decode(request.headers.authorization);
      cohortUpdateDto.updatedBy = decoded?.sub
      cohortUpdateDto.createdBy = decoded?.sub
      cohortUpdateDto.status = true;
      let response;

      if (!isUUID(cohortId)) {
        return APIResponse.error(
          res,
          apiId,
          `Please Enter valid cohortId(UUID)`,
          `Invalid cohortId`,
          (HttpStatus.CONFLICT)
        )
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

        if (cohortUpdateDto.name && cohortUpdateDto.parentId) {
          const existData = await this.cohortRepository.find({
            where: { name: cohortUpdateDto.name, parentId: cohortUpdateDto.parentId }
          })



          if (existData.length == 0) {
            response = await this.cohortRepository.update(cohortId, updateData);
          } else {
            if (existData[0].status == false) {
              const updateData = { status: true };
              const cohortId = existData[0].cohortId;
              await this.cohortRepository.update(cohortId, updateData);
              const cohortData = await this.cohortRepository.find({ where: { cohortId: cohortId } })
              response = cohortData[0];
            } else {
              return APIResponse.error(
                res,
                apiId,
                `Cohort name already exist for this parent please choose another name`,
                `Duplicate cohort name`,
                (HttpStatus.CONFLICT),
              )
            }
          }
        } else {
          const existData = await this.cohortRepository.find({
            where: { name: cohortUpdateDto.name }
          })

          if (existData.length == 0) {
            response = await this.cohortRepository.update(cohortId, updateData);
          } else {
            if (existData[0].status == false) {
              const updateData = { status: true };
              const cohortId = existData[0].cohortId;
              await this.cohortRepository.update(cohortId, updateData);
              const cohortData = await this.cohortRepository.find({ where: { cohortId: cohortId } })
              response = cohortData[0];
            } else {
              return APIResponse.error(
                res,
                apiId,
                `Cohort name already exists please choose another name`,
                `Duplicate cohort name`,
                (HttpStatus.CONFLICT)
              )
            }
          }
        }

        if (fieldValueData['fieldValues']) {
          if (field_value_array.length > 0) {

            for (let i = 0; i < field_value_array.length; i++) {
              let fieldValues = field_value_array[i].split(":");
              let fieldId = fieldValues[0] ? fieldValues[0].trim() : "";
              try {

                const fieldVauesRowId = await this.fieldsService.searchFieldValueId(cohortId, fieldId)
                const rowid = fieldVauesRowId.fieldValuesId;

                let fieldValueUpdateDto: FieldValuesUpdateDto = {
                  fieldValuesId: rowid,
                  value: fieldValues[1] ? fieldValues[1].trim() : ""
                };
                await this.fieldsService.updateFieldValues(rowid, fieldValueUpdateDto);
              } catch {

                let fieldValueDto: FieldValuesDto = {
                  value: fieldValues[1] ? fieldValues[1].trim() : "",
                  itemId: cohortId,
                  fieldId: fieldValues[0] ? fieldValues[0].trim() : "",
                  createdBy: cohortUpdateDto?.createdBy,
                  updatedBy: cohortUpdateDto?.updatedBy,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                await this.fieldsService.findAndSaveFieldValues(fieldValueDto);
              }
            }
          }
        }

        return APIResponse.success(res, apiId, response.affected, (HttpStatus.OK), "Cohort updated successfully.");

      } else {
        return APIResponse.error(
          res,
          apiId,
          `Cohort not found`,
          `Cohort not found`,
          (HttpStatus.NOT_FOUND)
        )
      }
    } catch (error) {
      const errorMessage = error.message || 'Internal server error';
      return APIResponse.error(res, apiId, "Internal Server Error", errorMessage, (HttpStatus.INTERNAL_SERVER_ERROR));

    }
  }

  public async searchCohort(
    tenantId: string,
    request: any,
    cohortSearchDto: CohortSearchDto, response
  ) {
    const apiId = APIID.COHORT_LIST;
    try {

      let { limit, page, filters } = cohortSearchDto;

      let offset = 0;
      if (limit > 0 && page > 0) {
        offset = (limit) * (page - 1);
      }
      if (limit === 0) { limit = 200 }
      const emptyValueKeys = {};
      let emptyKeysString = '';

      const MAX_LIMIT = 200;
      const PAGE_LIMIT = 10000000;

      // Validate the limit parameter
      if (limit > MAX_LIMIT) {
        return APIResponse.error(
          response,
          apiId,
          `Limit exceeds maximum allowed value of ${MAX_LIMIT}`,
          `Limit exceeded`,
          (HttpStatus.BAD_REQUEST)
        )
      }

      if (page > PAGE_LIMIT) {
        return APIResponse.error(
          response,
          apiId,
          `Page limit exceeds maximum allowed value of ${PAGE_LIMIT}`,
          `Page limit exceeded`,
          (HttpStatus.BAD_REQUEST)
        )
      }

      const allowedKeys = ["userId", "cohortId", "name"];
      const whereClause = {};

      if (filters && Object.keys(filters).length > 0) {
        Object.entries(filters).forEach(([key, value]) => {
          if (!allowedKeys.includes(key)) {
            return APIResponse.error(
              response,
              apiId,
              `${key} Invalid key`,
              `Invalid filter key`,
              (HttpStatus.BAD_REQUEST)
            )
          } else {
            if (value === '') {
              emptyValueKeys[key] = value;
              emptyKeysString += (emptyKeysString ? ', ' : '') + key;
            } else {
              whereClause[key] = value;
            }
          }
        });
      }

      if (whereClause['userId'] && !isUUID(whereClause['userId'])) {
        return APIResponse.error(
          response,
          apiId,
          `Invalid User ID format. It must be a valid UUID`,
          `Invalid userId`,
          (HttpStatus.BAD_REQUEST)
        )
      }

      if (whereClause['cohortId'] && !isUUID(whereClause['cohortId'])) {
        return APIResponse.error(
          response,
          apiId,
          `Invalid Cohort ID format. It must be a valid UUID`,
          `Invalid cohortID`,
          (HttpStatus.BAD_REQUEST)
        )
      }

      let results = {
        cohortDetails: [],
      };

      let count=0

      if (whereClause['userId']) {
        const additionalFields = Object.keys(whereClause).filter(key => key !== 'userId');
        if (additionalFields.length > 0) {
          // Handle the case where userId is provided along with other fields
          return APIResponse.error(
            response,
            apiId,
            `When filtering by userId, do not include additional fields`,
            'Invalid filters',
            (HttpStatus.BAD_REQUEST)
          )
        }

        let userTenantMapExist = await this.UserTenantMappingRepository.find({
          where: {
            tenantId: tenantId,
            userId: whereClause['userId']
          }
        })
        if (userTenantMapExist.length == 0) {
          return APIResponse.error(
            response,
            apiId,
            `User is not mapped for this tenant`,
            'Invalid combination of userId and tenantId',
            (HttpStatus.BAD_REQUEST)
          )
        }
        const [data,totalCount] = await this.cohortMembersRepository.findAndCount({
          where: whereClause,
          skip: offset,
        });
        const cohortData = data.slice(offset, offset + (limit));
        count=totalCount
        for (let data of cohortData) {
          let cohortDetails = await this.getCohortDataWithCustomfield(data.cohortId);
          results.cohortDetails.push(cohortDetails);
        }
      } else {
        const [data,totalcount] = await this.cohortRepository.findAndCount({
          where: whereClause,
          skip: offset
        });
        const cohortData = data.slice(offset, offset + (limit));
        count=totalcount

        for (let data of cohortData) {
          let cohortDetails = await this.getCohortDataWithCustomfield(data.cohortId);
          results.cohortDetails.push(cohortDetails);
        }
      }
      
      if (results.cohortDetails.length > 0) {
        const totalCount = results.cohortDetails.length
        return APIResponse.success(response, apiId, {count,results}, (HttpStatus.OK), "Cohort details fetched successfully");

      } else {
        return APIResponse.error(
          response,
          apiId,
          `No data found.`,
          'No data found.',
          (HttpStatus.NOT_FOUND)
        )
      }


    } catch (error) {
      const errorMessage = error.message || 'Internal server error';
      return APIResponse.error(response, apiId, "Internal Server Error", errorMessage, (HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }


  public async updateCohortStatus(
    cohortId: string,
    request: any,
    response
  ) {
    const apiId = APIID.COHORT_DELETE;
    try {
      const decoded: any = jwt_decode(request.headers.authorization);
      // const createdBy = decoded?.sub;
      const updatedBy = decoded?.sub

      if (!isUUID(cohortId)) {
        return APIResponse.error(
          response,
          apiId,
          `Invalid Cohort Id format. It must be a valid UUID`,
          'Invalid cohortId',
          (HttpStatus.BAD_REQUEST)
        )
      }
      const checkData = await this.checkAuthAndValidData(cohortId);

      if (checkData === true) {
        let query = `UPDATE public."Cohort"
        SET "status" = false,
        "updatedBy" = '${updatedBy}'
        WHERE "cohortId" = $1`;
        const affectedrows = await this.cohortRepository.query(query, [cohortId]);
        await this.cohortMembersRepository.delete(
          { cohortId: cohortId }
        );
        await this.fieldValuesRepository.delete(
          { itemId: cohortId }
        );


        return APIResponse.success(response, apiId, affectedrows[1], (HttpStatus.OK), "Cohort Deleted Successfully.");

      } else {
        return APIResponse.error(
          response,
          apiId,
          `Cohort not found`,
          'Invalid cohortId',
          (HttpStatus.BAD_REQUEST)
        )
      }
    } catch (error) {
      const errorMessage = error.message || 'Internal server error';
      return APIResponse.error(response, apiId, "Internal Server Error", errorMessage, (HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  public async checkAuthAndValidData(id: any) {

    const existData = await this.cohortRepository.find({
      where: {
        cohortId: id,
        status: true
      }
    })
    if (existData.length !== 0) {
      return true;
    } else {
      return false;
    }

  }
}
