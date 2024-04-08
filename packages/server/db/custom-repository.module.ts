import { DynamicModule, Module } from "@nestjs/common";
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type";
import { DataSource, DataSourceOptions, Repository } from "typeorm";
import {
  getDataSourceToken,
  getRepositoryToken,
  TypeOrmModule,
} from "@nestjs/typeorm";
import { getCustomRepoToken } from "@server/db/repository-utils";

@Module({})
export class CustomRepositoryModule {
  static forFeature(
    repository: typeof Repository<any>,
    entities: EntityClassOrSchema[],
    dataSource?: DataSource | DataSourceOptions | string,
  ): DynamicModule {
    const providers = entities.map((entity) => ({
      provide: getCustomRepoToken(repository, entity, dataSource),
      useFactory: (dataSource: DataSource) => {
        const entityRepo = dataSource.getRepository(entity);

        return new repository(
          entityRepo.target,
          entityRepo.manager,
          entityRepo.queryRunner,
        );
      },
      inject: [getDataSourceToken(dataSource)],
    }));
    return {
      imports: [TypeOrmModule.forFeature(entities, dataSource)],
      module: CustomRepositoryModule,
      providers: providers,
      exports: providers,
    };
  }
}
