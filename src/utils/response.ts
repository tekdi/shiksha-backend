import { v4 } from 'uuid';
import { ServerResponse, Params } from './response-interface';

export default class APIResponse {
  public static success<Type>(
    id: string,
    result: Type,
    statusCode: string,
  ): ServerResponse {
    try {
      const params: Params = {
        resmsgid: v4(),
        status: 'successful',
        err: null,
        errmsg: null,
      };

      const resObj: ServerResponse = {
        id,
        ver: '1.0',
        ts: new Date().toISOString(),
        params,
        responseCode: statusCode,
        result,
      };
      return resObj;
    } catch (e) {
      return e;
    }
  }

  public static error(
    id: string,
    errmsg: string,
    error: string,
    statusCode: string,
  ): ServerResponse {
    try {
      const params: Params = {
        resmsgid: v4(),
        status: 'failed',
        err: error,
        errmsg: errmsg,
      };

      const resObj: ServerResponse = {
        id,
        ver: '1.0',
        ts: new Date().toISOString(),
        params,
        responseCode: statusCode,
        result: { success: false },
      };
      return resObj;
    } catch (e) {
      return e;
    }
  }

//   public static handleBadRequests(
//     response: Response,
//     apiId: string,
//     errmsg: string,
//     error: string,
//   ) {
//     return response
//       .status(HttpStatus.BAD_REQUEST)
//       .json(APIResponse.error(apiId, errmsg, error, 'BAD_REQUEST'));
//   }
}
