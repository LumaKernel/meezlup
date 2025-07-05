"use client";

import { LoginButton } from "@/components/auth/LoginButton";
import { UserProfile } from "@/components/auth/UserProfile";
import { useAuth } from "@/lib/auth/hooks";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">MeetzUp</h1>
          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <Link href="/profile">
                <Button variant="light" size="sm">
                  プロフィール
                </Button>
              </Link>
            )}
            <LoginButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-5xl font-bold">
            日程調整を
            <span className="text-primary">もっとシンプル</span>に
          </h2>
          
          <p className="text-xl text-gray-600">
            友達や同僚との日程調整を簡単に。
            <br />
            MeetzUpで最適な日時を見つけよう。
          </p>

          {isAuthenticated ? (
            <div className="space-y-6">
              <p className="text-lg">
                ようこそ、{user?.name || user?.email}さん！
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/events/new">
                  <Button color="primary" size="lg">
                    新しいイベントを作成
                  </Button>
                </Link>
                <Link href="/events">
                  <Button variant="bordered" size="lg">
                    イベント一覧
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-lg text-gray-600">
                ログインして、イベントの作成や管理を始めましょう
              </p>
              <LoginButton className="text-lg px-8 py-3" />
            </div>
          )}
        </div>

        {/* 機能紹介 */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">📅</span>
            </div>
            <h3 className="text-xl font-semibold">簡単なイベント作成</h3>
            <p className="text-gray-600">
              数クリックでイベントを作成し、参加者に共有できます
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">🤝</span>
            </div>
            <h3 className="text-xl font-semibold">リアルタイム調整</h3>
            <p className="text-gray-600">
              参加者の都合をリアルタイムで確認しながら日程を決定
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-xl font-semibold">プライバシー重視</h3>
            <p className="text-gray-600">
              匿名での参加も可能。必要な情報だけを共有
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t mt-24">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; 2024 MeetzUp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}