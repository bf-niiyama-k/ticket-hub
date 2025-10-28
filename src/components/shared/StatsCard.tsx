'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { MdArrowUpward, MdArrowDownward, MdRemove, MdLock } from 'react-icons/md';
import { IconType } from 'react-icons';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    label: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon: IconType; // React Icon component
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
        return MdArrowUpward;
      case 'down':
        return MdArrowDownward;
      default:
        return MdRemove;
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

  const IconComponent = icon;
  const TrendIcon = change ? getTrendIcon(change.trend) : null;

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
          <IconComponent className={cn(iconColor, 'text-2xl')} />
        </div>
      </div>

      {change && TrendIcon && (
        <div className="mt-2 flex items-center">
          <TrendIcon className={cn(
            getTrendColor(change.trend),
            'text-base mr-1'
          )} />
          <span className={cn('text-sm', getTrendColor(change.trend))}>
            {change.trend !== 'neutral' && (change.trend === 'up' ? '+' : '')}{change.value}%
          </span>
          <span className="text-sm text-gray-500 ml-2">{change.label}</span>
        </div>
      )}

      {locked && (
        <div className="absolute inset-0 bg-white bg-opacity-60 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <MdLock className="text-gray-400 text-3xl" />
        </div>
      )}
    </Card>
  );
}