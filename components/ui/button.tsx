import { Slot } from '@radix-ui/react-slot';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: ButtonVariant;
  children: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:opacity-90',
  secondary: 'border bg-background hover:bg-muted',
  ghost: 'hover:bg-muted',
};

export function Button({
  asChild = false,
  className,
  variant = 'primary',
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : 'button';

  return (
    <Component
      className={cn(
        'inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
