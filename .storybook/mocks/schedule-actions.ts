/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access */
// Mock for server actions to prevent PrismaClient from being bundled in Storybook

export const getAggregatedTimeSlots = async (eventId: string) => {
  // デフォルトの空の集計データを返す
  // 各ストーリーでカスタマイズできるように、グローバル変数を参照
  const mockData = (globalThis as any).__mockAggregatedTimeSlots;
  if (mockData) {
    return mockData;
  }

  return {
    success: true,
    data: [],
  };
};

export const submitAvailability = async (input: unknown) => {
  // デフォルトの成功レスポンスを返す
  const mockResponse = (globalThis as any).__mockSubmitAvailability;
  if (mockResponse) {
    return mockResponse;
  }

  return {
    success: true,
    data: { scheduleId: "mock-schedule-id" },
  };
};

export const createSchedule = async (input: any) => {
  return {
    success: true,
    data: { id: "mock-schedule-id" },
  };
};

export const getSchedule = async (id: string) => {
  return {
    success: true,
    data: { id },
  };
};

export const getScheduleByEventAndUser = async (
  eventId: string,
  userId: string,
) => {
  return {
    success: true,
    data: null,
  };
};

export const updateSchedule = async (input: any) => {
  return {
    success: true,
    data: { id: input.id },
  };
};

export const deleteSchedule = async (id: string) => {
  return {
    success: true,
    data: { deleted: true },
  };
};

export const getSchedulesByEvent = async (eventId: string) => {
  return {
    success: true,
    data: [],
  };
};
