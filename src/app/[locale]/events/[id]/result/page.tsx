import type { Metadata } from "next";
import { getEvent } from "@/app/actions/event";
import { notFound } from "next/navigation";
import { EventResult } from "@/components/events/EventResult";

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
    title: `${(locale === "en" ? "Results for" : "結果：") satisfies string} ${event.name satisfies string} - MeetzUp`,
    description:
      locale === "en"
        ? "View the aggregated availability for this event"
        : "このイベントの参加可能時間の集計結果を表示",
  };
}

export default async function EventResultPage({ params }: Props) {
  const { id } = await params;

  // イベント情報を取得
  const result = await getEvent(id);

  if (!result.success) {
    notFound();
  }

  return <EventResult event={result.data} params={params} />;
}
