import { Module } from "@nestjs/common";

import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { TestModule } from "@server/test/test.module";
import { AuthModule } from "@server/user-auth/auth.module";
import { ScheduleModule } from "@nestjs/schedule";
import { BullModule } from "@nestjs/bull";
import { CurrenciesModule } from "@server/currencies/currencies.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Employee } from "@server/db/entities/employee.entity";
import { EmployeeAccess } from "@server/db/entities/employee-access.entity";
import { User } from "@server/user/entities/user.entity";
import { SnakeNamingStrategy } from "@server/db/snake-naming.strategy";
import { Currency } from "@server/currencies/entities/currency.entity";
import { EmployeeFavorite } from "@server/db/entities/employee-favorite.entity";
import { InstagramAccount } from "@server/db/bot-entities/instagram/instagram-account.entity";
import { InstagramCriterion } from "@server/db/bot-entities/instagram/instagram-criterion.entity";
import { InstagramHighlight } from "@server/db/bot-entities/instagram/instagram-highlight.entity";
import { InstagramPostComment } from "@server/db/bot-entities/instagram/instagram-post-comment.entity";
import { InstagramPost } from "@server/db/bot-entities/instagram/instagram-post.entity";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { UploadModule } from "@server/upload/upload.module";
import { ApolloServerPluginLandingPageDisabled } from "@apollo/server/plugin/disabled";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { MainSiteModule } from "@server/main-site/main-site.module";
import { PurchaseModule } from "@server/purchase/purchase.module";
import { OrderSubProduct } from "@server/purchase/entities/order-sub-product.entity";
import { Order } from "@server/purchase/entities/order.entity";
import { OrderProduct } from "@server/purchase/entities/order-product.entity";
import { DispatchSupplier } from "@server/purchase/entities/dispatch-supplier.entity";
import { ReviewsModule } from "@server/main-site/reviews/reviews.module";
import { PromoCode } from "@server/promo-code/entities/promo-code.entity";
import { Client } from "@server/client-metric/entities/client.entity";
import { PromoCodeModule } from "@server/promo-code/promo-code.module";
import { ClientModule } from "@server/client-metric/client.module";
import { PaymentTransaction } from "@server/payments/entities/payment-transaction.entity";
import { UserReferral } from "@server/user/entities/user-referral.entity";
import { Setting } from "./settings/entities/setting.entity";
import { UserModule } from "@server/user/user.module";
import { HealthModule } from "@server/health/health.module";
import { EditorData } from "@server/main-site/editor/entities/editor-data.entity";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      redis: {
        host: "localhost",
        port: 6379,
      },
    }),
    ThrottlerModule.forRoot(),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: "./schema.gql",
      playground: false,
      plugins: [
        process.env.NODE_ENV === "production"
          ? ApolloServerPluginLandingPageDisabled()
          : ApolloServerPluginLandingPageLocalDefault(),
      ],
    }),

    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: "mysql",
        host: configService.get("DB_HOST"),
        port: +configService.get("DB_PORT"),
        username: configService.get("DB_USERNAME"),
        password: configService.get("DB_PASSWORD"),
        database: configService.get("DB_DATABASE"),
        poolSize: 10,
        acquireTimeout: 10000,
        entities: [
          Currency,
          Employee,
          EmployeeAccess,
          EmployeeFavorite,
          User,
          InstagramAccount,
          InstagramCriterion,
          InstagramHighlight,
          InstagramPost,
          InstagramPostComment,
          Order,
          OrderProduct,
          OrderSubProduct,
          DispatchSupplier,
          PromoCode,
          Client,
          PaymentTransaction,
          UserReferral,
          Setting,
          EditorData,
        ],
        namingStrategy: new SnakeNamingStrategy(),
      }),
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      name: "bot",
      useFactory: (configService: ConfigService) => ({
        type: "mysql",
        host: configService.get("DB_BOT_HOST"),
        port: +configService.get("DB_BOT_PORT"),
        username: configService.get("DB_BOT_USERNAME"),
        password: configService.get("DB_BOT_PASSWORD"),
        database: configService.get("DB_BOT_DATABASE"),
        poolSize: 10,
        acquireTimeout: 10000,
        entities: [
          InstagramAccount,
          InstagramCriterion,
          InstagramHighlight,
          InstagramPost,
          InstagramPostComment,
        ],
      }),
      imports: [ConfigModule],
      inject: [ConfigService],
    }),

    TestModule,
    AuthModule,
    CurrenciesModule,
    UploadModule,
    MainSiteModule,
    PurchaseModule,
    ReviewsModule,
    PromoCodeModule,
    ClientModule,
    HealthModule,
    UserModule,
  ],
})
export class AppModule {}
