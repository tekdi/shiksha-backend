import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";


@Injectable()
export class HasuraPrivilegeService {
  constructor(private httpService: HttpService) {}
 
}
