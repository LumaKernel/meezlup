import { useState, useCallback } from "react";
import { useActions } from "@/lib/providers/actions";
import { useNavigation } from "@/lib/providers/navigation";
import { useTranslation } from "react-i18next";
import { Temporal } from "temporal-polyfill";
import { consumePromise } from "@/lib/utils/promise";
import type { CreateEventForm as CreateEventFormType } from "@/lib/effects/services/event/create-event-schema";

interface EventCreationState {
  readonly isSubmitting: boolean;
  readonly error: string | null;
  readonly fieldErrors: Record<string, string>;
}

interface EventCreationReturn {
  readonly formData: Partial<CreateEventFormType>;
  readonly updateField: <K extends keyof CreateEventFormType>(
    field: K,
    value: CreateEventFormType[K],
  ) => void;
  readonly handleSubmit: (e: React.FormEvent) => void;
  readonly isSubmitting: boolean;
  readonly error: string | null;
  readonly fieldErrors: Record<string, string>;
  readonly isFormValid: boolean;
}

export function useEventCreation(locale: string): EventCreationReturn {
  const { t } = useTranslation("event");
  const actions = useActions();
  const navigation = useNavigation();

  const [state, setState] = useState<EventCreationState>({
    isSubmitting: false,
    error: null,
    fieldErrors: {},
  });

  const [formData, setFormData] = useState<Partial<CreateEventFormType>>({
    name: "",
    description: "",
    timeSlotDuration: 30,
    permission: "link-only",
    dateRange: undefined,
    changeDeadline: undefined,
    maxParticipants: undefined,
  });

  const validateField = useCallback(
    (field: string, value: unknown) => {
      const errors = { ...state.fieldErrors };

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

      setState((prev) => ({ ...prev, fieldErrors: errors }));
    },
    [state.fieldErrors, t],
  );

  const updateField = useCallback(
    <K extends keyof CreateEventFormType>(
      field: K,
      value: CreateEventFormType[K],
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      validateField(field, value);
    },
    [validateField],
  );

  const isFormValid =
    !!formData.name &&
    formData.name.trim() !== "" &&
    !!formData.dateRange &&
    Object.keys(state.fieldErrors).length === 0;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      // 全フィールドをバリデーション
      validateField("name", formData.name);
      validateField("description", formData.description);
      validateField("dateRange", formData.dateRange);
      validateField("maxParticipants", formData.maxParticipants);

      if (!isFormValid) {
        return;
      }

      setState((prev) => ({ ...prev, isSubmitting: true, error: null }));

      // Server Action呼び出しのラッパー
      const submitPromise = (async () => {
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

          const result = (await actions.event.create(submitData)) as
            | { success: true; data: { eventId: string } }
            | { error: string };

          // createEventAction returns either { success: true, data: { eventId } } or { error: string }
          if ("error" in result) {
            setState((prev) => ({
              ...prev,
              isSubmitting: false,
              error: result.error || t("create.error"),
            }));
          } else {
            navigation.push(
              `/${locale satisfies string}/events/${result.data.eventId satisfies string}`,
            );
          }
        } catch {
          setState((prev) => ({
            ...prev,
            isSubmitting: false,
            error: t("create.unexpectedError"),
          }));
        }
      })();

      consumePromise(submitPromise);
    },
    [formData, actions, navigation, locale, t, isFormValid, validateField],
  );

  return {
    formData,
    updateField,
    handleSubmit,
    isSubmitting: state.isSubmitting,
    error: state.error,
    fieldErrors: state.fieldErrors,
    isFormValid,
  };
}
