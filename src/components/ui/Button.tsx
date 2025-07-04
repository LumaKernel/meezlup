import { Button as HeroButton, type ButtonProps as HeroButtonProps } from '@heroui/react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export type ButtonProps = HeroButtonProps & {
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, disabled, loading, ...props }, ref) => {
    return (
      <HeroButton
        ref={ref}
        className={cn(className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            読み込み中...
          </span>
        ) : (
          children
        )}
      </HeroButton>
    )
  }
)

Button.displayName = 'Button'