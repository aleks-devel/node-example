import { ArgumentsHost, Catch } from "@nestjs/common";
import { EntityNotFoundError, QueryFailedError } from "typeorm";
import { Response } from "express";
import { GraphQLError } from "graphql/error";

@Catch(QueryFailedError)
export class QueryFailedFilter {
  catch(exception: EntityNotFoundError, host: ArgumentsHost) {
    const contextType = host.getType();

    console.error(JSON.stringify(exception, undefined, 2));

    // TODO: WebSocket
    if (contextType === "http") {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();

      response.status(500).json({
        statusCode: 500,
        timestamp: new Date().toISOString(),
        cause: "unknown",
        message: "unknown",
      });
    } else {
      return new GraphQLError("unknown", {
        extensions: {
          code: "unknown",
        },
      });
    }
  }
}
