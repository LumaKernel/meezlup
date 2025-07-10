import type { Metadata } from "next";
import { getEvent } from "@/app/actions/event";
import { notFound } from "next/navigation";
import { EventParticipate } from "@/components/events/EventParticipate";

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
    title: `${(locale === "en" ? "Participate in" : "参加：") satisfies string} ${event.name satisfies string} - MeetzUp`,
    description:
      event.description ||
      (locale === "en"
        ? "Select your available time slots for this event"
        : "このイベントの参加可能な時間帯を選択してください"),
  };
}

export default async function EventParticipatePage({ params }: Props) {
  const { id } = await params;

  // イベント情報を取得
  const result = await getEvent(id);

  if (!result.success) {
    notFound();
  }

  const event = result.data;

  // TODO: 将来的にlink-onlyイベントにトークンベースのアクセス制御を実装する場合、
  // ここでトークンの検証を行う
  // 現在はリンクを知っている人なら誰でもアクセス可能

  return <EventParticipate event={event} params={params} />;
}
