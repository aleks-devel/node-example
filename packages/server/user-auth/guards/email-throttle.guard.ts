import { ThrottlerException, ThrottlerGuard } from "@nestjs/throttler";
import {
  ExecutionContext,
  HttpException,
  InternalServerErrorException,
} from "@nestjs/common";

export class EmailThrottleGuard extends ThrottlerGuard {
  async handleRequest(context: ExecutionContext, limit: number, ttl: number) {
    const email = context.switchToHttp().getRequest()?.body?.email;

    if (email === undefined) {
      throw new InternalServerErrorException(
        "EmailThrottleGuard: email field not present in body",
      );
    }

    const key = this.generateKey(context, email);
    const { totalHits, timeToExpire } = await this.storageService.increment(
      key,
      ttl,
    );

    if (totalHits > limit) {
      throw new HttpException(
        {
          retryAfter: timeToExpire,
        },
        429,
      );
    }

    context.switchToHttp().getRequest().throttleHits = limit - totalHits;
    return true;
  }
}
