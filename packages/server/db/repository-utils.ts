import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type";
import {
  DataSource,
  DataSourceOptions,
  EntitySchema,
  Repository,
} from "typeorm";
import { getDataSourcePrefix } from "@nestjs/typeorm";
import { DEFAULT_DATA_SOURCE_NAME } from "@nestjs/typeorm/dist/typeorm.constants";
import { Inject } from "@nestjs/common";

export function getCustomRepoToken(
  repo: typeof Repository<any>,
  entity: EntityClassOrSchema,
  dataSource?: DataSource | DataSourceOptions | string,
) {
  const dataSourcePrefix = getDataSourcePrefix(dataSource);

  if (entity instanceof EntitySchema) {
    return `${dataSourcePrefix}${
      entity.options.target ? entity.options.target.name : entity.options.name
    }${repo.name}`;
  }

  return `${dataSourcePrefix}${entity.name}${repo.name}`;
}

export const InjectCustomRepo = (
  repo: typeof Repository<any>,
  entity: EntityClassOrSchema,
  dataSource: string = DEFAULT_DATA_SOURCE_NAME,
): ReturnType<typeof Inject> =>
  Inject(getCustomRepoToken(repo, entity, dataSource));
