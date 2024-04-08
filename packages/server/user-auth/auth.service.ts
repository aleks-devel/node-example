import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import {
  ExtendedRepositoryService,
  InjectExtendedCustomRepo,
} from "@server/db/extended-repository.service";
import { User } from "@server/user/entities/user.entity";
import { ConfigService } from "@nestjs/config";

export enum AuthResults {
  SUCCESS,
  WRONG_CREDENTIALS,
}

export const testHash =
  "$2a$10$PK8Etpq3hUQwpSnJNRY8WO/NFlJBM5EmVGN0VHCp4eFOxvnAE8g0e";

@Injectable()
export class AuthService {
  constructor(
    @InjectExtendedCustomRepo(User)
    private userRepo: ExtendedRepositoryService<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<{ status: AuthResults; user?: RequestUser }> {
    const user = await this.userRepo.findOneBy({ email });

    if (user !== null) {
      if (!(await bcrypt.compare(password, user.password))) {
        return { status: AuthResults.WRONG_CREDENTIALS };
      }

      return {
        status: AuthResults.SUCCESS,
        user: {
          id: user.id,
        },
      };
    } else {
      await bcrypt.compare(password, testHash);
      return { status: AuthResults.WRONG_CREDENTIALS };
    }
  }

  async updateTokens(user: RequestUser) {
    const tokens = await Promise.all([
      this.jwtService.signAsync(
        { sub: user.id },
        {
          secret: this.configService.getOrThrow("ACCESS_TOKENS_SECRET"),
          expiresIn: "20m",
        },
      ),
      this.jwtService.signAsync(
        { sub: user.id },
        {
          secret: this.configService.getOrThrow("REFRESH_TOKENS_SECRET"),
          expiresIn: "28d",
        },
      ),
    ]);

    await this.userRepo.update(
      { id: user.id },
      {
        refreshToken: await bcrypt.hash(tokens[1], 10),
      },
    );

    return {
      accessToken: tokens[0],
      refreshToken: tokens[1],
    };
  }

  async invalidateTokens(user: RequestUser) {
    await this.userRepo.update(
      { id: user.id },
      {
        refreshToken: null,
      },
    );
  }

  async requestResetPassword(email: string) {
    const emailExists = await this.userRepo.countBy({ email });

    if (emailExists === 0) {
      return;
    }

    // nda
  }
}
