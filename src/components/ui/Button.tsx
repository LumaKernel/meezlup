import {
  Button as MantineButton,
  type ButtonProps as MantineButtonProps,
  Loader,
} from "@mantine/core";
import { forwardRef } from "react";

export type ButtonProps = MantineButtonProps & {
  loading?: boolean;
  onClick?: () => void;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, disabled, loading, ...props }, ref) => {
    return (
      <MantineButton
        ref={ref}
        disabled={disabled || loading}
        leftSection={loading ? <Loader size="xs" /> : undefined}
        {...props}
      >
        {loading ? "読み込み中..." : children}
      </MantineButton>
    );
  },
);

Button.displayName = "Button";
