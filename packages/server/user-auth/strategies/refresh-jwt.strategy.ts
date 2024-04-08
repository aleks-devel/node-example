import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import * as bcrypt from "bcryptjs";
import { testHash } from "@server/user-auth/auth.service";
import { ForbiddenException } from "@server/common/exceptions/base-exceptions";
import { User } from "@server/user/entities/user.entity";
import {
  ExtendedRepositoryService,
  InjectExtendedCustomRepo,
} from "@server/db/extended-repository.service";

export const REFRESH_JWT_STRATEGY = "refresh-jwt";

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  REFRESH_JWT_STRATEGY,
) {
  constructor(
    configService: ConfigService,
    @InjectExtendedCustomRepo(User)
    private userRepo: ExtendedRepositoryService<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        RefreshJwtStrategy.fromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("REFRESH_TOKENS_SECRET"),
      passReqToCallback: true,
    });
  }

  private static fromCookie(req: Request): string | null {
    if (req.cookies && req.cookies.token2) {
      return req.cookies.token2;
    }
    return null;
  }

  async validate(req: Request, payload: JwtUser): Promise<RequestUser> {
    const user = await this.userRepo.findOne({
      where: { id: payload.sub },
    });

    if (!user || !user.refreshToken) {
      await bcrypt.compare(req.cookies.token2, testHash);
      throw new ForbiddenException();
    } else if (!(await bcrypt.compare(req.cookies.token2, user.refreshToken))) {
      throw new ForbiddenException();
    }

    return {
      id: user.id,
    };
  }
}
