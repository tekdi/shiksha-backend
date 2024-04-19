import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Expose, Type } from 'class-transformer';

class UserDataDTO {

    @IsString()
    username: string;

    @IsString()
    name: string;

    @IsString()
    role: string;

    @IsOptional()
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
    createdAt: string;

    @IsString()
    updatedAt: string;

    @IsString()
    createdBy: string;

    @IsString()
    updatedBy: string;

    @IsString()
    tenantId: string;

    @IsString()
    status: string;
}

class CustomFieldDTO {
    @IsString()
    fieldId: string;

    @IsString()
    value: string;
}

export class UserUpdateDTO {

    @IsString()
    userId: string;

    @Expose()
    @ValidateNested()
    @Type(() => UserDataDTO)
    userData: UserDataDTO;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CustomFieldDTO)
    customFields: CustomFieldDTO[];
}
