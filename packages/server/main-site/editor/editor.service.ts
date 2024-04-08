import { Injectable } from "@nestjs/common";
import {
  EditorObject,
  EditorData as TEditorData,
  InitializeData,
} from "@server/main-site/editor/dto/get-editor-data.dto";
import {
  ExtendedRepositoryService,
  InjectExtendedCustomRepo,
} from "@server/db/extended-repository.service";
import { EditorData } from "@server/main-site/editor/entities/editor-data.entity";
import { DataSource, EntityManager, In, Raw } from "typeorm";
import {
  EditorResponse,
  EditorResponseObject,
} from "@server/main-site/editor/responses/editor-data.response";
import { TransactionService } from "@server/db/transaction-service";
import { EditorDataType } from "@server/main-site/editor/entities/editor-data-type.enum";
import { UpdateDataDto } from "@server/main-site/editor/dto/update-data.dto";
import {
  BadRequestException,
  NotFoundException,
} from "@server/common/exceptions/base-exceptions";

@Injectable()
export class EditorService extends TransactionService {
  constructor(
    @InjectExtendedCustomRepo(EditorData)
    private editorRepo: ExtendedRepositoryService<EditorData>,
    dataSource: DataSource,
  ) {
    super(dataSource);
  }

  getForTransaction(manager: EntityManager) {
    return new EditorService(
      this.editorRepo.fromManager(manager),
      manager.connection,
    );
  }

  private convertToConvenient(data: EditorData[]): EditorResponse {
    const res: Record<string, any> = {};

    for (const item of data) {
      let workingObj = res;

      const keys = item.dkey.split(".");

      for (const key of keys) {
        workingObj[key] = { ...workingObj[key] };
        workingObj = workingObj[key];
      }

      const workingData: Record<string, any> = {
        ...item.data,
        type: item.type,
        hashId: item.dkey, // TODO: hash
      };

      if (workingData.type === EditorDataType.array) {
        workingData.value.forEach((v: any) => {
          for (const key in v) {
            v[key] = {
              value: v[key],
              hashId: `${workingData.hashId}.${key}`,
            };
          }
        });
      }

      for (const key in workingData) {
        workingObj[key] = workingData[key];
      }
    }

    return res;
  }

  async initializeData(data: InitializeData[]) {
    const convData = data.map((entry) => {
      const { key: _, value, type: _1, ...rest } = entry as any;
      const data: Record<string, any> = { value };

      for (const key in rest) {
        if (rest[key]) {
          data[key] = rest[key as any];
        }
      }

      return { ...entry, data };
    });

    const keys = data.map((v) => v.key);

    const existingData = await this.editorRepo.findBy({
      dkey: In(keys),
    });
    const keysForUpdate = existingData.map((v) => v.dkey);

    const dataForInsert: typeof convData = [];

    for (const entry of convData) {
      const updateIndex = keysForUpdate.indexOf(entry.key);

      if (updateIndex !== -1) {
        if (!existingData[updateIndex].isChanged) {
          await this.editorRepo.update(
            { dkey: entry.key },
            {
              type: entry.type,
              data: entry.data,
            },
          );
        }
      } else {
        dataForInsert.push(entry);
      }
    }

    await this.editorRepo.insert(
      dataForInsert.map((entry) => {
        return {
          dkey: entry.key,
          data: entry.data,
          type: entry.type,
          isChanged: false,
        };
      }),
    );

    return this.convertToConvenient(
      await this.editorRepo.findBy({ dkey: In(keys) }),
    );
  }

  async getAllData(ids: string[]): Promise<EditorResponseObject[]> {
    const data = await this.editorRepo.findBy({
      dkey: In(ids),
    });

    return data.map((d) => ({
      ...d.data,
      hashId: d.dkey,
      type: d.type,
    })) as EditorResponseObject[];
  }

  async updateData(data: UpdateDataDto[]) {
    const existData = await this.editorRepo.findBy({
      dkey: In(data.map((d) => d.hashId)),
    });
    const dataMap = new Map(existData.map((d) => [d.dkey, d.data]));

    for (const entry of data) {
      const oldEntry = dataMap.get(entry.hashId);

      if (!oldEntry) {
        throw new NotFoundException("entry");
      }

      await this.editorRepo.update(
        { dkey: entry.hashId },
        { data: { ...oldEntry, value: entry.value }, isChanged: true },
      );
    }
  }
}
