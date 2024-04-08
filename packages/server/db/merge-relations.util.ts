import { ObjectLiteral } from "typeorm";

export function mergeRelations<
  M extends ObjectLiteral,
  R extends ObjectLiteral,
>(
  mainData: M[],
  relationData: R[],
  mapTo: keyof M,
  mainKey: keyof M,
  relationKey: keyof R,
  mergeAsOne?: boolean,
) {
  const relationMap = relationData.reduce(
    (acc, val) => {
      const key = val[relationKey];
      if (!mergeAsOne && acc[key]) {
        return {
          ...acc,
          [key]: [...(acc[key] as any), val],
        };
      } else {
        return {
          ...acc,
          [key]: mergeAsOne ? val : [val],
        };
      }
    },
    {} as Record<string, R>,
  );

  mainData.forEach((entry) => {
    let relation = relationMap[entry[mainKey]] as any;

    if (!relation && !mergeAsOne) {
      relation = [];
    }

    entry[mapTo as keyof M] = relation;
  });
}
