import {
  EntityManager,
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsOrderProperty,
  FindOptionsRelations,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from "typeorm";
import { DeepPartial } from "typeorm/common/DeepPartial";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { ExtendedRepositoryService } from "@server/db/extended-repository.service";
import { EntityTarget } from "typeorm/common/EntityTarget";
import { FindOneOptions } from "typeorm/find-options/FindOneOptions";
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type";
import { DEFAULT_DATA_SOURCE_NAME } from "@nestjs/typeorm/dist/typeorm.constants";
import { InjectCustomRepo } from "@server/db/repository-utils";

export class SortedRepository<
  Entity extends {
    id: number | string;
    orderIndex: number | string;
  },
> extends ExtendedRepositoryService<Entity> {
  public fromManager(manager: EntityManager) {
    const repo = manager.getRepository(this.target);
    return new SortedRepository(repo.target, repo.manager, repo.queryRunner);
  }

  private applyOrderByRelations(
    relations: any,
    orderBy: any,
    ignoreRelations: string[],
  ) {
    for (const key in relations) {
      let orderByKey = orderBy[key];

      if (!ignoreRelations.includes(key)) {
        if (orderByKey === undefined) {
          orderByKey = {
            orderIndex: "asc",
          };
        } else if (orderByKey.orderIndex === undefined) {
          orderByKey.orderIndex = "asc";
        }
      }

      if (typeof relations[key] === "object") {
        if (orderByKey === undefined) {
          orderByKey = {};
        }
        this.applyOrderByRelations(relations[key], orderByKey, ignoreRelations);
      }
      orderBy[key] = orderByKey;
    }
  }

  private getOptionsForSorted(
    options?: FindManyOptions<Entity>,
    ignoreRelations?: string[],
    ignoreSelf?: boolean,
  ) {
    let optionsCopy = options ? { ...options } : undefined;

    if (!ignoreSelf) {
      if (optionsCopy === undefined) {
        optionsCopy = {
          order: { orderIndex: "asc" } as FindOptionsOrder<Entity>,
        };
      } else if (optionsCopy.order?.orderIndex === undefined) {
        optionsCopy.order = {
          ...optionsCopy.order,
          orderIndex: "asc",
        } as FindOptionsOrder<Entity>;
      }
    }

    if (optionsCopy?.relations !== undefined) {
      if (optionsCopy.order === undefined) {
        optionsCopy.order = {};
      }
      this.applyOrderByRelations(
        optionsCopy.relations,
        optionsCopy.order!,
        ignoreRelations ?? [],
      );
    }

    return optionsCopy;
  }

  findOneSorted(
    options?: FindOneOptions<Entity>,
    ignoreRelations?: string[],
    ignoreSelf?: boolean,
  ) {
    return this.findOne(
      this.getOptionsForSorted(
        options,
        ignoreRelations,
        ignoreSelf,
      ) as FindOneOptions,
    );
  }

  findOneSortedBy(options: FindOptionsWhere<Entity>) {
    return this.findOneSorted({
      where: options,
    });
  }

  findOneSortedOrFail(
    options?: FindOneOptions<Entity>,
    ignoreRelations?: string[],
    ignoreSelf?: boolean,
  ) {
    return this.findOneOrFail(
      this.getOptionsForSorted(
        options,
        ignoreRelations,
        ignoreSelf,
      ) as FindOneOptions,
    );
  }

  findOneSortedByOrFail(options: FindOptionsWhere<Entity>) {
    return this.findOneSortedOrFail({
      where: options,
    });
  }

  findSorted(
    options?: FindManyOptions<Entity>,
    ignoreRelations?: string[],
    ignoreSelf?: boolean,
  ) {
    return this.find(
      this.getOptionsForSorted(options, ignoreRelations, ignoreSelf),
    );
  }

  findSortedBy(options: FindOptionsWhere<Entity>) {
    return this.findSorted({
      where: options,
    });
  }

  async updateSortingInTransaction(
    id: number | string,
    newOrderIndex: number | string,
    additionalAnd?: {
      query: string;
      params?: Record<string, any>;
    },
  ) {
    await this.manager.transaction(async (manager) => {
      const sortedRepo = new SortedRepository(
        this.target,
        manager,
        manager.queryRunner,
      );
      await sortedRepo.updateSorting(id, newOrderIndex, additionalAnd);
    });
  }

  async updateSorting(
    id: number | string,
    newOrderIndex: number | string,
    additionalAnd?: {
      query: string;
      params?: Record<string, any>;
    },
  ) {
    const entry = await this.findOneByOrFail({
      id,
    } as FindOptionsWhere<Entity>);

    await this.update(id, { orderIndex: 0 } as any);
    const isUpper = entry.orderIndex > newOrderIndex;

    if (isUpper) {
      newOrderIndex = String(BigInt(newOrderIndex) + BigInt(1));
    }

    const smallerOrderIndex =
      newOrderIndex > entry.orderIndex ? entry.orderIndex : newOrderIndex;
    const biggerOrderIndex =
      newOrderIndex > entry.orderIndex ? newOrderIndex : entry.orderIndex;

    let query = this.createQueryBuilder("entries")
      .update()
      .where(
        `orderIndex ${isUpper ? ">=" : ">"} :smaller AND orderIndex ${
          isUpper ? "<" : "<="
        } :bigger`,
        { smaller: smallerOrderIndex, bigger: biggerOrderIndex },
      )
      .orderBy("orderIndex", isUpper ? "DESC" : "ASC")
      .set({ orderIndex: () => `orderIndex ${isUpper ? "+" : "-"} 1` } as any);

    if (additionalAnd) {
      query = query.andWhere(additionalAnd.query, additionalAnd.params);
    }

    await query.execute();

    return this.update(id, { orderIndex: newOrderIndex } as any);
  }

  async insertManySorted(entities: QueryDeepPartialEntity<Entity>[]) {
    const maxOrderProduct = await this.find({
      take: 1,
      withDeleted: true,
      order: { orderIndex: "desc" } as any,
    });
    const maxOrderProductIndex = BigInt(maxOrderProduct[0]?.orderIndex ?? 0);

    return this.insertAndReturn(
      entities.map((e, i) => {
        return {
          ...e,
          orderIndex: String(BigInt(i + 1) + maxOrderProductIndex),
        };
      }),
    );
  }

  async insertSorted(entity: QueryDeepPartialEntity<Entity>) {
    const maxOrderEntity = await this.find({
      take: 1,
      withDeleted: true,
      order: { orderIndex: "desc" } as any,
    });

    const maxOrder = BigInt(maxOrderEntity[0]?.orderIndex ?? 0);

    return this.insertAndReturn({
      ...entity,
      orderIndex: String(maxOrder + BigInt(1)),
    });
  }
}

export const InjectSortedCustomRepo = (
  entity: EntityClassOrSchema,
  dataSource: string = DEFAULT_DATA_SOURCE_NAME,
): ReturnType<typeof InjectCustomRepo> =>
  InjectCustomRepo(SortedRepository, entity, dataSource);
