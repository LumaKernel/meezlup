import {
  Card as MantineCard,
  type CardProps as MantineCardProps,
} from "@mantine/core";
import { forwardRef, type ReactNode } from "react";

export type CardProps = MantineCardProps & {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, footer, header, ...props }, ref) => {
    return (
      <MantineCard ref={ref} padding="md" {...props}>
        {header && <MantineCard.Section>{header}</MantineCard.Section>}
        {children}
        {footer && <MantineCard.Section>{footer}</MantineCard.Section>}
      </MantineCard>
    );
  },
);

Card.displayName = "Card";
