import {
  GraphQLList,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLResolveInfo,
} from "graphql/type";
import { SelectionNode } from "graphql/language/ast";
import { Kind } from "graphql/language";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { GraphQLNonNull } from "graphql/type/definition";

export type Filter<Entity> = {
  select: SelectFilter<Entity>;
  relations: RelationFilter<Entity>;
};

export type SelectFilter<Entity> = {
  [K in keyof Entity]?: Entity[K] extends any[]
    ? SelectFilter<Entity[K][number]>
    : Entity[K] extends object | undefined
      ? SelectFilter<Entity[K]>
      : boolean;
};

type PickRelationFields<Entity> = Pick<
  Entity,
  {
    [K in keyof Entity]-?: Required<Entity>[K] extends object ? K : never;
  }[keyof Entity]
>;

type CheckForNested<Entity> = {
  [K in keyof Entity]-?: Required<Entity>[K] extends string | number | boolean
    ? false
    : CheckForNested<Entity[K]>;
} extends Record<string, false>
  ? false
  : true;

type _RelationFilter<Entity> = {
  [K in keyof Entity]?: Entity[K] extends any[]
    ? CheckForNested<Entity[K][number]> extends true
      ? RelationFilter<Entity[K][number]>
      : boolean
    : CheckForNested<Entity[K]> extends false
      ? boolean
      : RelationFilter<Entity[K]>;
};

export type RelationFilter<Entity> = _RelationFilter<
  PickRelationFields<Required<Entity>>
>;

export const TypeOrmFilter = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const info = ctx.getInfo<GraphQLResolveInfo>();

    const { type } = info.parentType.getFields()[info.fieldName];

    const typeToCheck = getObjectType(type);

    if (typeToCheck === undefined) {
      return { select: {}, relations: {} };
    }

    const filters = filtersFromExtensions(typeToCheck);

    const transformed = transformGraphqlFields(
      info.fieldNodes[0]?.selectionSet?.selections,
      info,
      filters.skip,
    );
    if (filters.alwaysSelect) {
      smartMerge(transformed.select, filters.alwaysSelect);
    }
    if (filters.transform) {
      smartMerge(transformed.select, filters.transform);
    }
    return transformed;
  },
);

function getObjectType(typeToCompare: GraphQLOutputType) {
  let typeToCheck: GraphQLObjectType | undefined = undefined;

  if (typeToCompare instanceof GraphQLNonNull) {
    typeToCompare = typeToCompare.ofType;
  }
  if (typeToCompare instanceof GraphQLList) {
    typeToCompare = typeToCompare.ofType;
  }
  if (typeToCompare instanceof GraphQLNonNull) {
    typeToCompare = typeToCompare.ofType;
  }
  if (typeToCompare instanceof GraphQLObjectType) {
    typeToCheck = typeToCompare;
  }
  return typeToCheck;
}

function filtersFromExtensions(type: GraphQLObjectType) {
  const fields = type.getFields();
  const skip: Record<string, any> = {};
  const alwaysSelect: Record<string, any> = {};
  const transform: Record<string, any> = {};

  for (const fieldName in fields) {
    const field = fields[fieldName];

    const typeToCheck = getObjectType(field.type);

    if (typeToCheck !== undefined) {
      const filters = filtersFromExtensions(typeToCheck);
      skip[fieldName] = filters.skip;
      alwaysSelect[fieldName] = filters.alwaysSelect;
      transform[fieldName] = filters.transform;
    }

    if (field.extensions.synthetic) {
      skip[fieldName] = true;
    }
    if (field.extensions.alwaysSelect) {
      alwaysSelect[fieldName] = true;
    }
    if (field.extensions.name) {
      transform[field.extensions.name as any] = true;
      skip[fieldName] = true;
    }
  }

  return { skip, alwaysSelect, transform };
}

function smartMerge(target: Record<string, any>, child: Record<string, any>) {
  for (const key in child) {
    if (typeof child[key] === "object") {
      if (typeof target[key] === "object") {
        smartMerge(target[key], child[key]);
      }
    } else if (child[key] !== undefined) {
      target[key] = child[key];
    }
  }
}

function transformGraphqlFields(
  nodes: ReadonlyArray<SelectionNode> | undefined,
  info: GraphQLResolveInfo,
  skip: Record<string, any>,
) {
  let select: Record<string, any> = {};
  let relations: Record<string, any> = {};

  if (nodes === undefined) {
    return { select, relations };
  }

  for (const nodeEntry of nodes) {
    let node;

    if (nodeEntry.kind === Kind.FRAGMENT_SPREAD) {
      node = info.fragments[nodeEntry.name.value];
    } else {
      node = nodeEntry;
    }

    const selections = node.selectionSet?.selections;

    if (node.kind === Kind.FIELD) {
      const nodeName = node.name.value;

      if (nodeName === "__typename" || skip[nodeName] === true) continue;

      if (selections === undefined) {
        select[nodeName] = true;
        continue;
      }

      const transformed = transformGraphqlFields(
        selections,
        info,
        skip[nodeName] ?? {},
      );
      select[nodeName] = { ...transformed.select };

      if (Object.keys(transformed.relations).length > 0) {
        relations[nodeName] = { ...transformed.relations };
      } else {
        relations[nodeName] = true;
      }
    } else {
      const fragmentTransformed = transformGraphqlFields(
        selections,
        info,
        skip,
      );
      select = { ...select, ...fragmentTransformed.select };
      relations = { ...relations, ...fragmentTransformed.relations };
    }
  }

  return { select, relations };
}
