import { Card as HeroCard, CardBody, CardFooter, CardHeader, type CardProps as HeroCardProps } from '@heroui/react'
import { forwardRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type CardProps = HeroCardProps & {
  header?: ReactNode
  footer?: ReactNode
  children: ReactNode
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, footer, header, ...props }, ref) => {
    return (
      <HeroCard ref={ref} className={cn('p-4', className)} {...props}>
        {header && <CardHeader>{header}</CardHeader>}
        <CardBody>{children}</CardBody>
        {footer && <CardFooter>{footer}</CardFooter>}
      </HeroCard>
    )
  }
)

Card.displayName = 'Card'

// エクスポート
export { CardBody, CardFooter, CardHeader }