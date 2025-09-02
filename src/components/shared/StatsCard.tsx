'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    label: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon: string; // Remix icon class
  iconColor?: string;
  iconBgColor?: string;
  locked?: boolean;
  className?: string;
}

export default function StatsCard({
  title,
  value,
  change,
  icon,
  iconColor = 'text-blue-600',
  iconBgColor = 'bg-blue-100',
  locked = false,
  className
}: StatsCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'ri-arrow-up-line';
      case 'down':
        return 'ri-arrow-down-line';
      default:
        return 'ri-subtract-line';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card className={cn('p-6 relative', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">
            {formatValue(value)}
          </p>
        </div>
        <div className={cn('p-2 rounded-lg', iconBgColor)}>
          <i className={cn(icon, iconColor, 'text-xl w-6 h-6 flex items-center justify-center')}></i>
        </div>
      </div>
      
      {change && (
        <div className="mt-2 flex items-center">
          <i className={cn(
            getTrendIcon(change.trend),
            getTrendColor(change.trend),
            'text-sm w-4 h-4 flex items-center justify-center mr-1'
          )}></i>
          <span className={cn('text-sm', getTrendColor(change.trend))}>
            {change.trend !== 'neutral' && (change.trend === 'up' ? '+' : '')}{change.value}%
          </span>
          <span className="text-sm text-gray-500 ml-2">{change.label}</span>
        </div>
      )}
      
      {locked && (
        <div className="absolute inset-0 bg-white bg-opacity-60 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <i className="ri-lock-line text-gray-400 text-2xl"></i>
        </div>
      )}
    </Card>
  );
}