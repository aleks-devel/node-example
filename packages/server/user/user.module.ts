import { Module } from "@nestjs/common";
import { UserResolver } from "@server/user/user.resolver";
import { UserService } from "@server/user/user.service";
import { CustomRepositoryModule } from "@server/db/custom-repository.module";
import { ExtendedRepositoryService } from "@server/db/extended-repository.service";
import { User } from "@server/user/entities/user.entity";
import { HttpModule } from "@nestjs/axios";
import { StatusMatrixModule } from "@server/main-site/status-matrix/status-matrix.module";
import { OperationsModule } from "@server/user/operations/operations.module";

@Module({
  imports: [
    CustomRepositoryModule.forFeature(ExtendedRepositoryService, [User]),
    HttpModule,
    StatusMatrixModule,
    OperationsModule,
  ],
  providers: [UserResolver, UserService],
})
export class UserModule {}
