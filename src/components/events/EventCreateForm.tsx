"use client";

import { useState, use, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Button,
  Stack,
  Group,
  Title,
  Paper,
  Alert,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { Temporal } from "temporal-polyfill";
import type {
  CreateEventForm as CreateEventFormType,
  TimeSlotDuration,
  EventPermission,
} from "@/lib/effects/services/event/create-event-schema";
import { createEventAction } from "@/app/actions/event";

interface EventCreateFormProps {
  readonly params: Promise<{ locale: string }>;
}

export function EventCreateForm({ params }: EventCreateFormProps) {
  const { locale } = use(params);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // フォームの状態管理
  const [formData, setFormData] = useState<Partial<CreateEventFormType>>({
    name: "",
    description: "",
    timeSlotDuration: 30,
    permission: "link-only",
  });

  // フィールドごとのエラー状態
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // フィールドバリデーション
  const validateField = (field: string, value: unknown) => {
    const errors = { ...fieldErrors };

    switch (field) {
      case "name":
        if (!value || (typeof value === "string" && value.trim() === "")) {
          errors.name =
            locale === "en" ? "Event name is required" : "イベント名は必須です";
        } else if (typeof value === "string" && value.length > 100) {
          errors.name =
            locale === "en"
              ? "Event name must be at most 100 characters"
              : "イベント名は100文字以内で入力してください";
        } else {
          delete errors.name;
        }
        break;
      case "description":
        if (typeof value === "string" && value.length > 1000) {
          errors.description =
            locale === "en"
              ? "Description must be at most 1000 characters"
              : "説明は1000文字以内で入力してください";
        } else {
          delete errors.description;
        }
        break;
      case "dateRange":
        if (
          value &&
          typeof value === "object" &&
          "start" in value &&
          "end" in value &&
          value.start &&
          value.end
        ) {
          if (Temporal.PlainDate.compare(value.start, value.end) > 0) {
            errors.dateRange =
              locale === "en"
                ? "End date must be after start date"
                : "終了日は開始日以降にしてください";
          } else {
            delete errors.dateRange;
          }
        }
        break;
      case "maxParticipants":
        if (value && typeof value === "number" && value < 1) {
          errors.maxParticipants =
            locale === "en"
              ? "Max participants must be at least 1"
              : "参加人数は1人以上で設定してください";
        } else {
          delete errors.maxParticipants;
        }
        break;
    }

    setFieldErrors(errors);
  };

  // フォームが有効かチェック
  const isFormValid = () => {
    return (
      !!formData.name &&
      formData.name.trim() !== "" &&
      !!formData.dateRange &&
      Object.keys(fieldErrors).length === 0
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 全フィールドをバリデーション
    validateField("name", formData.name);
    validateField("description", formData.description);
    validateField("dateRange", formData.dateRange);
    validateField("maxParticipants", formData.maxParticipants);

    if (!isFormValid()) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await createEventAction(formData);

        if ("error" in result) {
          setError(result.error);
          notifications.show({
            title: "エラー",
            message: result.error,
            color: "red",
          });
        } else {
          notifications.show({
            title: "成功",
            message: "イベントを作成しました",
            color: "green",
          });

          // イベント詳細ページにリダイレクト
          router.push(
            `/${locale satisfies string}/events/${result.data.eventId satisfies string}`,
          );
        }
      } catch (err) {
        console.error("イベント作成エラー:", err);
        setError("予期しないエラーが発生しました");
      }
    });
  };

  return (
    <div>
      <Title order={1} mb="xl">
        {locale === "en" ? "Create New Event" : "新しいイベントを作成"}
      </Title>

      <Paper shadow="sm" p="lg" withBorder>
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {error && (
              <Alert color="red" title="エラー">
                {error}
              </Alert>
            )}

            <TextInput
              label={locale === "en" ? "Event Name" : "イベント名"}
              placeholder={
                locale === "en" ? "Enter event name" : "イベント名を入力"
              }
              required
              value={formData.name}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, name: value });
                validateField("name", value);
              }}
              onBlur={() => {
                validateField("name", formData.name);
              }}
              error={fieldErrors.name}
              maxLength={100}
            />

            <Textarea
              label={locale === "en" ? "Description" : "詳細説明"}
              placeholder={
                locale === "en"
                  ? "Enter event description (optional)"
                  : "イベントの詳細を入力（任意）"
              }
              value={formData.description}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, description: value });
                validateField("description", value);
              }}
              onBlur={() => {
                validateField("description", formData.description);
              }}
              error={fieldErrors.description}
              maxLength={1000}
              rows={4}
            />

            <DatePickerInput
              type="range"
              label={locale === "en" ? "Date Range" : "日付範囲"}
              placeholder={
                locale === "en" ? "Select date range" : "日付範囲を選択"
              }
              required
              value={
                formData.dateRange
                  ? [
                      new Date(formData.dateRange.start.toString()),
                      new Date(formData.dateRange.end.toString()),
                    ]
                  : undefined
              }
              onChange={(value) => {
                if (Array.isArray(value)) {
                  const startDate = value[0];
                  const endDate = value[1];
                  // null チェックとDate型チェック
                  if (
                    startDate &&
                    endDate &&
                    typeof startDate === "object" &&
                    typeof endDate === "object" &&
                    "toISOString" in startDate &&
                    "toISOString" in endDate
                  ) {
                    const dateRange = {
                      start: Temporal.PlainDate.from(
                        (startDate as Date).toISOString().split("T")[0],
                      ),
                      end: Temporal.PlainDate.from(
                        (endDate as Date).toISOString().split("T")[0],
                      ),
                    };
                    setFormData({
                      ...formData,
                      dateRange,
                    });
                    validateField("dateRange", dateRange);
                  }
                }
              }}
              minDate={new Date()}
              error={fieldErrors.dateRange}
            />

            <Select
              label={locale === "en" ? "Time Slot Duration" : "時間帯の幅"}
              placeholder={locale === "en" ? "Select duration" : "時間幅を選択"}
              required
              value={formData.timeSlotDuration?.toString()}
              onChange={(value) => {
                if (value) {
                  setFormData({
                    ...formData,
                    timeSlotDuration: parseInt(value) as TimeSlotDuration,
                  });
                }
              }}
              data={[
                { value: "15", label: locale === "en" ? "15 minutes" : "15分" },
                { value: "30", label: locale === "en" ? "30 minutes" : "30分" },
                { value: "60", label: locale === "en" ? "1 hour" : "1時間" },
              ]}
            />

            <DatePickerInput
              label={
                locale === "en"
                  ? "Change Deadline (Optional)"
                  : "変更期限（任意）"
              }
              placeholder={locale === "en" ? "Select deadline" : "期限を選択"}
              value={
                formData.changeDeadline
                  ? (() => {
                      const [year, month, day] = formData.changeDeadline
                        .toString()
                        .split("-")
                        .map(Number);
                      return new Date(year, month - 1, day);
                    })()
                  : undefined
              }
              onChange={(value) => {
                if (
                  value &&
                  typeof value === "object" &&
                  "getFullYear" in value
                ) {
                  setFormData({
                    ...formData,
                    changeDeadline: Temporal.PlainDate.from(
                      (value as Date).toISOString().split("T")[0],
                    ),
                  });
                } else if (value === null) {
                  setFormData({ ...formData, changeDeadline: undefined });
                }
              }}
              minDate={new Date()}
              clearable
            />

            <NumberInput
              label={
                locale === "en"
                  ? "Max Participants (Optional)"
                  : "参加人数制限（任意）"
              }
              placeholder={
                locale === "en"
                  ? "Enter max participants"
                  : "最大参加人数を入力"
              }
              value={formData.maxParticipants}
              onChange={(value) => {
                setFormData({
                  ...formData,
                  maxParticipants:
                    typeof value === "number" ? value : undefined,
                });
                validateField("maxParticipants", value);
              }}
              onBlur={() => {
                validateField("maxParticipants", formData.maxParticipants);
              }}
              error={fieldErrors.maxParticipants}
              min={1}
            />

            <Select
              label={locale === "en" ? "Permission" : "権限設定"}
              placeholder={locale === "en" ? "Select permission" : "権限を選択"}
              required
              value={formData.permission}
              onChange={(value) => {
                if (value) {
                  setFormData({
                    ...formData,
                    permission: value as EventPermission,
                  });
                }
              }}
              data={[
                { value: "public", label: locale === "en" ? "Public" : "公開" },
                {
                  value: "private",
                  label: locale === "en" ? "Private" : "非公開",
                },
                {
                  value: "link-only",
                  label: locale === "en" ? "Link Only" : "リンクのみ",
                },
              ]}
            />

            <Group justify="flex-end" mt="md">
              <Button
                variant="subtle"
                onClick={() => {
                  router.back();
                }}
                disabled={isPending}
              >
                {locale === "en" ? "Cancel" : "キャンセル"}
              </Button>
              <Button
                type="submit"
                loading={isPending}
                disabled={!isFormValid() || isPending}
              >
                {locale === "en" ? "Create Event" : "イベントを作成"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </div>
  );
}
