import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RbacAuthGuard extends AuthGuard('jwt-rbac') {}
