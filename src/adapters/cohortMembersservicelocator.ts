import { CohortMembersSearchDto } from "src/cohortMembers/dto/cohortMembers-search.dto";
import { CohortMembersDto } from "src/cohortMembers/dto/cohortMembers.dto";

export interface IServicelocatorcohortMembers {
  createCohortMembers(request: any, cohortMembersDto: CohortMembersDto);
  getCohortMembers(tenantId, cohortMembershipId, request);
  searchCohortMembers(tenantid, request: any, cohortMembersSearchDto: CohortMembersSearchDto);
  updateCohortMembers(cohortMembershipId: string, request: any, cohortMembersDto: CohortMembersDto);
}
