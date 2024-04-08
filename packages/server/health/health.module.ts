import { Module } from "@nestjs/common";
import { HealthController } from "@server/health/health.controller";

@Module({
  imports: [],
  controllers: [HealthController],
})
export class HealthModule {}
