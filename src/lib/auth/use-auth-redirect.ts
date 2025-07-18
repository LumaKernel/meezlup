"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * 認証後のリダイレクト処理を管理するカスタムフック
 */
export function useAuthRedirect(isAuthenticated: boolean, isLoading: boolean) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleAuthRedirect = useCallback(() => {
    // URLパラメータをチェック
    const hasAuthParam = searchParams.has("auth");
    const retryCount = parseInt(searchParams.get("retry") || "0");

    console.log("[useAuthRedirect] Has auth param:", hasAuthParam);
    console.log("[useAuthRedirect] Is authenticated:", isAuthenticated);
    console.log("[useAuthRedirect] Is loading:", isLoading);

    if (!hasAuthParam || isLoading) {
      return;
    }

    if (!isAuthenticated && retryCount < 3) {
      // まだ認証されていない場合は、少し待ってから再試行
      console.log(
        `[useAuthRedirect] Retry attempt ${(retryCount + 1) satisfies number}/3`,
      );

      const newParams = new URLSearchParams(searchParams);
      newParams.set("retry", String(retryCount + 1));

      setTimeout(() => {
        router.push(
          `${window.location.pathname satisfies string}?${newParams.toString() satisfies string}`,
        );
      }, 1000);
    } else {
      // 認証成功またはリトライ上限に達した場合、パラメータを削除
      console.log("[useAuthRedirect] Cleaning URL parameters");

      const newParams = new URLSearchParams(searchParams);
      newParams.delete("auth");
      newParams.delete("retry");

      const queryString = newParams.toString();
      const newUrl = queryString
        ? `${window.location.pathname satisfies string}?${queryString satisfies string}`
        : window.location.pathname;

      router.replace(newUrl);
    }
  }, [isAuthenticated, isLoading, router, searchParams]);

  // レンダリング中に直接実行
  if (typeof window !== "undefined") {
    handleAuthRedirect();
  }
}
