import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrencyModel } from "@server/currencies/model/currency.model";
import { CurrenciesService } from "@server/currencies/currencies.service";
import { UpdateCurrencyInput } from "@server/currencies/model/update-currency.input";

@Resolver(() => CurrencyModel)
export class CurrenciesResolver {
  constructor(private service: CurrenciesService) {}

  @Query(() => [CurrencyModel])
  async getCurrencies() {
    return this.service.index();
  }

  @Mutation(() => CurrencyModel)
  async updateCurrencyRate(@Args("data") data: UpdateCurrencyInput) {
    return this.service.updateRate(data);
  }
}
