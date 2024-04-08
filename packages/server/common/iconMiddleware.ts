import { MiddlewareContext, NextFn } from "@nestjs/graphql";

export async function IconMiddleware(_: MiddlewareContext, next: NextFn) {
  const value = await next();

  if (typeof value === "string" && value !== "") {
    let protocol = "https://";

    if (process.env.APP_ENV === "development") {
      protocol = "http://";
    }

    return `${protocol}${process.env.STATIC_HOST}/uploads/vector/${value}`;
  } else {
    return value;
  }
}
