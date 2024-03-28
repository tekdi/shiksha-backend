import { Expose } from "class-transformer";

export class ErrorResponseTypeOrm {
  @Expose()
  statusCode: number;

  @Expose()
  errorMessage: string;

  constructor(partial: Partial<ErrorResponseTypeOrm>) {
    Object.assign(this, partial);
  }
}
