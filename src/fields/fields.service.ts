import { Injectable } from "@nestjs/common";
import { FieldsDto } from "src/fields/dto/fields.dto";
import { FieldsSearchDto } from "src/fields/dto/fields-search.dto";
import { FieldValuesDto } from "src/fields/dto/field-values.dto";
import { FieldValuesSearchDto } from "src/fields/dto/field-values-search.dto";
import jwt_decode from "jwt-decode";
import { ErrorResponse } from "src/error-response";
import { Fields } from "./entities/fields.entity";
import { FieldValues } from "./entities/fields-values.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Not, Repository, getConnection, getRepository } from "typeorm";
import { SuccessResponse } from "src/success-response";

@Injectable()
export class FieldsService {
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
                statusCode: 200,
                message: "Ok.",
                data: result,
            });

        } catch (e) {
            console.error(e);
            return new ErrorResponse({
                errorCode: "400",
                errorMessage: e,
            });
        }
    }

    async searchFields(tenantId: string, request: any, fieldsSearchDto: FieldsSearchDto) {
        try {

            let { limit, page, filters } = fieldsSearchDto;

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
            else {
                whereClause['tenantId'] = tenantId;
            }

            const [results, totalCount] = await this.fieldsRepository.findAndCount({
                where: whereClause,
                skip: offset,
            });

            return new SuccessResponse({
                statusCode: 200,
                message: 'Ok.',
                totalCount,
                data: results,
            });
        } catch (e) {
            console.error(e);
            return new ErrorResponse({
                errorCode: "400",
                errorMessage: e,
            });
        }
    }

    async createFieldValues(request: any, fieldValuesDto: FieldValuesDto) {
        try {

            const fieldsData: any = {};
            Object.keys(fieldValuesDto).forEach((e) => {
                if (fieldValuesDto[e] && fieldValuesDto[e] != "") {
                    if (Array.isArray(fieldValuesDto[e])) {
                        fieldsData[e] = JSON.stringify(fieldValuesDto[e]);
                    } else {
                        fieldsData[e] = fieldValuesDto[e];
                    }
                }
            });

            let result = await this.fieldsValuesRepository.save(fieldsData);
            return new SuccessResponse({
                statusCode: 200,
                message: "Ok.",
                data: result,
            });

        } catch (e) {
            console.error(e);
            return new ErrorResponse({
                errorCode: "400",
                errorMessage: e,
            });
        }
    }

    async searchFieldValues(request: any, fieldValuesSearchDto: FieldValuesSearchDto) {
        try {

            let { limit, page, filters } = fieldValuesSearchDto;

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

            console.log(whereClause);

            const [results, totalCount] = await this.fieldsValuesRepository.findAndCount({
                where: whereClause,
                take: parseInt(limit),
                skip: offset,
            });

            const mappedResponse = await this.mappedResponse(results);

            return new SuccessResponse({
                statusCode: 200,
                message: 'Ok.',
                totalCount,
                data: mappedResponse,
            });

        } catch (e) {
            console.error(e);
            return new ErrorResponse({
                errorCode: "400",
                errorMessage: e,
            });
        }
    }

    async createFieldValuesBulk(field_values: any) {
        var axios = require("axios");

        var data_field_values = {
            query: `mutation insert_multiple_fieldValues($objects: [FieldValues_insert_input!]!) {
            insert_FieldValues(objects: $objects) {
              returning {
                fieldValuesId
              }
            }
          }
          `,
            variables: {
                objects: field_values,
            },
        };

        var config_field_value = {
            method: "post",
            url: process.env.REGISTRYHASURA,
            headers: {
                "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
                "Content-Type": "application/json",
            },
            data: data_field_values,
        };

        const response = await axios(config_field_value);
        return response;
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
}
