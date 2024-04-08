import { IsDefined, IsString } from "class-validator";

export class UpdateDataDto {
  @IsString()
  hashId: string;

  @IsDefined()
  value: any;
}