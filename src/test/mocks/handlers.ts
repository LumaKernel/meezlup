import { http, HttpResponse } from "msw";

// デフォルトのハンドラー
export const handlers = [
  // Auth API
  http.get("/api/user/profile", () => {
    // デフォルトでは未認証を返す
    return new HttpResponse(null, { status: 401 });
  }),

  // Event API
  http.post("/api/events", async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      success: true,
      data: {
        id: "event123",
        ...body,
      },
    });
  }),

  // Schedule API
  http.get("/api/events/:eventId/aggregated", () => {
    return HttpResponse.json({
      success: true,
      data: [],
    });
  }),
];
