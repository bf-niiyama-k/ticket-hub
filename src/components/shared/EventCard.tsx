'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EventCardData {
  id: number | string;
  title: string;
  date: string;
  venue: string;
  price?: string | number;
  image: string;
  status?: 'published' | 'draft' | 'sold-out';
  category?: string;
  ticketsSold?: number;
  totalTickets?: number;
}

interface EventCardProps {
  event: EventCardData;
  variant?: 'default' | 'admin' | 'compact';
  showActions?: boolean;
  onEdit?: (event: EventCardData) => void;
  onToggleStatus?: (event: EventCardData) => void;
  onDelete?: (event: EventCardData) => void;
  className?: string;
}

export default function EventCard({
  event,
  variant = 'default',
  showActions = false,
  onEdit,
  onToggleStatus,
  onDelete,
  className
}: EventCardProps) {
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default" className="bg-green-100 text-green-800">公開中</Badge>;
      case 'draft':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">下書き</Badge>;
      case 'sold-out':
        return <Badge variant="destructive">完売</Badge>;
      default:
        return null;
    }
  };

  const formatPrice = (price: string | number | undefined) => {
    if (price === undefined) return '';
    if (typeof price === 'number') {
      return `¥${price.toLocaleString()}`;
    }
    return price;
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  if (variant === 'compact') {
    return (
      <Card className={cn('p-4 hover:shadow-md transition-shadow', className)}>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
            <Image
              src={event.image}
              alt={event.title}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
            <p className="text-sm text-gray-600">{formatDate(event.date)}</p>
            <p className="text-sm text-gray-500">{event.venue}</p>
          </div>
          {event.price && (
            <div className="text-lg font-bold text-blue-600">
              {formatPrice(event.price)}〜
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden hover:shadow-lg transition-shadow', className)}>
      <div className="relative">
        <Image
          src={event.image}
          alt={event.title}
          width={400}
          height={250}
          className="w-full h-48 object-cover object-top"
        />
        {event.status && (
          <div className="absolute top-3 left-3">
            {getStatusBadge(event.status)}
          </div>
        )}
        {event.category && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-white/90 text-gray-800">
              {event.category}
            </Badge>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {event.title}
        </h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <i className="ri-calendar-line mr-2"></i>
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <i className="ri-map-pin-line mr-2"></i>
            <span>{event.venue}</span>
          </div>
          {variant === 'admin' && event.ticketsSold !== undefined && event.totalTickets !== undefined && (
            <div className="flex items-center text-gray-600">
              <i className="ri-ticket-line mr-2"></i>
              <span>{event.ticketsSold} / {event.totalTickets} 枚</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          {event.price && (
            <span className="text-2xl font-bold text-blue-600">
              {formatPrice(event.price)}〜
            </span>
          )}
          
          <div className="flex items-center space-x-2">
            {showActions && variant === 'admin' ? (
              <>
                <Button variant="outline" size="sm" onClick={() => onEdit?.(event)}>
                  編集
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleStatus?.(event)}
                  className={event.status === 'published' ? 'text-orange-600' : 'text-green-600'}
                >
                  {event.status === 'published' ? '非公開' : '公開'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete?.(event)}
                >
                  削除
                </Button>
              </>
            ) : (
              <Button asChild size="sm">
                <Link href={`/events/${event.id}`}>
                  詳細を見る
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}