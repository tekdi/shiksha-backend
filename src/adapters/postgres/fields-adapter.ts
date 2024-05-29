import { HttpStatus, Injectable } from "@nestjs/common";
import { FieldsDto } from "src/fields/dto/fields.dto";
import { FieldsSearchDto } from "src/fields/dto/fields-search.dto";
import { FieldValuesDto } from "src/fields/dto/field-values.dto";
import { FieldValuesUpdateDto } from "src/fields/dto/field-values-update.dto";
import { FieldValuesSearchDto } from "src/fields/dto/field-values-search.dto";
import { ErrorResponse } from "src/error-response";
import { Fields } from "../../fields/entities/fields.entity";
import { FieldValues } from "../../fields/entities/fields-values.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SuccessResponse } from "src/success-response";
import { ErrorResponseTypeOrm } from "src/error-response-typeorm";
import APIResponse from "src/common/responses/response";
import { APIID } from "src/common/utils/api-id.config";

@Injectable()
export class PostgresFieldsService {
    constructor(
        @InjectRepository(Fields)
        private fieldsRepository: Repository<Fields>,
        @InjectRepository(FieldValues)
        private fieldsValuesRepository: Repository<FieldValues>,
    ) { }

    //fields
    async createFields(request: any, fieldsDto: FieldsDto) {
        try {

            const fieldsData: any = {}; // Define an empty object to store field data

            Object.keys(fieldsDto).forEach((e) => {
                if (fieldsDto[e] && fieldsDto[e] !== "") {
                    if (e === "render") {
                        fieldsData[e] = fieldsDto[e];
                    } else if (Array.isArray(fieldsDto[e])) {
                        fieldsData[e] = JSON.stringify(fieldsDto[e]);
                    } else {
                        fieldsData[e] = fieldsDto[e];
                    }
                }
            });

            let result = await this.fieldsRepository.save(fieldsData);
            return new SuccessResponse({
                statusCode: HttpStatus.CREATED,
                message: "Ok.",
                data: result,
            });

        } catch (e) {
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                errorMessage: e,
            });
        }
    }

    async searchFields(tenantId: string, request: any, fieldsSearchDto: FieldsSearchDto) {
        try {

            const getConditionalData = await this.search(fieldsSearchDto)
            const offset = getConditionalData.offset;
            const limit = getConditionalData.limit;
            const whereClause = getConditionalData.whereClause;

            const getFieldValue = await this.searchFieldData(offset, limit, whereClause)


            return new SuccessResponse({
                statusCode: HttpStatus.OK,
                message: 'Ok.',
                totalCount: getFieldValue.totalCount,
                data: getFieldValue.mappedResponse,
            });

        } catch (e) {
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                errorMessage: e,
            });
        }
    }

    async searchFieldData(offset: number, limit: string, searchData: any) {
        let queryOptions: any = {
            where: searchData,
        };

        if (offset !== undefined) {
            queryOptions.skip = offset;
        }

        if (limit !== undefined) {
            queryOptions.take = parseInt(limit);
        }


        const [results, totalCount] = await this.fieldsRepository.findAndCount(queryOptions);

        const mappedResponse = await this.mappedResponseField(results);
        return { mappedResponse, totalCount };
    }

    async createFieldValues(request: any, fieldValuesDto: FieldValuesDto,res) {
        const apiId = APIID.FIELDVALUES_CREATE;


        try {
                let result = await this.findAndSaveFieldValues(fieldValuesDto);
                if(!result){
                    APIResponse.error(
                        res,
                        apiId,
                        `Fields not found`,
                        `Fields not found`,
                        (HttpStatus.NOT_FOUND)
                      )

                }
               return APIResponse.success(res, apiId, result, (HttpStatus.CREATED), "Ok");


        } catch (error) {
            const errorMessage = error.message || 'Internal server error';
           return APIResponse.error(res, apiId, "Internal Server Error",errorMessage, (HttpStatus.INTERNAL_SERVER_ERROR));   

        }
    }

    async searchFieldValues(request: any, fieldValuesSearchDto: FieldValuesSearchDto) {
        try {
            const getConditionalData = await this.search(fieldValuesSearchDto)
            const offset = getConditionalData.offset;
            const limit = getConditionalData.limit;
            const whereClause = getConditionalData.whereClause;

            const getFieldValue = await this.getSearchFieldValueData(offset, limit, whereClause)

            return new SuccessResponse({
                statusCode: HttpStatus.OK,
                message: 'Ok.',
                totalCount: getFieldValue.totalCount,
                data: getFieldValue.mappedResponse,
            });

        } catch (e) {
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                errorMessage: e,
            });
        }
    }

    async getSearchFieldValueData(offset: number, limit: string, searchData: any) {
        let queryOptions: any = {
            where: searchData,
        };

        if (offset !== undefined) {
            queryOptions.skip = offset;
        }

        if (limit !== undefined) {
            queryOptions.take = parseInt(limit);
        }

        const [results, totalCount] = await this.fieldsValuesRepository.findAndCount(queryOptions);
        const mappedResponse = await this.mappedResponse(results);

        return { mappedResponse, totalCount };

    }

    async searchFieldValueId(itemId: string, fieldId: string) {
        const response = await this.fieldsValuesRepository.findOne({
            where: { itemId: itemId, fieldId: fieldId },
        });
        return response;
    }

    async updateFieldValues(id: string, fieldValuesUpdateDto: FieldValuesUpdateDto) {

        try {
            const fieldsData: any = {};
            Object.keys(fieldValuesUpdateDto).forEach((e) => {
                if (fieldValuesUpdateDto[e] && fieldValuesUpdateDto[e] != "") {
                    if (Array.isArray(fieldValuesUpdateDto[e])) {
                        fieldsData[e] = JSON.stringify(fieldValuesUpdateDto[e]);
                    } else {
                        fieldsData[e] = fieldValuesUpdateDto[e];
                    }
                }
            });
            const response = await this.fieldsValuesRepository.update(id, fieldValuesUpdateDto);

            return response;
        } catch (e) {
            return new ErrorResponse({
                errorCode: "400",
                errorMessage: e,
            });
        }
    }

    public async getFieldsAndFieldsValues(cohortId: string) {
        let query = `SELECT FV."value",FV."itemId", FV."fieldId", F."name" AS fieldname, F."label", F."context",F."type", F."state", F."contextType", F."fieldParams" FROM public."FieldValues" FV 
        LEFT JOIN public."Fields" F
        ON FV."fieldId" = F."fieldId" where FV."itemId" =$1`;
        const results = await this.fieldsValuesRepository.query(query, [cohortId]);
        return results;
    }


    public async mappedResponse(result: any) {
        const fieldValueResponse = result.map((item: any) => {
            const fieldValueMapping = {
                value: item?.value ? `${item.value}` : "",
                fieldValuesId: item?.fieldValuesId ? `${item.fieldValuesId}` : "",
                itemId: item?.itemId ? `${item.itemId}` : "",
                fieldId: item?.fieldId ? `${item.fieldId}` : "",
                createdAt: item?.createdAt ? `${item.createdAt}` : "",
                updatedAt: item?.updatedAt ? `${item.updatedAt}` : "",
                createdBy: item?.createdBy ? `${item.createdBy}` : "",
                updatedBy: item?.updatedBy ? `${item.updatedBy}` : "",
            };

            return new FieldValuesDto(fieldValueMapping);
        });

        return fieldValueResponse;
    }

    public async mappedResponseField(result: any) {
        const fieldResponse = result.map((item: any) => {

            const fieldMapping = {
                fieldId: item?.fieldId ? `${item.fieldId}` : "",
                assetId: item?.assetId ? `${item.assetId}` : "",
                context: item?.context ? `${item.context}` : "",
                groupId: item?.groupId ? `${item.groupId}` : "",
                name: item?.name ? `${item.name}` : "",
                label: item?.label ? `${item.label}` : "",
                defaultValue: item?.defaultValue ? `${item.defaultValue}` : "",
                type: item?.type ? `${item.type}` : "",
                note: item?.note ? `${item.note}` : "",
                description: item?.description ? `${item.description}` : "",
                state: item?.state ? `${item.state}` : "",
                required: item?.required ? `${item.required}` : "",
                ordering: item?.ordering ? `${item.ordering}` : "",
                metadata: item?.metadata ? `${item.metadata}` : "",
                access: item?.access ? `${item.access}` : "",
                onlyUseInSubform: item?.onlyUseInSubform ? `${item.onlyUseInSubform}` : "",
                tenantId: item?.tenantId ? `${item.tenantId}` : "",
                createdAt: item?.createdAt ? `${item.createdAt}` : "",
                updatedAt: item?.updatedAt ? `${item.updatedAt}` : "",
                createdBy: item?.createdBy ? `${item.createdBy}` : "",
                updatedBy: item?.updatedBy ? `${item.updatedBy}` : "",
                contextId: item?.contextId ? `${item.contextId}` : "",
                render: item?.render ? `${item.render}` : "",
                contextType: item?.contextType ? `${item.contextType}` : "",
                fieldParams: item?.fieldParams ? JSON.stringify(item.fieldParams) : ""
            };

            return new FieldsDto(fieldMapping);
        });

        return fieldResponse;
    }

    public async findAndSaveFieldValues(fieldValuesDto: FieldValuesDto){

        const checkFieldValueExist = await this.fieldsValuesRepository.find({
            where: { itemId: fieldValuesDto.itemId, fieldId: fieldValuesDto.fieldId },
        });
        
        if (checkFieldValueExist.length == 0) {
            let result = await this.fieldsValuesRepository.save(fieldValuesDto);
            return result
        }
        return false;
    }


    public async search(dtoFileName){
        let { limit, page, filters } = dtoFileName;
    
        let offset = 0;
        if (page > 1) {
            offset = parseInt(limit) * (page - 1);
        }
        
        if (limit.trim() === '') {
            limit = '0';
        }
    
        const whereClause = {};
        if (filters && Object.keys(filters).length > 0) {
            Object.entries(filters).forEach(([key, value]) => {
                whereClause[key] = value;
            });
        }
        return {offset,limit,whereClause};
      }

}
