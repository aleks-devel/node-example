import { DataSource, EntityManager } from "typeorm";

export abstract class TransactionService {
  protected constructor(protected dataSource: DataSource) {}

  public abstract getForTransaction(manager: EntityManager): any;

  async runInTransaction<R, T extends TransactionService>(cb: (service: T) => Promise<R>) {
    return this.dataSource.transaction(async (manager) => {
      const service = this.getForTransaction(manager);
      return cb(service);
    });
  }
}
