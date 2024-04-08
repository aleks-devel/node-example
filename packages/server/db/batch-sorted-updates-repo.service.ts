import {
  EntityManager,
  FindOptionsWhere,
  In,
  MoreThanOrEqual,
  ObjectLiteral,
  Repository,
} from "typeorm";
import { SortedRepository } from "@server/db/sorted-repository.service";
import { DeepPartial } from "typeorm/common/DeepPartial";
import { EntityTarget } from "typeorm/common/EntityTarget";
import { getCustomRepoToken, InjectCustomRepo } from "@server/db/repository-utils";
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type";
import { DEFAULT_DATA_SOURCE_NAME } from "@nestjs/typeorm/dist/typeorm.constants";
import { Inject } from "@nestjs/common";

export class BatchSortedUpdateRepo<
  Entity extends { id: number | string; orderIndex: number | string },
> extends SortedRepository<Entity> {
  public fromManager(manager: EntityManager) {
    const repo = manager.getRepository(this.target);
    return new BatchSortedUpdateRepo(
      repo.target,
      repo.manager,
      repo.queryRunner
    );
  }

  async batchUpdateInTransaction(
    currentEntitiesFindBy: FindOptionsWhere<Entity>,
    newEntities: DeepPartial<Entity>[],
    updateDeletedTo?: DeepPartial<Entity>,
    softDelete: boolean = true,
  ) {
    await this.manager.transaction(async (manager) => {
      const batchSortedRepo = new BatchSortedUpdateRepo(
        this.target,
        manager,
        manager.queryRunner,
      );
      await batchSortedRepo.batchUpdate(
        currentEntitiesFindBy,
        newEntities,
        updateDeletedTo,
        softDelete
      );
    });
  }

  async batchUpdate(
    currentEntitiesFindBy: FindOptionsWhere<Entity>,
    newEntities: DeepPartial<Entity>[],
    updateDeletedTo?: DeepPartial<Entity>,
    softDelete: boolean = true,
  ) {
    const currentEntities = await this.findSortedBy(
      currentEntitiesFindBy,
    );

    const remainingIds = new Set(newEntities.map((e) => e.id));
    const idsForDelete = currentEntities.reduce(
      (accum, val) => (remainingIds.has(val.id) ? accum : [...accum, val.id]),
      [],
    );

    if (idsForDelete.length > 0) {
      if (updateDeletedTo) {
        await this.update(
          { id: In(idsForDelete) } as FindOptionsWhere<Entity>,
          updateDeletedTo as any,
        );
      } else if (softDelete) {
        await this.softDelete({
          id: In(idsForDelete),
        } as FindOptionsWhere<Entity>);
      } else {
        await this.delete({
          id: In(idsForDelete),
        } as FindOptionsWhere<Entity>);
      }
    }

    // Prevent unique key errors
    const maxOrderElement = await this.find({
      take: 1,
      order: { orderIndex: "desc" } as any,
    });
    const maxOrderIndex = maxOrderElement[0]?.orderIndex ?? 1;

    await this.increment(
      {
        id: In(Array.from(remainingIds.values())),
      } as FindOptionsWhere<Entity>,
      "orderIndex",
      maxOrderIndex,
    );

    for (let i = 0; i < newEntities.length; i++) {
      const newEntity = newEntities[i];

      const updateData: any = {};

      for (const key in newEntity) {
        updateData[key] = newEntity[key as keyof typeof newEntity];
      }

      await this.update(
        { id: newEntity.id } as FindOptionsWhere<Entity>,
        {
          orderIndex: i + 1,
          ...updateData,
        },
      );
    }
  }
}

export const InjectBatchCustomRepo = (
  entity: EntityClassOrSchema,
  dataSource: string = DEFAULT_DATA_SOURCE_NAME,
): ReturnType<typeof InjectCustomRepo> => InjectCustomRepo(
  BatchSortedUpdateRepo,
  entity,
  dataSource
);
