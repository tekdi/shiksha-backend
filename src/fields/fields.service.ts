import { Injectable } from "@nestjs/common";
import { FieldsDto } from "src/fields/dto/fields.dto";
import { FieldsSearchDto } from "src/fields/dto/fields-search.dto";
import { FieldValuesDto } from "src/fields/dto/field-values.dto";
import { FieldValuesSearchDto } from "src/fields/dto/field-values-search.dto";
import jwt_decode from "jwt-decode";
import { ErrorResponse } from "src/error-response";
import { Fields } from "./entities/fields.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Not, Repository, getConnection, getRepository } from "typeorm";
import { SuccessResponse } from "src/success-response";

@Injectable()
export class FieldsService {
    constructor(
        @InjectRepository(Fields)
        // @InjectRepository(FieldValues)
        private fieldsRepository: Repository<Fields>,
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
}
