import type { Metadata } from "next";
import { EventList } from "@/components/events/EventList";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Container } from "@mantine/core";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const title =
    locale === "en" ? "My Events - MeetzUp" : "マイイベント - MeetzUp";

  const description =
    locale === "en"
      ? "View and manage your events on MeetzUp"
      : "MeetzUpであなたのイベントを表示・管理";

  return {
    title,
    description,
  };
}

export default function EventsPage({ params }: Props) {
  return <EventsPageContent params={params} />;
}

function EventsPageContent({ params }: Props) {
  return (
    <AuthGuard>
      <Container size="xl" py="lg">
        <EventList params={params} />
      </Container>
    </AuthGuard>
  );
}
