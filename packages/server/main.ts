import "./register-graph-enums";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";
import { SocketIOProvider } from "@server/common/SocketIOProvider";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import { MainExceptionFilter } from "@server/common/main-exception.filter";
import { EntityNotFoundFilter } from "@server/common/entity-not-found.filter";
import helmet from "helmet";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix("/api");

  if (!process.env.STATIC_HOST || !process.env.PROJECT_HOST) {
    throw new Error("env STATIC_HOST or PROJECT_HOST is undefined");
  }

  const origins: (string | RegExp)[] = [
    new RegExp(`${process.env.PROJECT_HOST}$`.replace(/\./g, "\\.")),
  ];

  app.enableCors({
    origin: origins,
    credentials: true,
  });

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          imgSrc: [
            `'self'`,
            "data:",
            process.env.STATIC_HOST,
            "apollo-server-landing-page.cdn.apollographql.com",
          ],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
          manifestSrc: [
            `'self'`,
            "apollo-server-landing-page.cdn.apollographql.com",
          ],
          frameSrc: [`'self'`, "sandbox.embed.apollographql.com"],
        },
      },
    }),
  );

  app.use(cookieParser());
  app.useWebSocketAdapter(new SocketIOProvider(app.getHttpServer()));

  app.useGlobalPipes(new ValidationPipe());

  app.useGlobalFilters(new MainExceptionFilter());
  app.useGlobalFilters(new EntityNotFoundFilter());

  await app.listen(3001);
}

bootstrap();
