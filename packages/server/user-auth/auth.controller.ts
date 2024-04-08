import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { Throttle } from "@nestjs/throttler";
import { EmailThrottleGuard } from "@server/user-auth/guards/email-throttle.guard";
import { AuthGuard } from "@nestjs/passport";
import { add } from "date-fns";
import { LOCAL_STRATEGY } from "@server/user-auth/strategies/local.strategy";
import { User } from "@server/common/user.decorator";
import { JwtAuthGuard } from "@server/user-auth/guards/jwt-auth.guard";
import { RefreshJwtGuard } from "@server/user-auth/guards/refresh-jwt.guard";
import { CaptchaGuard } from "@server/user-auth/guards/captcha.guard";
import { ResetPasswordDto } from "@server/user-auth/dto/reset-password.dto";

@Controller("/auth")
export class AuthController {
  constructor(protected authService: AuthService) {}

  private async setTokens(req: Request, res: Response) {
    const tokens = await this.authService.updateTokens(req.user as RequestUser);

    res.cookie("token", tokens.accessToken, {
      expires: add(new Date(), { hours: 2 }),
      httpOnly: true,
      secure: true,
    });
    res.cookie("token2", tokens.refreshToken, {
      expires: add(new Date(), { days: 28 }),
      path: "/api/auth/refresh",
      httpOnly: true,
      secure: true,
    });
  }

  @Post("/login")
  @HttpCode(200)
  @Throttle(3, 60 * 60)
  @UseGuards(EmailThrottleGuard, CaptchaGuard, AuthGuard(LOCAL_STRATEGY))
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.setTokens(req, res);
  }

  @Get("/refresh")
  @HttpCode(200)
  @UseGuards(RefreshJwtGuard)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.setTokens(req, res);
  }

  @Post("/logout")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async logout(
    @Res({ passthrough: true }) res: Response,
    @User() user: RequestUser,
  ) {
    await this.authService.invalidateTokens(user);

    res.cookie("token", "", { expires: new Date() });
    res.cookie("token2", "", {
      expires: new Date(),
      path: "/api/auth/refresh",
    });
  }

  @Post("/reset-password/request")
  @HttpCode(200)
  @UseGuards(CaptchaGuard)
  async requestResetPassword(@Body() data: ResetPasswordDto) {
    return this.authService.requestResetPassword(data.email);
  }
}
