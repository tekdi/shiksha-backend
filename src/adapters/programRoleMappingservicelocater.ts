import { ProgramsRoleMappingDto } from "src/rbac/programs-role-mapping/dto/programs-role-mapping.dto";

export interface IServicelocator {
    createProgramsRoleMapping(request: any, programsRoleMappigDto: ProgramsRoleMappingDto);

    getProgramRoleMapping(Id, request);

    getAllProgramRoleMapping(request);

    deleteProgramRoleMapping(Id, request);

    updateProgramsRoleMapping(Id, request, programsRoleMappingDto:ProgramsRoleMappingDto)


}