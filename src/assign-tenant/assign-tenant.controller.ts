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
import { AssignTenantAdapter } from "./assign-tenant.apater";
import { CreateAssignTenantDto } from "./dto/assign-tenant-create.dto";
import { UpdateAssignTenantDto } from "./dto/assign-tenant-update.dto";
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
    @ApiBody({ type: CreateAssignTenantDto })
    public async createCohort(
        @Req() request: Request,
        @Body() createAssignTenantDto: CreateAssignTenantDto,
        @Res() response: Response
    ) {

        // createAssignTenant(request: any, createAssignTenantDto:CreateAssignTenantDto);
        // updateAssignTenant(request: any, updateAssignTenantDto:UpdateAssignTenantDto);

        const result = await this.assignTenantAdapter.buildassignTenantAdapter().createAssignTenant(
            request,
            createAssignTenantDto
        );
        return response.status(result.statusCode).json(result);
    }





    //update
    // @Put("/:cohortId")
    // @ApiConsumes("multipart/form-data")
    // @ApiBasicAuth("access-token")
    // @UseInterceptors(
    //     FileInterceptor("image", {
    //         storage: diskStorage({
    //             destination: process.env.IMAGEPATH,
    //             filename: editFileName,
    //         }),
    //         fileFilter: imageFileFilter,
    //     })
    // )
    // @ApiBody({ type: CohortUpdateDto })
    // @ApiOkResponse({ description: "Cohort has been updated successfully" })
    // @ApiBadRequestResponse({ description: "Bad request." })
    // @ApiInternalServerErrorResponse({ description: "Internal Server Error." })

    // public async updateCohort(
    //     @Param("cohortId") cohortId: string,
    //     @Req() request: Request,
    //     @Body() cohortUpdateDto: CohortUpdateDto,
    //     @UploadedFile() image,
    //     @Res() response: Response
    // ) {
    //     const result = await this.cohortAdapter.buildCohortAdapter().updateCohort(
    //         cohortId,
    //         request,
    //         cohortUpdateDto
    //     );
    //     return response.status(result.statusCode).json(result);
    // }
}
