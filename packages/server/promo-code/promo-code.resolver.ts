import { Context, Query, Resolver } from "@nestjs/graphql";
import { PromoCodeService } from "./promo-code.service";

@Resolver()
export class PromoCodeResolver {
  constructor(private service: PromoCodeService) {}

  @Query(() => String, { nullable: true })
  async startCode(@Context() context: any) {
    // nda
  }
}
