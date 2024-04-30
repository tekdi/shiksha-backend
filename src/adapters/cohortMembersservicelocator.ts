import { CohortMembersSearchDto } from "src/cohortMembers/dto/cohortMembers-search.dto";
import { CohortMembersDto } from "src/cohortMembers/dto/cohortMembers.dto";
import { CohortMembersUpdateDto } from "src/cohortMembers/dto/cohortMember-update.dto";

export interface IServicelocatorcohortMembers {
  createCohortMembers(
    loginUser: any,
    cohortMembersDto: CohortMembersDto,
    response: any
  );
  getCohortMembers(cohortMembershipId,response: any);
  searchCohortMembers(cohortMembersSearchDto: CohortMembersSearchDto);
  updateCohortMembers(
    cohortMembershipId: string,
    loginUser: any,
    cohortMemberUpdateDto: CohortMembersUpdateDto,

    response: any
  );
  deleteCohortMemberById(tenantid, cohortMembershipId, response, request);
}
