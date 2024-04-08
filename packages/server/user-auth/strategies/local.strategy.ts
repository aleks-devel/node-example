import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthResults, AuthService } from "../auth.service";
import { Request } from "express";

export const LOCAL_STRATEGY = "local";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, LOCAL_STRATEGY) {
  constructor(private authService: AuthService) {
    super({ usernameField: "email", passReqToCallback: true });
  }

  redirect(url: string, status?: number) {
    super.redirect(url, status);
  }

  async validate(
    req: Request,
    username: string,
    password: string,
  ): Promise<RequestUser> {
    const result = await this.authService.validateCredentials(username, password);

    if (result.status === AuthResults.WRONG_CREDENTIALS) {
      throw new UnauthorizedException({
        hits: req.throttleHits,
      });
    }

    return result.user!;
  }
}
