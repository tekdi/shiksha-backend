import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsUUID, Matches, Validate, ValidateNested, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { isBefore, isSameDay } from "date-fns";
import { UserDto } from "src/user/dto/user.dto";
import { AttendanceDto } from "./attendance.dto";
import { CohortMembersDto } from "src/cohortMembers/dto/cohortMembers.dto";
import { UUID } from "crypto";
import { Type } from "class-transformer";


export class AttendanceFiltersDto  {
  @ApiPropertyOptional()
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Please provide a valid date in the format yyyy-mm-dd' })
  fromDate?: string;

  @ApiPropertyOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Please provide a valid date in the format yyyy-mm-dd' })
  @IsOptional()
  toDate?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  cohortId ?:string

  @ApiPropertyOptional()
  role ?: string

  @ApiPropertyOptional({
    type: String,
    description: "The date of the attendance in format yyyy-mm-dd",
    default:"yyyy-mm-dd"
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Please provide a valid date in the format yyyy-mm-dd' })
  attendanceDate ?:Date


  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  userId?: string

  // @ApiPropertyOptional()


  [key: string]: any; // Allows additional dynamic keys
}

@ValidatorConstraint({ name: "validDateRange", async: false })
export class ValidDateRangeConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const { toDate, fromDate } = value;

    // If either fromDate or toDate is not provided, validation passes
    if (!fromDate || !toDate) {
      return true;
    }

    return isBefore(new Date(fromDate), new Date(toDate)) || isSameDay(new Date(fromDate), new Date(toDate));
  }

  defaultMessage(args: ValidationArguments) {
    return "Invalid date range. 'toDate' must be after or equal to 'fromDate'.";
  }
}



export class AttendanceSearchDto {
  @ApiProperty({
    type: String,
    description: "Limit",
  })
  limit: string;

  @ApiProperty({
    type: Number,
    description: "number",
  })
  page: number;

  @ApiPropertyOptional({
    type: AttendanceFiltersDto,
    description: "Filters",
  })
  @ValidateNested({ each: true })
  @Type(() => AttendanceFiltersDto)
  // @Validate(ValidDateRangeConstraint, { message: "Invalid date range." })
  filters: AttendanceFiltersDto



  constructor(partial: Partial<AttendanceSearchDto>) {
    Object.assign(this, partial);
  }
}
