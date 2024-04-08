import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

// TODO
@Injectable()
export class RightsGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log(context);
    return true;
  }
}

