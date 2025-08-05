import { server } from "./mocks/server";
import { http, HttpResponse } from "msw";
import { waitFor, screen } from "@testing-library/react";
import { expect } from "vitest";
import type { User, Event, Schedule } from "@/lib/effects";
import { UserFactory } from "./factories";

/**
 * 認証状態をセットアップするヘルパー
 */
export const setupAuth = (user: User | null = UserFactory.create()) => {
  server.use(
    http.get("/api/user/profile", () => {
      if (user) {
        return HttpResponse.json(UserFactory.auth0User(user));
      }
      return new HttpResponse(null, { status: 401 });
    }),
  );
};

/**
 * イベントエンドポイントをセットアップ
 */
export const setupEventEndpoint = (event: Event) => {
  server.use(
    http.get(`/api/events/:id`, () => {
      return HttpResponse.json({ success: true, data: event });
    }),
  );
};

/**
 * スケジュールエンドポイントをセットアップ
 */
export const setupScheduleEndpoint = (schedule: Schedule) => {
  server.use(
    http.get(`/api/schedules/:id`, () => {
      return HttpResponse.json({ success: true, data: schedule });
    }),
  );
};

/**
 * 集計結果エンドポイントをセットアップ
 */
export const setupAggregationEndpoint = (eventId: string, data: unknown) => {
  server.use(
    http.post("/api/schedules/aggregate", async ({ request }) => {
      const body = (await request.json()) as { eventId: string };
      if (body.eventId === eventId) {
        return HttpResponse.json({ success: true, data });
      }
      return HttpResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 },
      );
    }),
  );
};

/**
 * ローディング状態が終わるまで待つ
 */
export const waitForLoadingToFinish = async () =>
  waitFor(() => {
    expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
  });

/**
 * エラーメッセージが表示されるまで待つ
 */
export const waitForError = async (errorText: string) =>
  waitFor(() => {
    expect(screen.getByText(errorText)).toBeInTheDocument();
  });

/**
 * 成功メッセージが表示されるまで待つ
 */
export const waitForSuccess = async (successText: string) =>
  waitFor(() => {
    expect(screen.getByText(successText)).toBeInTheDocument();
  });

/**
 * MSWハンドラーをリセット
 */
export const resetHandlers = () => {
  server.resetHandlers();
};

/**
 * 非同期処理を待つ汎用ヘルパー
 */
export const waitForAsync = async () => {
  // React の更新を待つ
  await waitFor(() => {});
};
