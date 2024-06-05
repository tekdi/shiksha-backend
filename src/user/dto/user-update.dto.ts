import { IsString, IsOptional, IsArray, ValidateNested, IsObject } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class UserDataDTO {

    @IsString()
    username: string;

    @Expose()
    createdAt: string;

    @Expose()
    updatedAt: string;

    @Expose()
    createdBy: string;

    @Expose()
    updatedBy: string;

    @Expose()
    tenantId: string;

    @Expose()
    status: string;

    @ApiPropertyOptional({
        type: String,
        description: "Name",
    })
    @Expose()
    name: string;

    @ApiPropertyOptional({
        type: String,
        description: "Email",
    })
    @Expose()
    @IsString()
    email: string;

    @ApiPropertyOptional({
        type: String,
        description: "Is Email Masked",
    })
    @Expose()
    @IsString()
    isEmailMasked: string;


    @ApiPropertyOptional({
        type: String,
        description: "Mobile number",
    })
    @Expose()
    @IsString()
    mobile: string;

    @ApiPropertyOptional({
        type: String,
        description: "Is Mobile Masked",
    })
    @Expose()
    @IsString()
    isMobileMasked: string;


    @ApiPropertyOptional({
        type: String,
        description: "Date of birth",
    })
    @Expose()
    @IsString()
    dob: string;

    @ApiPropertyOptional({
        type: String,
        description: "Is Dob Masked",
    })
    @Expose()
    @IsString()
    isDobMasked: string;

    @ApiPropertyOptional({
        type: String,
        description: "District",
    })
    @Expose()
    district: string;

    @ApiPropertyOptional({
        type: String,
        description: "State",
    })
    @Expose()
    state: string;

    @ApiPropertyOptional({
        type: String,
        description: "Address",
    })
    @Expose()
    address: string;

    @ApiPropertyOptional({
        type: String,
        description: "Pincode",
    })
    @Expose()
    pincode: string;
}

class CustomFieldDTO {
    @ApiPropertyOptional({
        type: String,
        description: "fieldId",
    })
    @Expose()
    @IsString()
    fieldId: string;

    @ApiPropertyOptional({
        type: String,
        description: "Value",
    })
    @Expose()
    @IsString()
    value: string;
}

export class UserUpdateDTO {

    @IsString()
    userId: string;

    @ApiProperty({
        type: UserDataDTO,
        description: "User Details",
    })
    @IsObject()
    userData: UserDataDTO;


    @ApiProperty({
        type: [CustomFieldDTO],
        description: 'User Custom Fields',
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CustomFieldDTO)
    customFields: CustomFieldDTO[];

    constructor(partial: Partial<UserUpdateDTO>) {
        Object.assign(this, partial);
    }
}
