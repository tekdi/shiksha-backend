import { Injectable } from "@nestjs/common";
require("dotenv").config();

@Injectable()
export class AppService {
  getHello(): object {
    return { msg: "Welcome to Shiksha Backend" };
  }
}
