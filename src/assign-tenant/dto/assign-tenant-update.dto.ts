import { Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID, IsArray } from "class-validator";

export class UpdateAssignTenantDto {
    @ApiProperty({
        type: String,
        description: "User Id of User",
        default: "",
    })
    @Expose()
    @IsNotEmpty()
    @IsUUID()
    userId: string;


    @ApiProperty({
        type: String,
        description: "Tenant Id",
        default: [],
    })
    @Expose()
    @IsArray()
    @IsUUID(undefined, { each: true })
    @IsNotEmpty({ each: true })
    tenantId: string;

    constructor(obj: any) {
        Object.assign(this, obj);
    }

}

// export class ResponseAssignRoleDto {
//   @Expose()
//   userId: string;

//   @Expose()
//   roleId: string;

//   @Expose()
//   tenantId: string;

//   @Expose()
//   message: string;

//   constructor(data: { userId: string; roleId: string; tenantId: string }, message: string) {
//     this.userId = data.userId;
//     this.roleId = data.roleId; 
//     this.tenantId = data.tenantId;
//     this.message = message;
//   }
// }

