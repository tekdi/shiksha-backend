import { Exclude, Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { MemberStatus } from "../entities/cohort-member.entity";
export class CohortMembersUpdateDto {
  @Expose()
  tenantId: string;

  @Expose()
  cohortMembershipId: string;

  @Expose()
  @IsOptional()
  createdAt: string;

  @Expose()
  @IsOptional()
  updatedAt: string;

  @ApiProperty({
    type: String,
    description: "The cohortId of the cohort members",
  })
  @Expose()
  @IsOptional() // Marking as optional
  cohortId?: string; // Making it optional by adding '?' after the type

  @ApiProperty({
    type: String,
    description: "The userId of the cohort members",
  })
  @Expose()
  @IsOptional()
  userId?: string;

  @ApiProperty({
    enum: MemberStatus,
    description: "The status of the cohort members",
  })
  @IsEnum(MemberStatus)
  memberStatus: string;

  @ApiProperty({
    type: String,
    description: "The createdBy of the cohort members",
  })
  @Expose()
  @IsOptional()
  createdBy?: string;

  @ApiProperty({
    type: String,
    description: "The updatedBy of the cohort members",
  })
  @Expose()
  @IsOptional()
  updatedBy?: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
