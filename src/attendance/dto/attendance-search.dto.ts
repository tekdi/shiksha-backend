  import { ApiAcceptedResponse, ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
  import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Matches, Validate, ValidateIf, ValidateNested, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface, isNotEmpty } from "class-validator";
  import { isBefore, isSameDay } from "date-fns";
  import { UserDto } from "src/user/dto/user.dto";
  import { AttendanceDto } from "./attendance.dto";
  import { CohortMembersDto } from "src/cohortMembers/dto/cohortMembers.dto";
  import { Type } from "class-transformer";

  export class AttendanceFiltersDto  {
    @ApiPropertyOptional({default:"yyyy-mm-dd"})
    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Please provide a valid date in the format yyyy-mm-dd' })
    fromDate?: Date;

    @ApiPropertyOptional({default:"yyyy-mm-dd"})
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Please provide a valid date in the format yyyy-mm-dd' })
    @IsOptional()
    toDate?: Date;

    @ApiPropertyOptional()
    @IsUUID()
    @IsOptional()
    contextId ?:string

    @ApiPropertyOptional()
    scope ?: string

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
      type: Number,
      description: "Limit",
    })
    @ValidateIf(o => !o.facets)
    @IsNotEmpty() 
    @IsNumber({}, { message: 'Limit must be a number' }) 
    limit: number;

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


    @ApiPropertyOptional({
      description: "Facets",
      example: [ "contextId","userId","scope"]
    })
    facets?: string[];



    constructor(partial: Partial<AttendanceSearchDto>) {
      Object.assign(this, partial);
  }
  }
