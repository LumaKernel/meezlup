import type { Metadata } from "next";
import { EventCreateForm } from "@/components/events/EventCreateForm";
import { AuthGuard } from "@/components/auth/AuthGuard";

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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <EventCreateForm params={params} />
      </div>
    </AuthGuard>
  );
}
