import type { Metadata } from "next";
import { EventDetail } from "@/components/events/EventDetail";
import { getEvent } from "@/app/actions/event";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params;

  // イベント情報を取得
  const result = await getEvent(id);

  if (!result.success) {
    return {
      title: locale === "en" ? "Event Not Found" : "イベントが見つかりません",
    };
  }

  const event = result.data;

  return {
    title: `${event.name satisfies string} - MeetzUp`,
    description:
      event.description ||
      (locale === "en"
        ? "View and participate in this event on MeetzUp"
        : "MeetzUpでこのイベントを表示・参加"),
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;

  // イベント情報を取得
  const result = await getEvent(id);

  if (!result.success) {
    notFound();
  }

  return <EventDetail event={result.data} params={params} />;
}
