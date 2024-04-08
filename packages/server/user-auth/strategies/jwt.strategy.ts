import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";

export const JWT_STRATEGY = "jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([JwtStrategy.fromCookie]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("ACCESS_TOKENS_SECRET"),
    });
  }

  private static fromCookie(req: Request): string | null {
    if (req.cookies && req.cookies.token) {
      return req.cookies.token;
    }
    return null;
  }

  async validate(payload: JwtUser): Promise<RequestUser> {
    return {
      id: payload.sub,
    };
  }
}
