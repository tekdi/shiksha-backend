import {
    ApiTags,
    ApiBody,
    ApiCreatedResponse,
    ApiBasicAuth,
    ApiConsumes,
    ApiHeader,
    ApiBadRequestResponse,
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiConflictResponse,
} from "@nestjs/swagger";
import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    UseInterceptors,
    Req,
    UploadedFile,
    Res,
    Headers,
    UseGuards,
    ValidationPipe,
    UsePipes,
} from "@nestjs/common";
import { Request } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import { Response, response } from "express";
import { AssignTenantAdapter } from "./user-tenant-mapping.adapter";
import { UserTenantMappingDto } from "./dto/user-tenant-mapping.dto";
import { JwtAuthGuard } from "src/common/guards/keycloak.guard";

@ApiTags("AssignTenant")
@Controller("assign-tenant")
@UseGuards(JwtAuthGuard)
export class AssignTenantController {
    constructor(private readonly assignTenantAdapter: AssignTenantAdapter) { }

    //create cohort
    @Post()
    @ApiBasicAuth("access-token")
    @ApiCreatedResponse({ description: "Tenant assigned successfully to the user." })
    @ApiBadRequestResponse({ description: "Bad request." })
    @ApiInternalServerErrorResponse({ description: "Internal Server Error." })
    @ApiConflictResponse({ description: "Tenant is already assigned to this user." })
    @UsePipes(new ValidationPipe())
    @ApiBody({ type: UserTenantMappingDto })
    public async createCohort(
        @Headers() headers,
        @Req() request: Request,
        @Body() userTenantMappingDto: UserTenantMappingDto,
        @Res() response: Response
    ) {
        const result = await this.assignTenantAdapter.buildAssignTenantAdapter().userTenantMapping(
            request,
            userTenantMappingDto
        );
        return response.status(result.statusCode).json(result);
    }

}
