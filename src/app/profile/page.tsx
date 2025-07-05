"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { UserProfile } from "@/components/auth/UserProfile";
import { LoginButton } from "@/components/auth/LoginButton";
import { useAuth } from "@/lib/auth/hooks";

/**
 * プロフィールページ
 * 認証が必要なページの例
 */
export default function ProfilePage() {
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">マイプロフィール</h1>
        
        <div className="space-y-6">
          <UserProfile />
          
          <div className="flex justify-end">
            <LoginButton />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}