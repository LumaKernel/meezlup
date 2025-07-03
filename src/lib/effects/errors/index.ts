import { Data } from "effect";

// 基本的なエラータイプ
export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class NotFoundError extends Data.TaggedError("NotFoundError")<{
  readonly resource: string;
  readonly id: string;
}> {}

export class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly field: string;
  readonly message: string;
}> {}

export class UnauthorizedError extends Data.TaggedError("UnauthorizedError")<{
  readonly message: string;
}> {}

export class ForbiddenError extends Data.TaggedError("ForbiddenError")<{
  readonly resource: string;
  readonly action: string;
}> {}

export class ConflictError extends Data.TaggedError("ConflictError")<{
  readonly resource: string;
  readonly message: string;
}> {}

// エラーの型エイリアス
export type AppError =
  | DatabaseError
  | NotFoundError
  | ValidationError
  | UnauthorizedError
  | ForbiddenError
  | ConflictError;
