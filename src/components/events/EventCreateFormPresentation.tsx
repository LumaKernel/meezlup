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
import { Temporal } from "temporal-polyfill";
import type {
  CreateEventForm as CreateEventFormType,
  TimeSlotDuration,
  EventPermission,
} from "@/lib/effects/services/event/create-event-schema";

interface EventCreateFormPresentationProps {
  readonly formData: Partial<CreateEventFormType>;
  readonly onFieldChange: <K extends keyof CreateEventFormType>(
    field: K,
    value: CreateEventFormType[K]
  ) => void;
  readonly onSubmit: (e: React.FormEvent) => void;
  readonly onCancel: () => void;
  readonly isSubmitting: boolean;
  readonly error: string | null;
  readonly fieldErrors: Record<string, string>;
  readonly isFormValid: boolean;
  readonly t: (key: string) => string;
}

export function EventCreateFormPresentation({
  error,
  fieldErrors,
  formData,
  isFormValid,
  isSubmitting,
  onCancel,
  onFieldChange,
  onSubmit,
  t,
}: EventCreateFormPresentationProps) {
  return (
    <div>
      <Title order={1} mb="xl">
        {t("create.title")}
      </Title>

      <Paper shadow="sm" p="lg" withBorder>
        <form onSubmit={onSubmit}>
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
              value={formData.name || ""}
              onChange={(e) => { onFieldChange("name", e.target.value); }}
              onBlur={() => { onFieldChange("name", formData.name || ""); }}
              error={fieldErrors.name}
              maxLength={100}
              disabled={isSubmitting}
            />

            <Textarea
              label={t("create.description")}
              placeholder={t("create.descriptionPlaceholder")}
              value={formData.description || ""}
              onChange={(e) => { onFieldChange("description", e.target.value); }}
              onBlur={() => { onFieldChange("description", formData.description || ""); }}
              error={fieldErrors.description}
              maxLength={1000}
              rows={4}
              disabled={isSubmitting}
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
                    onFieldChange("dateRange", dateRange);
                  } catch (error) {
                    console.error("Error parsing date:", error);
                  }
                }
              }}
              minDate={new Date()}
              error={fieldErrors.dateRange}
              disabled={isSubmitting}
            />

            <Select
              label={t("create.timeSlotDuration")}
              placeholder={t("create.selectDuration")}
              required
              value={formData.timeSlotDuration?.toString()}
              onChange={(value) => {
                if (value) {
                  onFieldChange("timeSlotDuration", parseInt(value) as TimeSlotDuration);
                }
              }}
              data={[
                { value: "15", label: t("create.15minutes") },
                { value: "30", label: t("create.30minutes") },
                { value: "60", label: t("create.1hour") },
              ]}
              disabled={isSubmitting}
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
                if (value && typeof value === "object" && "getFullYear" in value) {
                  onFieldChange(
                    "changeDeadline",
                    Temporal.PlainDate.from((value as Date).toISOString().split("T")[0])
                  );
                } else if (value === null) {
                  onFieldChange("changeDeadline", undefined);
                }
              }}
              minDate={new Date()}
              clearable
              disabled={isSubmitting}
            />

            <NumberInput
              label={t("create.maxParticipants")}
              placeholder={t("create.maxParticipantsPlaceholder")}
              value={formData.maxParticipants}
              onChange={(value) => {
                onFieldChange("maxParticipants", typeof value === "number" ? value : undefined);
              }}
              onBlur={() => { onFieldChange("maxParticipants", formData.maxParticipants); }}
              error={fieldErrors.maxParticipants}
              min={1}
              disabled={isSubmitting}
            />

            <Select
              label={t("create.permission")}
              placeholder={t("create.selectPermission")}
              required
              value={formData.permission}
              onChange={(value) => {
                if (value) {
                  onFieldChange("permission", value as EventPermission);
                }
              }}
              data={[
                { value: "public", label: t("create.public") },
                { value: "private", label: t("create.private") },
                { value: "link-only", label: t("create.linkOnly") },
              ]}
              disabled={isSubmitting}
            />

            <Group justify="flex-end" mt="md">
              <Button
                variant="subtle"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                {t("create.cancel")}
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={!isFormValid || isSubmitting}
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