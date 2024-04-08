import {
  Args,
  ID,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import {
  Filter,
  TypeOrmFilter,
} from "@server/common/utils/typeorm-filter.utils";
import { SocialNetworkModel } from "@server/main-site/socials/models/social-network.model";
import { SocialsService } from "@server/main-site/socials/socials.service";

@Resolver(() => SocialNetworkModel)
export class SocialsResolver {
  constructor(private service: SocialsService) {}

  @Query(() => SocialNetworkModel, { nullable: true })
  async socialNetwork(
    @TypeOrmFilter() filters: Filter<SocialNetworkModel>,
    @Args("id", { type: () => ID, nullable: true }) id?: string,
    @Args("url", { nullable: true }) url?: string,
    @Args("showPackage", { nullable: true }) showPackage?: boolean,
  ) {
    return this.service.getSocial(
      id ? Number(id) : undefined,
      url,
      filters,
      showPackage,
    );
  }

  @Query(() => [SocialNetworkModel])
  async socialNetworks(
    @TypeOrmFilter() filters: Filter<SocialNetworkModel>,
    @Args("showPackage", { nullable: true }) showPackage?: boolean,
    @Args("limit", { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.service.getSocials(filters, showPackage, limit);
  }

  @ResolveField()
  shortName(@Parent() model: any/*nda*/) {
    return model.name.slice(0, 7);
  }

  @ResolveField()
  async icons(@Parent() model: any/*nda*/) {
    return {
      main: model.icon,
      footer: model.footerIcon,
    };
  }
}
