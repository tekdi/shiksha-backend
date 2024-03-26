import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
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

    constructor(obj: Partial<AttendanceStatsDto>) {
        Object.assign(this, obj);
  }
}
