import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  variant?: 'default' | 'primary' | 'accent' | 'warning' | 'destructive';
  className?: string;
}

const variantStyles = {
  default: 'bg-card border border-border',
  primary: 'gradient-primary text-primary-foreground',
  accent: 'gradient-accent text-accent-foreground',
  warning: 'bg-warning text-warning-foreground',
  destructive: 'bg-destructive text-destructive-foreground',
};

export function StatCard({ icon, label, value, variant = 'default', className }: StatCardProps) {
  const isColored = variant !== 'default';
  
  return (
    <div
      className={cn(
        'rounded-xl p-4 shadow-soft transition-all duration-200 hover:shadow-card animate-scale-in',
        variantStyles[variant],
        className
      )}
    >
      <div className={cn('mb-2', isColored ? 'opacity-90' : 'text-muted-foreground')}>
        {icon}
      </div>
      <p className={cn('text-2xl font-bold', !isColored && 'text-foreground')}>
        {value}
      </p>
      <p className={cn('text-sm', isColored ? 'opacity-80' : 'text-muted-foreground')}>
        {label}
      </p>
    </div>
  );
}
