export enum PossibleErrors {
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  Conflict = 409,
  ExternalApiError = 505,
}

export class BaseException extends Error {
  public errorCode: PossibleErrors;
  public cause: string;
  public errorMessage?: string;
  public additionalData?: object;

  constructor(
    error: PossibleErrors,
    cause: string,
    message?: string,
    additionalData?: object,
  ) {
    super(`Cause: ${cause}. Message: ${message ?? "no-message"}`);

    this.errorCode = error;
    this.cause = cause;
    this.errorMessage = message;
    this.additionalData = additionalData;
  }
}

export class NotFoundException extends BaseException {
  constructor(cause: string, message?: string, additionalData?: object) {
    super(
      PossibleErrors.NotFound,
      cause,
      message ?? "Not found",
      additionalData,
    );
  }
}

export class ConflictException extends BaseException {
  constructor(cause: string, message?: string, additionalData?: object) {
    super(
      PossibleErrors.Conflict,
      cause,
      message ?? "Conflict",
      additionalData,
    );
  }
}

export class ExternalApiException extends BaseException {
  constructor(cause: string, message?: string, additionalData?: object) {
    super(
      PossibleErrors.ExternalApiError,
      cause,
      message ?? "External api error",
      additionalData,
    );
  }
}

export class BadRequestException extends BaseException {
  constructor(cause: string, message?: string, additionalData?: object) {
    super(
      PossibleErrors.BadRequest,
      cause,
      message ?? "Bad request",
      additionalData,
    );
  }
}

export class UnauthorizedException extends BaseException {
  constructor(cause?: string, message?: string, additionalData?: object) {
    super(
      PossibleErrors.Unauthorized,
      cause ?? "",
      message ?? "Unauthorized",
      additionalData,
    );
  }
}

export class ForbiddenException extends BaseException {
  constructor(cause?: string, message?: string, additionalData?: object) {
    super(
      PossibleErrors.Forbidden,
      cause ?? "",
      message ?? "Forbidden",
      additionalData,
    );
  }
}
