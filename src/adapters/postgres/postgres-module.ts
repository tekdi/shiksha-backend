import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { PostgresUserService } from "./user-adapter";
import { FieldsService } from "src/fields/fields.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/user/entities/user-entity";
import { CohortMembers } from "src/cohortMembers/entities/cohort-member.entity";
import { Field } from "src/user/entities/field-entity";
import { Fields } from "src/fields/entities/fields.entity";
import { FieldValues } from "src/user/entities/field-value-entities";
import { AttendanceEntity } from "src/attendance/entities/attendance.entity";
import { PostgresAttendanceService } from "./attendance-adapter";
import { PostgresFieldsService } from "./fields-adapter";
import { Cohort } from "src/cohort/entities/cohort.entity";
import { UserTenantMapping } from "src/userTenantMapping/entities/user-tenant-mapping.entity";
import { Tenants } from "src/userTenantMapping/entities/tenant.entity";
import { UserRoleMapping } from "src/rbac/assign-role/entities/assign-role.entity";
import { Role } from "src/rbac/role/entities/role.entity";


@Module({
    imports: [HttpModule,
        TypeOrmModule.forFeature([
            User,
            Field,
            FieldValues,
            CohortMembers,
            AttendanceEntity,
            Fields,
            Cohort,
            UserTenantMapping,
            Tenants,
            UserRoleMapping,
            Role
        ])
    ],
    providers: [
        PostgresUserService,
        PostgresAttendanceService,
        PostgresFieldsService,
    ],
    exports: [
        PostgresUserService,
        PostgresAttendanceService,
        PostgresFieldsService,
    ],
})
export class PostgresModule { }
