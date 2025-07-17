import { Effect, Exit, Cause } from "effect";
import type { AppError } from "../errors";

// エラーレスポンスの型
export type ErrorResponse = {
  readonly error: string;
  readonly message: string;
  readonly details?: unknown;
};

// AppErrorをErrorResponseに変換
export const appErrorToResponse = (error: AppError): ErrorResponse => {
  switch (error._tag) {
    case "DatabaseError":
      return {
        error: "DATABASE_ERROR",
        message: error.message,
        details:
          process.env.NODE_ENV === "development" ? error.cause : undefined,
      };
    case "NotFoundError":
      return {
        error: "NOT_FOUND",
        message: `${error.resource satisfies string} with id '${error.id satisfies string}' not found`,
      };
    case "ValidationError":
      return {
        error: "VALIDATION_ERROR",
        message: `Validation failed for field '${error.field satisfies string}': ${error.message satisfies string}`,
      };
    case "UnauthorizedError":
      return {
        error: "UNAUTHORIZED",
        message: error.message,
      };
    case "ForbiddenError":
      return {
        error: "FORBIDDEN",
        message: `You don't have permission to ${error.action satisfies string} ${error.resource satisfies string}`,
      };
    case "ConflictError":
      return {
        error: "CONFLICT",
        message: error.message,
      };
    case "AuthenticationError":
      return {
        error: "AUTHENTICATION_ERROR",
        message: error.message,
      };
    case "AuthError":
      return {
        error: "AUTH_ERROR",
        message: error.message,
        details:
          process.env.NODE_ENV === "development" ? error.cause : undefined,
      };
  }
};

// Causeからエラーメッセージを取得
export const causeToErrorResponse = (
  cause: Cause.Cause<AppError>,
): ErrorResponse => {
  const failures = Cause.failures(cause);
  const failureArray = Array.from(failures);
  if (failureArray.length > 0) {
    // Chunkの最初の要素を取得
    const firstFailure = failureArray[0];
    return appErrorToResponse(firstFailure);
  }

  const defects = Cause.defects(cause);
  if (defects.length > 0) {
    return {
      error: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
      details:
        process.env.NODE_ENV === "development"
          ? Array.from(defects)[0]
          : undefined,
    };
  }

  if (Cause.isInterrupted(cause)) {
    return {
      error: "INTERRUPTED",
      message: "The operation was interrupted",
    };
  }

  return {
    error: "UNKNOWN_ERROR",
    message: "An unknown error occurred",
  };
};

// EffectをPromiseに変換（エラーハンドリング付き）
export const runAsPromise = <A>(
  effect: Effect.Effect<A, AppError>,
): Promise<A> =>
  Effect.runPromiseExit(effect).then((exit) => {
    if (Exit.isSuccess(exit)) {
      return exit.value;
    } else {
      const errorResponse = causeToErrorResponse(exit.cause);
      throw new Error(JSON.stringify(errorResponse));
    }
  });

// 成功/失敗のレスポンス型
export type ApiResponse<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: ErrorResponse };

// EffectをApiResponseに変換
export const toApiResponse = <A>(
  effect: Effect.Effect<A, AppError>,
): Effect.Effect<ApiResponse<A>> =>
  effect.pipe(
    Effect.map((data): ApiResponse<A> => ({ success: true, data })),
    Effect.catchAll(
      (error): Effect.Effect<ApiResponse<A>> =>
        Effect.succeed({
          success: false,
          error: appErrorToResponse(error),
        }),
    ),
  );

// ログ出力付きエラーハンドリング
export const withErrorLogging = <A, E>(
  effect: Effect.Effect<A, E>,
  context?: string,
) =>
  effect.pipe(
    Effect.tapError((error) =>
      Effect.sync(() => {
        console.error(
          `[${(context ?? "Error") satisfies string}]:`,
          error instanceof Error ? error.message : error,
        );
      }),
    ),
  );
