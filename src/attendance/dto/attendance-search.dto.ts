import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Matches, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { isBefore, isSameDay } from "date-fns";


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

  @ApiProperty({
    type: Object,
    description: "Filters",
  })
  @ApiPropertyOptional()
  @Validate(ValidDateRangeConstraint, { message: "Invalid date range." })
  filters: {
    fromDate?: string;
    toDate?: string;
    [key: string]: any; // Allows additional dynamic keys
  };



  constructor(partial: Partial<AttendanceSearchDto>) {
    Object.assign(this, partial);
  }
}
