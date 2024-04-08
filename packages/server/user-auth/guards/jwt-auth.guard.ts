import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { JWT_STRATEGY } from "@server/user-auth/strategies/jwt.strategy";
import { GqlExecutionContext } from "@nestjs/graphql";
import { ForbiddenException } from "@server/common/exceptions/base-exceptions";

@Injectable()
export class JwtAuthGuard extends AuthGuard(JWT_STRATEGY) {
  getRequest(context: ExecutionContext) {
    const type = context.getType();

    if (type === "http") {
      return context.switchToHttp().getRequest();
    } else if(type === "ws") {
      throw new Error("JwtAuthGuard used on websocket");
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
