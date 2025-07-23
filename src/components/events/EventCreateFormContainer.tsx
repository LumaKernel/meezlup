"use client";

import { use } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useEventCreation } from "@/lib/hooks/use-event-creation";
import { EventCreateFormPresentation } from "./EventCreateFormPresentation";

interface EventCreateFormContainerProps {
  readonly params: Promise<{ locale: string }>;
}

export function EventCreateFormContainer({ params }: EventCreateFormContainerProps) {
  const { locale } = use(params);
  const { t } = useTranslation("event");
  const router = useRouter();
  const eventCreation = useEventCreation(locale);
  
  const handleCancel = () => {
    router.back();
  };
  
  return (
    <EventCreateFormPresentation
      formData={eventCreation.formData}
      onFieldChange={eventCreation.updateField}
      onSubmit={eventCreation.handleSubmit}
      onCancel={handleCancel}
      isSubmitting={eventCreation.isSubmitting}
      error={eventCreation.error}
      fieldErrors={eventCreation.fieldErrors}
      isFormValid={eventCreation.isFormValid}
      t={t}
    />
  );
}