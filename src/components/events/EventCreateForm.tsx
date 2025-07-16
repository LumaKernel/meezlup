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
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("event");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // フォームの状態管理
  const [formData, setFormData] = useState<Partial<CreateEventFormType>>({
    name: "",
    description: "",
    timeSlotDuration: 30,
    permission: "link-only",
    dateRange: undefined,
  });

  // フィールドごとのエラー状態
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // フィールドバリデーション
  const validateField = (field: string, value: unknown) => {
    const errors = { ...fieldErrors };

    switch (field) {
      case "name":
        if (!value || (typeof value === "string" && value.trim() === "")) {
          errors.name = t("create.eventNameRequired");
        } else if (typeof value === "string" && value.length > 100) {
          errors.name = t("create.eventNameMaxLength");
        } else {
          delete errors.name;
        }
        break;
      case "description":
        if (typeof value === "string" && value.length > 1000) {
          errors.description = t("create.descriptionMaxLength");
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
            errors.dateRange = t("create.dateRangeInvalid");
          } else {
            delete errors.dateRange;
          }
        }
        break;
      case "maxParticipants":
        if (value && typeof value === "number" && value < 1) {
          errors.maxParticipants = t("create.maxParticipantsMin");
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
        // Temporal.PlainDateを文字列に変換
        const submitData = {
          ...formData,
          dateRange: formData.dateRange
            ? {
                start: formData.dateRange.start.toString(),
                end: formData.dateRange.end.toString(),
              }
            : undefined,
          changeDeadline: formData.changeDeadline?.toString(),
        };

        const result = await createEventAction(submitData);

        if ("error" in result) {
          setError(result.error);
          notifications.show({
            title: t("create.error"),
            message: result.error,
            color: "red",
          });
        } else {
          notifications.show({
            title: t("create.success"),
            message: t("create.eventCreated"),
            color: "green",
          });

          // イベント詳細ページにリダイレクト
          router.push(
            `/${locale satisfies string}/events/${result.data.eventId satisfies string}`,
          );
        }
      } catch (err) {
        console.error("イベント作成エラー:", err);
        setError(t("create.unexpectedError"));
      }
    });
  };

  return (
    <div>
      <Title order={1} mb="xl">
        {t("create.title")}
      </Title>

      <Paper shadow="sm" p="lg" withBorder>
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {error && (
              <Alert color="red" title={t("create.error")}>
                {error}
              </Alert>
            )}

            <TextInput
              label={t("create.eventName")}
              placeholder={t("create.eventNamePlaceholder")}
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
              label={t("create.description")}
              placeholder={t("create.descriptionPlaceholder")}
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
              label={t("create.dateRange")}
              placeholder={t("create.selectDateRange")}
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
                if (Array.isArray(value) && value[0] && value[1]) {
                  try {
                    const dateRange = {
                      start: Temporal.PlainDate.from(
                        new Date(value[0]).toISOString().split("T")[0],
                      ),
                      end: Temporal.PlainDate.from(
                        new Date(value[1]).toISOString().split("T")[0],
                      ),
                    };
                    setFormData({
                      ...formData,
                      dateRange,
                    });
                    validateField("dateRange", dateRange);
                  } catch (error) {
                    console.error("Error parsing date:", error);
                  }
                }
              }}
              minDate={new Date()}
              error={fieldErrors.dateRange}
            />

            <Select
              label={t("create.timeSlotDuration")}
              placeholder={t("create.selectDuration")}
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
                { value: "15", label: t("create.15minutes") },
                { value: "30", label: t("create.30minutes") },
                { value: "60", label: t("create.1hour") },
              ]}
            />

            <DatePickerInput
              label={t("create.changeDeadline")}
              placeholder={t("create.changeDeadlinePlaceholder")}
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
              label={t("create.maxParticipants")}
              placeholder={t("create.maxParticipantsPlaceholder")}
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
              label={t("create.permission")}
              placeholder={t("create.selectPermission")}
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
                { value: "public", label: t("create.public") },
                { value: "private", label: t("create.private") },
                { value: "link-only", label: t("create.linkOnly") },
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
                {t("create.cancel")}
              </Button>
              <Button
                type="submit"
                loading={isPending}
                disabled={!isFormValid() || isPending}
              >
                {t("create.createEvent")}
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </div>
  );
}
