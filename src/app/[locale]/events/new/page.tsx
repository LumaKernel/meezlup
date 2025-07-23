import type { Metadata } from "next";
import { EventCreateFormContainer } from "@/components/events/EventCreateFormContainer";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Container } from "@mantine/core";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const title =
    locale === "en"
      ? "Create New Event - MeetzUp"
      : "新しいイベントを作成 - MeetzUp";

  const description =
    locale === "en"
      ? "Create a new event and schedule meetings with friends and colleagues"
      : "新しいイベントを作成して、友達や同僚とのミーティングをスケジュール";

  return {
    title,
    description,
  };
}

export default function CreateEventPage({ params }: Props) {
  return <CreateEventPageContent params={params} />;
}

function CreateEventPageContent({ params }: Props) {
  return (
    <AuthGuard>
      <Container size="md" py="lg">
        <EventCreateFormContainer params={params} />
      </Container>
    </AuthGuard>
  );
}
