import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { Cron, CronExpression } from "@nestjs/schedule";
import { firstValueFrom } from "rxjs";
import { AxiosError } from "axios";
import { AccessRules } from "@server/db/types/access-rights";
import { Currency } from "@server/currencies/entities/currency.entity";
import {
  ExtendedRepositoryService,
  InjectExtendedCustomRepo
} from "@server/db/extended-repository.service";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Not } from "typeorm";
import { UpdateCurrencyInput } from "@server/currencies/model/update-currency.input";

type CurrenciesResponse = {
  base: string;
  date: string;
  rates: Record<string, number>;
  success: boolean;
  timestamp: number;
};

@Injectable()
export class CurrenciesService {
  constructor(
    private httpService: HttpService,
    // private notifications: nda,
    @InjectExtendedCustomRepo(Currency)
    private currenciesRepo: ExtendedRepositoryService<Currency>
  ) {}

  async index() {
    return this.currenciesRepo.find({
      where: {
        rateToUsd: Not(IsNull())
      }
    });
  }

  async updateRate(data: UpdateCurrencyInput) {
    return this.currenciesRepo.updateAndReturnOrFail({ code: data.code }, {
      rateToUsd: data.rateToUsd,
      addedValue: data.addedValue
    });
  }

  private apiKey = "P6x01H94u9iVE6enE2w9OMNa5NWlAeNY";
  private apiUrl = "https://api.apilayer.com/fixer/latest";
  private apiParams = { base: "USD" };

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async syncCurrencies() {
    let currencies: CurrenciesResponse;

    try {
      ({ data: currencies } = await firstValueFrom(
        this.httpService.get<CurrenciesResponse>(this.apiUrl, {
          params: this.apiParams,
          headers: {
            apiKey: this.apiKey,
          },
        }),
      ));
    } catch (e) {
      if (e instanceof AxiosError) {
        await this.sentErrorNotification();
      }
      return;
    }

    if (!currencies.success) {
      await this.sentErrorNotification();
      return;
    }

    const currenciesDb: Partial<Currency>[] = [];

    for (const code in currencies.rates) {
      currenciesDb.push({
        code,
        rateToUsd: currencies.rates[code],
      });
    }

    await this.currenciesRepo.upsert(currenciesDb, ["code"]);

    // nda
  }

  async sentErrorNotification() {
    // nda
  }
}
