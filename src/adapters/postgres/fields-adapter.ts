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
import APIResponse from "src/common/responses/response";
import { APIID } from "src/common/utils/api-id.config";
import { IServicelocatorfields } from "../fieldsservicelocator";
import { Response } from "express";
import { readFileSync } from "fs";
import path, { join } from 'path';
import { maskFieldValue, encrypt } from "src/common/utils/mask-data";

@Injectable()
export class PostgresFieldsService implements IServicelocatorfields {
    constructor(
        @InjectRepository(Fields)
        private fieldsRepository: Repository<Fields>,
        @InjectRepository(FieldValues)
        private fieldsValuesRepository: Repository<FieldValues>,
    ) { }

    //fields api - no change needed
    async createFields(request: any, fieldsDto: FieldsDto, response: Response,) {
        const apiId = APIID.FIELDS_CREATE;
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
       
            return await APIResponse.success(response, apiId, result,
                HttpStatus.CREATED, 'Fields created successfully.')

        } catch (e) {
            const errorMessage = e?.message || 'Something went wrong';
            return APIResponse.error(response, apiId, "Internal Server Error", `Error : ${errorMessage}`, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async searchFields(tenantId: string, request: any, fieldsSearchDto: FieldsSearchDto, response: Response) {
        const apiId = APIID.FIELDS_SEARCH;
        try {

            const getConditionalData = await this.search(fieldsSearchDto)
            const offset = getConditionalData.offset;
            const limit = getConditionalData.limit;
            const whereClause = getConditionalData.whereClause;

            const getFieldValue = await this.searchFieldData(offset, limit, whereClause)


            const result = {
                totalCount: getFieldValue.totalCount,
                fields: getFieldValue.mappedResponse,
            }

            return await APIResponse.success(response, apiId, result,
                HttpStatus.OK, 'Fields fetched successfully.')


        } catch (e) {
            const errorMessage = e?.message || 'Something went wrong';
            return APIResponse.error(response, apiId, "Internal Server Error", `Error : ${errorMessage}`, HttpStatus.INTERNAL_SERVER_ERROR)
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

    async createFieldValues(request: any, fieldValuesDto: FieldValuesDto,res:Response) {
        const apiId = APIID.FIELDVALUES_CREATE;


        try {
            let result = await this.findAndSaveFieldValues(fieldValuesDto);
            if (!result) {
                APIResponse.error(
                    res,
                    apiId,
                    `Fields not found or already exist`,
                    `Fields not found or already exist`,
                    (HttpStatus.NOT_FOUND)
                )

            }
            return APIResponse.success(res, apiId, result, (HttpStatus.CREATED), "Field Values created successfully");


        } catch (error) {
            const errorMessage = error.message || 'Something went wrong';
            return APIResponse.error(res, apiId, "Internal Server Error", errorMessage, (HttpStatus.INTERNAL_SERVER_ERROR));

        }
    }

    // api 
    async searchFieldValues(request: any, fieldValuesSearchDto: FieldValuesSearchDto, response: Response) { 
        const apiId = APIID.FIELDVALUES_SEARCH;
        try {
            const getConditionalData = await this.search(fieldValuesSearchDto)
            const offset = getConditionalData.offset;
            const limit = getConditionalData.limit;
            const whereClause = getConditionalData.whereClause;

            const getFieldValue = await this.getSearchFieldValueData(offset, limit, whereClause)

            const result = {
                totalCount: getFieldValue.totalCount,
                fields: getFieldValue.mappedResponse,
            }

            return await APIResponse.success(response, apiId, result,
                HttpStatus.OK, 'Field Values fetched successfully.')

        } catch (e) {
            const errorMessage = e?.message || 'Something went wrong';
            return APIResponse.error(response, apiId, "Internal Server Error", `Error : ${errorMessage}`, HttpStatus.INTERNAL_SERVER_ERROR)
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

    public async findAndSaveFieldValues(fieldValuesDto: FieldValuesDto)  {
// TODO
        const field = await this.fieldsRepository.findOne({ where : {fieldId: fieldValuesDto.fieldId}})
        const checkFieldValueExist = await this.fieldsValuesRepository.find({
            where: { itemId: fieldValuesDto.itemId, fieldId: fieldValuesDto.fieldId }
        });
        
        console.log(checkFieldValueExist,"fdto")

        const { isPII } = field?.fieldAttributes;
       
        if(isPII && checkFieldValueExist.length === 0) {
            const maskedFieldValue = maskFieldValue(fieldValuesDto.value);
            const encryptedFieldValue = encrypt(fieldValuesDto.value);
            fieldValuesDto.value = maskedFieldValue;
            fieldValuesDto["encryptedValue"] = encryptedFieldValue;
        }

        console.log(fieldValuesDto,"is")

        if (checkFieldValueExist.length == 0) {

            console.log(fieldValuesDto, "fval")
            const { value, encryptedValue, ...result } = await this.fieldsValuesRepository.save(fieldValuesDto);

            console.log(result,"reeeee")
            return result;
        }
        return false;
    }

    public async search(dtoFileName) {
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
        return { offset, limit, whereClause };
    }

    public async getFieldOptions(request: any, fieldName: string, controllingfieldfk: string, context: string, contextType: string, response: Response) {
        const apiId = APIID.FIELDVALUES_SEARCH;
        let dynamicOptions;

        const condition: any = {
            name: fieldName,
            context: context,
        };

        if (contextType) {
            condition.contextType = contextType;
        }

        const fetchFieldParams = await this.fieldsRepository.findOne({
            where: condition
        })

        if (fetchFieldParams?.sourceDetails?.source === 'table') {
            let whereClause;
            if (controllingfieldfk) {
                whereClause = `"controllingfieldfk" = '${controllingfieldfk}'`;
            }
            dynamicOptions = await this.findDynamicOptions(fieldName, whereClause);
        } else if (fetchFieldParams?.sourceDetails?.source === 'jsonFile') {
            const filePath = path.join(
                process.cwd(),
                `${fetchFieldParams.sourceDetails.filePath}`,
            );
            let getFieldValuesFromJson = JSON.parse(readFileSync(filePath, 'utf-8'));

            if (controllingfieldfk) {
                dynamicOptions = getFieldValuesFromJson.options.filter(option => (option?.controllingfieldfk === controllingfieldfk))
            } else {
                dynamicOptions = getFieldValuesFromJson;
            }

        } else {
            fetchFieldParams.fieldParams['options'] && controllingfieldfk ?
                dynamicOptions = fetchFieldParams?.fieldParams['options'].filter((option: any) => option?.controllingfieldfk === controllingfieldfk) :
                dynamicOptions = fetchFieldParams?.fieldParams['options'];
        }

        return await APIResponse.success(response, apiId, dynamicOptions,
            HttpStatus.OK, 'Field Values fetched successfully.')
    }



    async findDynamicOptions(tableName, whereClause?: {}) {
        let query: string;
        let result;

        if (whereClause) {
            query = `select * from public."${tableName}" where ${whereClause}`

            result = await this.fieldsRepository.query(query);
            if (!result) {
                return null;
            }
            return result.map(result => ({
                value: result.value,
                label: result.name
            }));
        }

        query = `select * from public."${tableName}"`

        result = await this.fieldsRepository.query(query);
        if (!result) {
            return null;
        }

        return result.map(result => ({
            value: result.value,
            label: result.name
        }));
    }
    async findCustomFields(context: string, contextType?: string) {
        const condition: any = {
            context: context,
        };

        if (contextType) {
            condition.contextType = contextType;
        }

        let customFields = await this.fieldsRepository.find({
            where: condition
        })
        return customFields;
    }

    async findFieldValues(cohortId: string) {
        let query = `SELECT C."cohortId",F."fieldId",F."value" FROM public."Cohort" C 
    LEFT JOIN public."FieldValues" F
    ON C."cohortId" = F."itemId" where C."cohortId" =$1`;
        let result = await this.fieldsRepository.query(query, [cohortId]);
        return result;
    }

    async getFieldValuesData(id: string, context: string, contextType?: string) {
        let customField;
        let fieldsArr = [];
        const [filledValues, customFields] = await Promise.all([
            this.findFieldValues(id),
            this.findCustomFields(context, contextType)
        ]);

        const filledValuesMap = new Map(filledValues.map(item => [item.fieldId, item.value]));
        for (let data of customFields) {
            const fieldValue = filledValuesMap.get(data?.fieldId);
            customField = {
                fieldId: data?.fieldId,
                name: data?.name,
                label: data?.label,
                order: data?.ordering,
                isRequired: data?.fieldAttributes?.isRequired,
                isEditable: data?.fieldAttributes?.isEditable,
                value: fieldValue || '',
                options: data?.fieldParams?.['options'] || {},
                type: data?.type || ''
            };

            if (data?.sourceDetails) {
                //If the value of the "dependsOn" field is true, do not retrieve values from the "custom table", "fieldParams" and the JSON file also.
                if (data?.dependsOn === false) {
                    if (data?.sourceDetails?.source === 'table') {
                        let dynamicOptions = await this.findDynamicOptions(data?.sourceDetails?.table);
                        customField.options = dynamicOptions;
                    } else if (data?.sourceDetails?.source === 'jsonFile') {
                        const filePath = path.join(
                            process.cwd(),
                            `${data?.sourceDetails?.filePath}`,
                        );
                        customField = JSON.parse(readFileSync(filePath, 'utf-8'));
                    }
                } else {
                    customField.options = null;
                }
            } else {
                customField.options = data?.fieldParams?.['options'] || null;
            }
            fieldsArr.push(customField);
        }

        return fieldsArr;
    }
}
