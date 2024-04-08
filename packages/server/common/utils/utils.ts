import { FindOptionsSelect, } from "typeorm/find-options/FindOptionsSelect";
import { FindOptionsRelations } from "typeorm/find-options/FindOptionsRelations";

export type Func = (...args: any[]) => any;
type IsFunction<T> = T extends Func ? true : false;
export type ExcludeFuncsFromObj<T> = Pick<
  T,
  { [K in keyof T]: IsFunction<T[K]> extends true ? never : K }[keyof T]
>;

export function prepareUri(url: string) {
  if (!url.startsWith("/")) {
    url = "/" + url;
  }
  if (url.endsWith("/")) {
    url = url.substring(0, url.length - 1);
  }

  return url;
}

/** @deprecated */
export type DbFilter = any

/**
 * @deprecated
 */
export type FrontEndDto<D> = Omit<D, "fromDb">;
type RemoveNullish<T> = {
  [P in keyof T]: null extends T[P] ? Exclude<T[P], null> | undefined : T[P];
};
type RemoveNullAndFalse<T> = {
  [P in keyof T]: null extends T[P]
    ? Exclude<T[P], null> | undefined
    : boolean extends T[P]
      ? T[P] | undefined
      : undefined;
};

export function removeNullish<O = Record<string, any>>(
  object: O,
  removeFalse: true,
): RemoveNullAndFalse<O>;
export function removeNullish<O = Record<string, any>>(
  object: O,
): RemoveNullish<O>;
export function removeNullish<O = Record<string, any>>(
  object: O,
  removeFalse?: boolean,
): RemoveNullish<O> | RemoveNullAndFalse<O> {
  const transformed: any = {};

  for (const key in object) {
    if (
      object[key] !== undefined &&
      object[key] !== null &&
      (!removeFalse || object[key] !== false)
    ) {
      transformed[key] = object[key];
    }
  }

  return transformed;
}

export function removeSlash(icon: string | undefined) {
  if(!icon) {
    return icon;
  }

  return icon.replace(/\//g, "");
}

export enum Difference {
  Bigger,
  Smaller,
  Equal,
  NoRecords,
}
