import { ClassConstructor } from "class-transformer/types/interfaces";
import { applyDecorators } from "@nestjs/common";
import { plainToInstance, Transform } from "class-transformer";
import { ValidateIf, ValidationOptions } from "class-validator";

export const TransformJson = <T>(cls: ClassConstructor<T>) => applyDecorators(
  Transform((params) => {
    return plainToInstance(cls, JSON.parse(params.value));
  }, { toClassOnly: true })
);

export function Optional(options?: ValidationOptions): PropertyDecorator {
  return function (prototype: Object, propertyKey: string | symbol) {
    ValidateIf((obj) => (obj)[propertyKey] !== undefined, options)(prototype, propertyKey);
  };
}
