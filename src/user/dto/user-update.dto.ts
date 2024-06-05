<<<<<<< HEAD
import { IsString, IsOptional, IsArray, ValidateNested, IsObject } from 'class-validator';
=======
import { IsString, IsOptional, IsArray, ValidateNested, IsNotEmpty, IsEnum, ValidateIf } from 'class-validator';
>>>>>>> c3520d03b63bb562cded913894ef50dd27a107a1
import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class UserDataDTO {

    @IsString()
    @IsOptional()
    username: string;

<<<<<<< HEAD
    @Expose()
    createdAt: string;

    @Expose()
    updatedAt: string;

    @Expose()
    createdBy: string;
=======
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    role: string;

    @IsOptional()
    @IsString()
    dob: string | null;
>>>>>>> c3520d03b63bb562cded913894ef50dd27a107a1

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
<<<<<<< HEAD
    isEmailMasked: string;

=======
    @IsOptional()
    createdAt: string;

    @IsString()
    @IsOptional()
    updatedAt: string;
>>>>>>> c3520d03b63bb562cded913894ef50dd27a107a1

    @ApiPropertyOptional({
        type: String,
        description: "Mobile number",
    })
    @Expose()
    @IsString()
<<<<<<< HEAD
    mobile: string;
=======
    @IsOptional()
    createdBy: string;
>>>>>>> c3520d03b63bb562cded913894ef50dd27a107a1

    @ApiPropertyOptional({
        type: String,
        description: "Is Mobile Masked",
    })
    @Expose()
    @IsString()
<<<<<<< HEAD
    isMobileMasked: string;
=======
    @IsOptional()
    updatedBy: string;
>>>>>>> c3520d03b63bb562cded913894ef50dd27a107a1


    @ApiPropertyOptional({
        type: String,
        description: "Date of birth",
    })
    @Expose()
    @IsString()
<<<<<<< HEAD
    dob: string;
=======
    @IsOptional()
    tenantId: string;
>>>>>>> c3520d03b63bb562cded913894ef50dd27a107a1

    @ApiPropertyOptional({
        type: String,
        description: "Is Dob Masked",
    })
    @Expose()
    @IsString()
<<<<<<< HEAD
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
=======
    @IsOptional()
    status: string;
>>>>>>> c3520d03b63bb562cded913894ef50dd27a107a1
}
class CustomFieldDTO {
<<<<<<< HEAD
    @ApiPropertyOptional({
        type: String,
        description: "fieldId",
    })
    @Expose()
=======

>>>>>>> c3520d03b63bb562cded913894ef50dd27a107a1
    @IsString()
    @Expose()
    @IsNotEmpty()
    fieldId: string;

<<<<<<< HEAD
    @ApiPropertyOptional({
        type: String,
        description: "Value",
    })
    @Expose()
    @IsString()
    value: string;
=======
    @ValidateIf(o => o.value !== '')
    @IsNotEmpty()
    @Expose()
    value: string | string[];
>>>>>>> c3520d03b63bb562cded913894ef50dd27a107a1
}

export class UserUpdateDTO {

    userId: string;

<<<<<<< HEAD
    @ApiProperty({
        type: UserDataDTO,
        description: "User Details",
    })
    @IsObject()
=======
    @Expose()
    @ValidateNested()
    @IsNotEmpty()
    @Type(() => UserDataDTO)
>>>>>>> c3520d03b63bb562cded913894ef50dd27a107a1
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
