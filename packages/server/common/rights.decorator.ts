import { AccessRule } from "@server/db/types/access-rights";
import { SetMetadata } from "@nestjs/common";

export const RIGHTS_KEY = "rights";
export const Rights = (...rules: AccessRule[]) => SetMetadata(RIGHTS_KEY, rules);
