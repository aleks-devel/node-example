import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import {
  BaseException,
  PossibleErrors,
} from "@server/common/exceptions/base-exceptions";
import { Response } from "express";
import { GraphQLError } from "graphql/error";

@Catch(BaseException)
export class MainExceptionFilter implements ExceptionFilter {
  catch(exception: BaseException, host: ArgumentsHost): any {
    const type = host.getType();

    // TODO: websocket
    if (type === "http") {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();

      let code: number = exception.errorCode;

      if (code === PossibleErrors.ExternalApiError) {
        code = 400;
      }

      response.status(code).json({
        statusCode: exception.errorCode,
        timestamp: new Date().toISOString(),
        cause: exception.cause,
        message: exception.errorMessage,
        additionalData: exception.additionalData,
      });
    } else {
      return new GraphQLError(exception.message, {
        extensions: {
          code: exception.errorCode,
          cause: exception.cause,
          message: exception.message,
          additionalData: exception.additionalData,
        },
      });
    }
  }
}
