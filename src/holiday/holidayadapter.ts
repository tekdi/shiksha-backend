import { Injectable } from "@nestjs/common";
import { HasuraHolidayService } from "src/adapters/hasura/holiday.adapter";
import { IServicelocator } from "src/adapters/holidayservicelocator";

@Injectable()
export class HolidayAdapter {
  constructor(private hasuraProvider: HasuraHolidayService) {}
  buildHolidayAdapter(): IServicelocator {
    let adapter: IServicelocator;

    switch (process.env.ADAPTERSOURCE) {
      case "hasura":
        adapter = this.hasuraProvider;
        break;
    }
    return adapter;
  }
}
