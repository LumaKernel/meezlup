import type { Meta, StoryObj } from "@storybook/react";
import { EventCreateFormContainer } from "./EventCreateFormContainer";
import React from "react";
import { ActionsProvider, NavigationProvider } from "@/lib/providers";
import type { ActionsContext } from "@/lib/providers";

const meta = {
  title: "Events/EventCreateForm/Container",
  component: EventCreateFormContainer,
  parameters: {
    layout: "padded",
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story: React.ComponentType) => {
      const mockNavigation = {
        push: () => {},
        replace: () => {},
        back: () => {},
        refresh: () => {},
        params: {},
      };
      const mockActions: ActionsContext = {
        event: {
          create: () =>
            Promise.resolve({
              success: true as const,
              data: {
                id: "test-event-id",
                name: "Test Event",
                description: null,
                dateRangeStart: new Date().toISOString(),
                dateRangeEnd: new Date().toISOString(),
                timeSlotDuration: 30,
                permission: "link-only" as const,
                changeDeadline: null,
                maxParticipants: null,
                creatorId: "user123",
                creatorCanSeeEmails: true,
                temporaryUserPermitted: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              } as any,
            }),
          update: () =>
            Promise.resolve({
              success: false as const,
              error: "Not implemented",
            }),
          delete: () =>
            Promise.resolve({
              success: false as const,
              error: "Not implemented",
            }),
          get: () =>
            Promise.resolve({
              success: false as const,
              error: "Not implemented",
            }),
        },
        schedule: {
          create: () =>
            Promise.resolve({
              success: false as const,
              error: "Not implemented",
            }),
          update: () =>
            Promise.resolve({
              success: false as const,
              error: "Not implemented",
            }),
          submit: () =>
            Promise.resolve({
              success: false as const,
              error: "Not implemented",
            }),
          getAggregated: () =>
            Promise.resolve({ success: true as const, data: [] }),
          getByEvent: () =>
            Promise.resolve({ success: true as const, data: [] }),
          getByEventAndUser: () =>
            Promise.resolve({ success: false as const, error: "Not found" }),
          delete: () =>
            Promise.resolve({
              success: false as const,
              error: "Not implemented",
            }),
        },
      };

      return (
        <NavigationProvider value={mockNavigation}>
          <ActionsProvider value={mockActions}>
            <Story />
          </ActionsProvider>
        </NavigationProvider>
      );
    },
  ],
} satisfies Meta<typeof EventCreateFormContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

// 日本語
export const Japanese: Story = {
  args: {
    params: Promise.resolve({ locale: "ja" }),
  },
};

// 英語
export const English: Story = {
  args: {
    params: Promise.resolve({ locale: "en" }),
  },
};
