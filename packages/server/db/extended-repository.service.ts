import {
  EntityManager,
  EntityNotFoundError,
  FindOptionsWhere,
  In,
  ObjectLiteral,
  Repository,
} from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type";
import { DEFAULT_DATA_SOURCE_NAME } from "@nestjs/typeorm/dist/typeorm.constants";
import {
  getCustomRepoToken,
  InjectCustomRepo,
} from "@server/db/repository-utils";
import { Inject } from "@nestjs/common";

export class ExtendedRepositoryService<
  // TODO: remove service from name&
  Entity extends ObjectLiteral,
> extends Repository<Entity> {
  public fromManager(manager: EntityManager) {
    const repo = manager.getRepository(this.target);
    return new ExtendedRepositoryService(
      repo.target,
      repo.manager,
      repo.queryRunner,
    );
  }

  public async insertAndReturn(
    entity: QueryDeepPartialEntity<Entity>,
  ): Promise<Entity>;
  public async insertAndReturn(
    entity: QueryDeepPartialEntity<Entity>[],
  ): Promise<Entity[]>;
  public async insertAndReturn(
    entityOrEntities:
      | QueryDeepPartialEntity<Entity>
      | QueryDeepPartialEntity<Entity>[],
  ): Promise<Entity | Entity[]> {
    const insertRes = await this.insert(entityOrEntities);

    const keys: Record<string, any[]> = {};

    for (const id of insertRes.identifiers) {
      for (const idKey in id) {
        if (keys[idKey] === undefined) {
          keys[idKey] = [];
        }
        keys[idKey].push(id[idKey]);
      }
    }

    const inKeys: Record<string, any> = {};

    for (const key in keys) {
      inKeys[key] = In(keys[key]);
    }

    const res = await this.find({
      where: inKeys as FindOptionsWhere<Entity>,
    });

    return Array.isArray(entityOrEntities) ? res : res[0];
  }

  public async updateAndReturn(
    criteria: FindOptionsWhere<Entity>,
    partialEntity: QueryDeepPartialEntity<Entity>,
  ): Promise<Entity | null> {
    await this.update(criteria, partialEntity);
    return this.findOne({
      where: criteria,
    });
  }

  public async updateAndReturnOrFail(
    criteria: FindOptionsWhere<Entity>,
    partialEntity: QueryDeepPartialEntity<Entity>,
  ): Promise<Entity> {
    const updateRes = await this.updateAndReturn(criteria, partialEntity);

    if (updateRes === null) {
      throw new EntityNotFoundError(this.target, criteria);
    }

    return updateRes;
  }
}

export const getExtendedCustomRepoToken = (
  entity: EntityClassOrSchema,
  dataSource: string = DEFAULT_DATA_SOURCE_NAME,
) => getCustomRepoToken(ExtendedRepositoryService, entity, dataSource);

export const InjectExtendedCustomRepo = (
  entity: EntityClassOrSchema,
  dataSource: string = DEFAULT_DATA_SOURCE_NAME,
): ReturnType<typeof InjectCustomRepo> =>
  Inject(getExtendedCustomRepoToken(entity, dataSource));
