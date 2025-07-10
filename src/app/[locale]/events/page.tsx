import type { Metadata } from "next";
import { EventList } from "@/components/events/EventList";
import { AuthGuard } from "@/components/auth/AuthGuard";

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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <EventList params={params} />
      </div>
    </AuthGuard>
  );
}
