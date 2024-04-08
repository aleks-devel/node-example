import { Controller, Get } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { DataSource } from "typeorm";

@Controller("/health")
export class HealthController {
  constructor(private dataSource: DataSource) {}

  @Get("/check")
  check() {
    return 200;
  }

  // TODO: Костыль для ECONRESET ошибки, поправить её нормально
  // Примечание по резюме: В итоге проект перешёл на sequelize для устранения этой и других ошибок
  @Cron(CronExpression.EVERY_MINUTE)
  async hearBeat() {
    await this.dataSource.query("SELECT 1");
  }
}
