import { Injectable } from "@nestjs/common";
import {
  ExtendedRepositoryService,
  InjectExtendedCustomRepo,
} from "@server/db/extended-repository.service";
import { User } from "@server/user/entities/user.entity";
import { ConflictException } from "@server/common/exceptions/base-exceptions";
import * as bcrypt from "bcryptjs";
import md5 from "md5";
import { NewUserInput } from "@server/user/models/new-user.input";
import { v4 as uuidV4 } from "uuid";

@Injectable()
export class UserService {
  constructor(
    @InjectExtendedCustomRepo(User)
    private userRepo: ExtendedRepositoryService<User>,
  ) {}

  async createUser(data: NewUserInput) {
    const checkEmail = await this.userRepo.countBy({ email: data.email });

    if (checkEmail > 0) {
      throw new ConflictException("email");
    }

    const password = await bcrypt.hash(data.password, 10);

    // TODO: add field subscription

    await this.userRepo.insert({
      email: data.email,
      password,
      balance: 0,
      referralCode: uuidV4(),
    });
  }
}
