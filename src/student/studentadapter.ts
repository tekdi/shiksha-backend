import { Injectable } from "@nestjs/common";
import { IServicelocator } from "src/adapters/studentservicelocator";

@Injectable()
export class StudentAdapter {
  constructor() {}
  buildStudentAdapter(): IServicelocator {
    let adapter: IServicelocator;

    switch (process.env.ADAPTERSOURCE) {
    }
    return adapter;
  }
}
