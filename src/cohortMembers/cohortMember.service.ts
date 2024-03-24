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
import { CohortDto } from "../cohort/dto/cohort.dto";

@Injectable()
export class CohortMembersService {

    constructor(
        @InjectRepository(CohortMembers)
        private cohortMemberRepository: Repository<CohortMembers>,
    ) { }


    public async searchCohortMembers(
        tenantId: string,
        request: any,
        cohortMembersSearchDto: CohortMembersSearchDto,
        res: any,
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
            
            // const [results, totalCount] = await this.cohortMemberRepository.findAndCount({
            //     where: whereClause,
            //     skip: offset,
            //     // relations: ['cohorts'],
            // });
            // console.log(whereClause);
            let userId;
            if (whereClause['userId']) {
                userId = whereClause['userId'];

            }
            
            let query = `SELECT C."cohortId",C."attendanceCaptureImage", C."parentId", C."type", C."programId", C."name",CM."userId" FROM public."CohortMembers" CM 
            LEFT JOIN public."Cohort" C
            ON C."cohortId" = CM."cohortId" where CM."userId" =$1`;

            const results = await this.cohortMemberRepository.query(query, [userId]);
            res.status(200).json(results);

        } catch (e) {
            console.error(e);
            return new ErrorResponse({
                errorCode: "401",
                errorMessage: e,
            });
        }
    }
}
