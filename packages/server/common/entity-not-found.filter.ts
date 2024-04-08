import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { EntityNotFoundError } from "typeorm";
import { Response } from "express";
import {
  NotFoundException,
  PossibleErrors,
} from "@server/common/exceptions/base-exceptions";
import { GraphQLError } from "graphql/error";

@Catch(EntityNotFoundError)
export class EntityNotFoundFilter implements ExceptionFilter {
  catch(exception: EntityNotFoundError, host: ArgumentsHost) {
    const contextType = host.getType();

    // TODO: WebSocket
    if (contextType === "http") {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();

      response.status(404).json({
        statusCode: 404,
        timestamp: new Date().toISOString(),
        cause: exception.name,
        message: "Entity not found",
      });
    } else {
      return new GraphQLError("Entity not found", {
        extensions: {
          code: PossibleErrors.NotFound,
        },
      });
    }
  }
}
