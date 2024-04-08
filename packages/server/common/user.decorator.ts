import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

export const User = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const type = context.getType();
  let user: RequestUser | undefined | null = undefined;

  if (type === "http") {
    const req = context.switchToHttp().getRequest();
    user = req.user;
  } else if (type === "ws") {
    throw new Error("User decorator used on ws");
  } else {
    const ctx = GqlExecutionContext.create(context);
    user = ctx.getContext().req.user;
  }

  if (user === undefined) {
    throw new Error("User decorator used without JwtStrategy");
  }

  return user;
});

export const Employee = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const type = context.getType();
    let user: RequestEmployee | undefined | null = undefined;

    if (type === "http") {
      const req = context.switchToHttp().getRequest();
      user = req.user;
    } else if (type === "ws") {
      throw new Error("Employee decorator used on ws");
    } else {
      const ctx = GqlExecutionContext.create(context);
      user = ctx.getContext().req.user;
    }

    if (user === undefined) {
      throw new Error("Employee decorator used without JwtAdminStrategy");
    }

    return user;
  },
);
