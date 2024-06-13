import { IsString, IsOptional, IsArray, ValidateNested, IsNotEmpty, IsObject, IsEnum, ValidateIf } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class UserDataDTO {

    @IsString()
    @IsOptional()
    username: string;

    @IsString()
    @IsOptional()
    role: string;

    @ApiPropertyOptional({
        type: String,
        description: "Name",
    })
    @Expose()
    @IsString()
    @IsNotEmpty()
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

    @IsString()
    @IsOptional()
    createdAt: string;

    @IsString()
    @IsOptional()
    updatedAt: string;

    @ApiPropertyOptional({
        type: String,
        description: "Mobile number",
    })
    @Expose()
    @IsString()
    mobile: string;

    @IsOptional()
    createdBy: string;

    @ApiPropertyOptional({
        type: String,
        description: "Is Mobile Masked",
    })
    @Expose()
    @IsString()
    isMobileMasked: string;

    @IsOptional()
    updatedBy: string;


    @ApiPropertyOptional({
        type: String,
        description: "Date of birth",
    })
    @Expose()
    @IsString()
    dob: string | null;;

    @IsOptional()
    tenantId: string;

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
    @Expose()
    @IsNotEmpty()
    fieldId: string;

    @ApiPropertyOptional({
        type: String,
        description: "Value",
    })
    @ValidateIf(o => o.value !== '')
    @IsNotEmpty()
    @Expose()
    value: string | string[];
}

export class UserUpdateDTO {

    userId: string;

    @ApiProperty({
        type: UserDataDTO,
        description: "User Details",
    })
    @IsObject()
    @Expose()
    @ValidateNested()
    @IsNotEmpty()
    @Type(() => UserDataDTO)
    userData: UserDataDTO;


    @ApiProperty({
        type: [CustomFieldDTO],
        description: 'User Custom Fields',
    })
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CustomFieldDTO)
    @Expose()
    customFields: CustomFieldDTO[];

    constructor(partial: Partial<UserUpdateDTO>) {
        Object.assign(this, partial);
    }
}
