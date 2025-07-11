"use client";

import { useAuth } from "@/lib/auth/hooks";
import { Card } from "@/components/ui/Card";
import { Group, Stack, Skeleton, Text, Avatar, Badge } from "@mantine/core";

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
        <Group>
          <Skeleton height={48} circle />
          <Stack gap="xs" style={{ flex: 1 }}>
            <Skeleton height={16} width="75%" />
            <Skeleton height={12} width="50%" />
          </Stack>
        </Group>
      </Card>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Card className={className}>
        <Text c="dimmed">ログインしていません</Text>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <Group>
        <Avatar
          src={user.picture}
          alt={user.name || "ユーザーアバター"}
          size="lg"
        />
        <Stack gap="xs" style={{ flex: 1 }}>
          <Text size="lg" fw={600}>
            {user.name || "名前なし"}
          </Text>
          <Text size="sm" c="dimmed">
            {user.email}
          </Text>
          {user.emailVerified && (
            <Badge color="green" size="xs">
              ✓ メール確認済み
            </Badge>
          )}
        </Stack>
      </Group>
    </Card>
  );
}
