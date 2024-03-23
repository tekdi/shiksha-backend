import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { ErrorResponse } from "src/error-response";
const resolvePath = require("object-resolve-path");
import { CohortMembersDto } from "src/cohortMembers/dto/cohortMembers.dto";
import { CohortMembersSearchDto } from "src/cohortMembers/dto/cohortMembers-search.dto";
import { CohortMembers } from "./entities/cohort-member.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Not, Repository, getConnection, getRepository } from "typeorm";

@Injectable()
export class CohortMembersService {

    constructor(
        @InjectRepository(CohortMembers)
        private cohortMemberRepository: Repository<CohortMembers>,
    ) { }


    public async searchCohortMembers(
        tenantId: string,
        request: any,
        cohortMembersSearchDto: CohortMembersSearchDto
    ) {
        try {

            let { limit, page, filters } = cohortMembersSearchDto;

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
            
            const [results, totalCount] = await this.cohortMemberRepository.findAndCount({
                where: whereClause,
                skip: offset,
                // relations: ['cohorts'],
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
                errorCode: "401",
                errorMessage: e,
            });
        }
    }



    public async mappedResponse(result: any) {
        const cohortMembersResponse = result.map((obj: any) => {
            const cohortMembersMapping = {
                tenantId: obj?.tenantId ? `${obj.tenantId}` : "",
                cohortMembershipId: obj?.cohortMembershipId? `${obj.cohortMembershipId}`: "",
                cohortId: obj?.cohortId ? `${obj.cohortId}` : "",
                userId: obj?.userId ? `${obj.userId}` : "",
                role: obj?.role ? `${obj.role}` : "",
                createdAt: obj?.createdAt ? `${obj.createdAt}` : "",
                updatedAt: obj?.updatedAt ? `${obj.updatedAt}` : "",
                createdBy: obj?.createdBy ? `${obj.createdBy}` : "",
                updatedBy: obj?.updatedBy ? `${obj.updatedBy}` : "",
            };
            return new CohortMembersDto(cohortMembersMapping);
        });

        return cohortMembersResponse;
    }
}
