import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Transform, Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumberString, IsOptional, IsString, IsUUID, Matches, ValidateNested } from 'class-validator';

enum Order {
    ASC = 'asc',
    DESC = 'desc',
}


class FiltersDto {
    @IsEnum(Order,{ message: "nameOrder must be a valid enum value asc or desc" })
    @IsOptional()
    nameOrder: Order;

    @IsEnum(Order,{ message: "nameOrder must be a valid enum value asc or desc" })
    @IsOptional()
    percentageOrder: Order;

    @IsString()
    @IsOptional()
    search: string;

    @IsString()
    @IsOptional()
    userId: string;


    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Please provide a valid date in the format yyyy-mm-dd' })
    // @Validate(IsFromDateBeforeToDateConstraint, ['toDate'])
    fromDate: Date;
  
    @IsOptional()
    @ApiProperty({
      type: Date,
      description: "To Date",
    })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Please provide a valid date in the format yyyy-mm-dd' })
   
    toDate: Date;
    
}

export class AttendanceStatsDto {
    @ApiProperty({
        type: String,
        description: "The name of the person",
    })
    @Expose()
    name: string;

    @ApiProperty({
        type: String,
        description: "The name of the person",
    })
    @IsNotEmpty()
    @IsUUID() 
    @Expose()
    contextId: string;

    @ApiProperty({
        type: String,
        description: "The attendance percentage of the person",
    })
    @Expose()
    attendance_percentage: string;

    @ApiProperty({
        type: String,
        description: "userId of student",
    })
    @Expose()
    userId: string;

    @ApiProperty({
        description: "attendance date",
    })
    @Expose()
    attendanceDate: Date;

    @ApiProperty({
        description: "attendance",
    })
    @Expose()
    attendance: string;

    // @ApiProperty({
    //     type: String,
    //     description: "flag",
    // })
    // @Expose()
    // report: boolean; 

    @ApiProperty({
        type: Number,
        description: "limit",
    })
    @IsNotEmpty()
    @Expose()
    limit: number;

    @ApiProperty({
        type: Number,
        description: "offset",
    })
    @Expose()
    offset: number;

    @ApiProperty({
        type: Object,
        description: "Filters",
      })
      @ApiPropertyOptional()
      @ValidateNested({ each: true })
     @Type(() => FiltersDto)

      filters: FiltersDto

    constructor(obj: Partial<AttendanceStatsDto>) {
        Object.assign(this, obj);
    }
}


