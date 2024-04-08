import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { Request } from "express";
import { BadRequestException } from "@server/common/exceptions/base-exceptions";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { GqlExecutionContext } from "@nestjs/graphql";

@Injectable()
export class CaptchaGuard implements CanActivate {
  constructor(private httpService: HttpService) {}

  async canActivate(context: ExecutionContext) {
    const type = context.getType();
    let token: any;

    if (type === "http") {
      const request: Request = context.switchToHttp().getRequest();
      token = request.body.token;
    } else {
      const ctx = GqlExecutionContext.create(context);
      token = ctx.getArgs().token;
    }

    if (typeof token !== "string") {
      throw new BadRequestException("token");
    }

    const captchaResponse = await firstValueFrom(
      this.httpService.post(
        "https://www.google.com/recaptcha/api/siteverify",
        undefined,
        {
          params: {
            secret: process.env.CAPTCHA_SECRET,
            response: token,
          },
        },
      ),
    );

    if (captchaResponse.data.success) {
      return true;
    } else if (
      captchaResponse.data["error-codes"]?.includes("invalid-input-secret")
    ) {
      throw new BadRequestException("captcha secret");
    } else if (
      captchaResponse.data["error-codes"]?.includes("invalid-input-response")
    ) {
      throw new BadRequestException("captcha token");
    } else {
      throw new BadRequestException("captcha");
    }
  }
}
