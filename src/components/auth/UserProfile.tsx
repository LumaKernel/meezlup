"use client";

import { useAuth } from "@/lib/auth/hooks";
import { Card } from "@/components/ui/Card";

interface UserProfileProps {
  readonly className?: string;
}

/**
 * ユーザープロフィール表示コンポーネント
 */
export function UserProfile({ className }: UserProfileProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <Card className={className}>
        <div className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-gray-300 h-12 w-12"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Card className={className}>
        <p className="text-gray-500">ログインしていません</p>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="flex items-center space-x-4">
        {user.picture && (
          <img
            src={user.picture}
            alt={user.name || "ユーザーアバター"}
            className="rounded-full h-12 w-12"
          />
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{user.name || "名前なし"}</h3>
          <p className="text-sm text-gray-600">{user.email}</p>
          {user.emailVerified && (
            <span className="text-xs text-green-600">✓ メール確認済み</span>
          )}
        </div>
      </div>
    </Card>
  );
}
