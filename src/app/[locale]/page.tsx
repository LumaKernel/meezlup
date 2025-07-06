import type { Metadata } from "next";
import HomePage from "./home";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const title =
    locale === "en"
      ? "MeetzUp - Schedule meetings more simply"
      : "MeetzUp - 日程調整をもっとシンプルに";

  const description =
    locale === "en"
      ? "Easy scheduling with friends and colleagues. Find the best time with MeetzUp."
      : "友達や同僚との日程調整を簡単に。MeetzUpで最適な日時を見つけよう。";

  return {
    title,
    description,
  };
}

export default function Page({ params }: Props) {
  return <HomePage params={params} />;
}
