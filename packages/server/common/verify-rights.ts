import { AccessRule } from "@server/db/types/access-rights";

export function verifyRights(necessaryRights: AccessRule[], userRights: AccessRule[]) {
  let all = true;
  let some = false;

  necessaryRights.forEach((right) => {
    if (userRights.includes(right)) {
      some = true;
    } else {
      all = false;
    }
  });

  return { all, some };
}
