import { UserService } from "@server/user/user.service";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { NewUserInput } from "@server/user/models/new-user.input";
import { UserModel } from "@server/user/models/user.model";
import { StatusMatrixService } from "@server/main-site/status-matrix/status-matrix.service";
import {
  Filter,
  TypeOrmFilter,
} from "@server/common/utils/typeorm-filter.utils";
import { UpdateUserInput } from "@server/user/models/update-user.input";
import { ChangePasswordInput } from "@server/user/models/change-password.input";
import { BadRequestException, UseGuards } from "@nestjs/common";
import { WeekJwtAuthGuard } from "@server/user-auth/guards/week-jwt-auth.guard";
import { User } from "@server/common/user.decorator";

@Resolver()
export class UserResolver {
  constructor(
    private service: UserService,
    private statusService: StatusMatrixService,
  ) {}

  @Mutation(() => String)
  // @UseGuards(CaptchaGuard)
  async createUser(@Args("data") data: NewUserInput, @Args("token") _: string) {
    await this.service.createUser(data);
    return "";
  }

  @Mutation(() => UserModel)
  async updateUser(
    @TypeOrmFilter() filter: Filter<UserModel>,
    @Args("data") data: UpdateUserInput,
  ) {
    return this.userData(filter);
  }

  @Mutation(() => Boolean)
  async updatePassword(@Args("data") data: ChangePasswordInput) {
    const password = "1234";

    if (password !== data.oldPassword) {
      throw new BadRequestException("password");
    }

    return true;
  }

  // TODO:
  @Query(() => UserModel, { nullable: true })
  @UseGuards(WeekJwtAuthGuard)
  async userData(
    @TypeOrmFilter() filter: Filter<UserModel>,
    @User() user?: RequestUser,
  ): Promise<UserModel | null> {
    if (!user) {
      return null;
    }

    return {
      id: "1",
      email: "test@NDA.com",
      fullName: "Test user",
      avatar: undefined,
      balance: 800.59,
      status: (
        await this.statusService.getStatusMatrices({
          select: filter.select.status ?? {},
          relations: filter.relations.status ?? {},
        })
      )[0] as any,
      referralCode: "test",
      referralUrl: `https://develop.NDA.com/test`,
      referralsData: {
        invited: 998,
        earned: 9999998,
      },
      totalOrdersSum: 100,
    };
  }

  /*
   * Добавить в StatusModel соцсети с товарами к которым она относится и какие там значения
   *
   * POST /user/balance/replenish принимает { balance: number }
   */
}
