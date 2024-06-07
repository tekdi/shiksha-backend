import { IsString, IsOptional, IsArray, ValidateNested, IsNotEmpty, IsEnum, ValidateIf } from 'class-validator';
import { Expose, Type } from 'class-transformer';

class UserDataDTO {

    @IsString()
    @IsOptional()
    username: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    role: string;

    @IsOptional()
    @IsString()
    dob: string | null;

    @IsOptional()
    @IsString()
    email: string | null;

    @IsOptional()
    @IsString()
    district: string | null;

    @IsOptional()
    @IsString()
    state: string | null;

    @IsOptional()
    @IsString()
    address: string | null;

    @IsOptional()
    @IsString()
    pincode: string | null;

    @IsString()
    @IsOptional()
    createdAt: string;

    @IsString()
    @IsOptional()
    updatedAt: string;

    @IsString()
    @IsOptional()
    createdBy: string;

    @IsString()
    @IsOptional()
    updatedBy: string;

    @IsString()
    @IsOptional()
    tenantId: string;

    @IsString()
    @IsOptional()
    status: string;
}
class CustomFieldDTO {

    @IsString()
    @Expose()
    @IsNotEmpty()
    fieldId: string;

    @ValidateIf(o => o.value !== '')
    @IsNotEmpty()
    @Expose()
    value: string | string[];
}

export class UserUpdateDTO {

    userId: string;

    @Expose()
    @ValidateNested()
    @IsNotEmpty()
    @Type(() => UserDataDTO)
    userData: UserDataDTO;

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CustomFieldDTO)
    @Expose()
    customFields: CustomFieldDTO[];
}
