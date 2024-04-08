import { PrivilegeDto } from './dto/privilege.dto';
import { UpdatePrivilegeDto } from './dto/update-privilege.dto';
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  SerializeOptions,
  Req,
  UsePipes,
  ValidationPipe,
  Res,
  Headers,
  Delete,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBody,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiCreatedResponse,
  ApiBasicAuth,
  ApiHeader,
} from "@nestjs/swagger";
import { Request } from "@nestjs/common";
import { Response, response } from "express";
import { JwtAuthGuard } from "src/common/guards/keycloak.guard";
import { PrivilegeAdapter } from './privilegeadapter';

@Controller('privilege')
export class PrivilegeController {
  constructor(private readonly privilegeAdapter: PrivilegeAdapter) {}


}
