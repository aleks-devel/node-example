import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { GqlExecutionContext } from "@nestjs/graphql";
import { ForbiddenException } from "@server/common/exceptions/base-exceptions";
import { REFRESH_JWT_STRATEGY } from "@server/user-auth/strategies/refresh-jwt.strategy";

@Injectable()
export class RefreshJwtGuard extends AuthGuard(REFRESH_JWT_STRATEGY) {
  getRequest(context: ExecutionContext) {
    const type = context.getType();

    if (type === "http") {
      return context.switchToHttp().getRequest();
    } else if(type === "ws") {
      throw new Error("RefreshJwtGuard used on websocket");
    } else {
      const ctx = GqlExecutionContext.create(context);
      return ctx.getContext().req;
    }
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new ForbiddenException();
    }
    return user;
  }
}
