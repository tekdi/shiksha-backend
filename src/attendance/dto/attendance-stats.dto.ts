import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import { IsNotEmpty, IsNumberString, IsString, IsUUID } from 'class-validator';

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

    @ApiProperty({
        type: String,
        description: "flag",
    })
    @Expose()
    report: boolean; 

    @ApiProperty({
        type: String,
        description: "The name of the person",
    })
    @IsNotEmpty()
    @Expose()
    limit: number;

    @ApiProperty({
        type: String,
        description: "The name of the person",
    })
    @Expose()
    @IsNotEmpty()
    offset: number;

    constructor(obj: Partial<AttendanceStatsDto>) {
        Object.assign(this, obj);
    }
}
