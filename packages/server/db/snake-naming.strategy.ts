import { DefaultNamingStrategy, NamingStrategyInterface, Table } from "typeorm";
import { snakeCase } from "typeorm/util/StringUtils";
import RandomGenerator_1 from "typeorm/util/RandomGenerator";
import { View } from "typeorm/schema-builder/view/View";

export class SnakeNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  tableName(className: string, customName: string): string {
    return customName ? customName : snakeCase(className) + "s";
  }

  columnName(
    propertyName: string,
    customName: string,
    embeddedPrefixes: string[],
  ): string {
    return (
      snakeCase(embeddedPrefixes.concat("").join("_")) +
      (customName ? customName : snakeCase(propertyName))
    );
  }

  relationName(propertyName: string): string {
    return snakeCase(propertyName);
  }

  uniqueConstraintName(
    tableOrName: Table | string,
    columnNames: string[],
  ): string {
    const clonedColumnNames = [...columnNames];
    clonedColumnNames.sort();
    const tableName = this.getTableName(tableOrName);
    const replacedTableName = tableName.replace(".", "_");
    return `${replacedTableName}_${clonedColumnNames.join("_")}`;
  }

  relationConstraintName(
    tableOrName: Table | string,
    columnNames: string[],
    where?: string,
  ) {
    const clonedColumnNames = [...columnNames];
    clonedColumnNames.sort();
    const tableName = this.getTableName(tableOrName);
    const replacedTableName = tableName.replace(".", "_");
    let key = `${replacedTableName}_${clonedColumnNames.join("_")}`;
    if (where) key += `_${where}`;
    return key + "_rkey";
  }

  defaultConstraintName(tableOrName: Table | string, columnName: string) {
    const tableName = this.getTableName(tableOrName);
    const replacedTableName = tableName.replace(".", "_");
    return `${replacedTableName}_${columnName}_dkey`;
  }

  foreignKeyName(
    tableOrName: Table | string,
    columnNames: string[],
    referencedTablePath?: string,
    referencedColumnNames?: string[],
  ) {
    const clonedColumnNames = [...columnNames];
    clonedColumnNames.sort();
    const tableName = this.getTableName(tableOrName);
    const replacedTableName = tableName.replace(".", "_");
    return `${replacedTableName}_${clonedColumnNames.join("_")}_fkey`;
  }

  indexName(
    tableOrName: Table | string,
    columnNames: string[],
    where?: string,
  ) {
    const clonedColumnNames = [...columnNames];
    clonedColumnNames.sort();
    const tableName = this.getTableName(tableOrName);
    const replacedTableName = tableName.replace(".", "_");
    let key = `${replacedTableName}_${clonedColumnNames.join("_")}`;
    if (where) key += `_${where}`;
    return key + "_key";
  }

  joinColumnName(relationName: string, referencedColumnName: string): string {
    return snakeCase(relationName + "_" + referencedColumnName);
  }

  joinTableName(
    firstTableName: string,
    secondTableName: string,
    firstPropertyName: string,
    secondPropertyName: string,
  ): string {
    return snakeCase(
      firstTableName +
        "_" +
        firstPropertyName.replace(/\./gi, "_") +
        "_" +
        secondTableName,
    );
  }

  joinTableColumnName(
    tableName: string,
    propertyName: string,
    columnName?: string,
  ): string {
    return snakeCase(
      tableName + "_" + (columnName ? columnName : propertyName),
    );
  }

  classTableInheritanceParentColumnName(
    parentTableName: any,
    parentTableIdPropertyName: any,
  ): string {
    return snakeCase(parentTableName + "_" + parentTableIdPropertyName);
  }

  eagerJoinRelationAlias(alias: string, propertyPath: string): string {
    return alias + "__" + propertyPath.replace(".", "_");
  }
}
