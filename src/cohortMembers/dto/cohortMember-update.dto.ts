import { Exclude, Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

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
    default: "",
  })
  @Expose()
  @IsOptional() // Marking as optional
  cohortId?: string; // Making it optional by adding '?' after the type

  @ApiProperty({
    type: String,
    description: "The userId of the cohort members",
    default: "",
  })
  @Expose()
  @IsOptional()
  userId?: string;

  @ApiProperty({
    type: String,
    description: "The role of the cohort members",
    default: "",
  })
  @Expose()
  role: string;

  @ApiProperty({
    type: String,
    description: "The createdBy of the cohort members",
    default: "",
  })
  @Expose()
  @IsOptional()
  createdBy?: string;

  @ApiProperty({
    type: String,
    description: "The updatedBy of the cohort members",
    default: "",
  })
  @Expose()
  @IsOptional()
  updatedBy?: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
