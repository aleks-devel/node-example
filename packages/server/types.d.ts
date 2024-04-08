declare type RequestEmployee = {
  id: number;
  job: string;
  rights: import("@server/db/types/access-rights").AccessRule[];
};

declare type JwtUser = {
  sub: number;
};

declare type RequestUser = {
  id: number;
};

namespace Express {
  export interface Request {
    user?: RequestUser | RequestEmployee;
    throttleHits?: number;
  }
}

declare interface BigInt {
  toJSON: () => string;
}
