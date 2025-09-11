'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, formatDate, formatPrice } from '@/lib/utils';
import QRCodeDisplay from '../ticket/QRCodeDisplay';
import { generateQRData, encodeQRData } from '@/lib/qr-generator';

export interface TicketData {
  id: string;
  eventId: string;
  userId: string;
  eventTitle: string;
  eventDate: string;
  eventTime?: string;
  venue: string;
  ticketType: string;
  price: number;
  quantity: number;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  qrCode?: string;
  seatInfo?: string;
  purchaseDate: string;
  customerName?: string;
  customerEmail?: string;
  orderNumber?: string;
}

interface TicketCardProps {
  ticket: TicketData;
  variant?: 'default' | 'compact' | 'qr';
  showActions?: boolean;
  onShowQR?: (ticket: TicketData) => void;
  onDownload?: (ticket: TicketData) => void;
  onCancel?: (ticket: TicketData) => void;
  className?: string;
}

export default function TicketCard({
  ticket,
  variant = 'default',
  showActions = true,
  onShowQR,
  onDownload,
  onCancel,
  className
}: TicketCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">有効</Badge>;
      case 'used':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">使用済み</Badge>;
      case 'expired':
        return <Badge variant="destructive">期限切れ</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">キャンセル済み</Badge>;
      default:
        return <Badge variant="secondary">不明</Badge>;
    }
  };

  // QRコードデータの生成
  const qrData = generateQRData(ticket.id, ticket.eventId, ticket.userId);
  const qrCodeValue = encodeQRData(qrData);

  if (variant === 'compact') {
    return (
      <Card className={cn('p-4', className)}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{ticket.eventTitle}</h4>
            <p className="text-sm text-gray-600">{formatDate(ticket.eventDate)}</p>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(ticket.status)}
            <span className="text-lg font-bold text-blue-600">
              {formatPrice(ticket.price)}
            </span>
          </div>
        </div>
      </Card>
    );
  }

  if (variant === 'qr') {
    return (
      <Card className={cn('p-6 text-center', className)}>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{ticket.eventTitle}</h3>
            <p className="text-gray-600">{ticket.ticketType}</p>
          </div>
          
          {/* QRコード表示 */}
          <div className="flex justify-center">
            <QRCodeDisplay
              value={qrCodeValue}
              size={200}
              showBorder={false}
              className="w-48 h-48"
            />
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <p><i className="ri-calendar-line mr-2"></i>
              {formatDate(ticket.eventDate)}
              {ticket.eventTime && ` ${ticket.eventTime}`}
            </p>
            <p><i className="ri-map-pin-line mr-2"></i>{ticket.venue}</p>
            {ticket.seatInfo && (
              <p><i className="ri-reserved-line mr-2"></i>{ticket.seatInfo}</p>
            )}
            {ticket.quantity > 1 && (
              <p><i className="ri-ticket-2-line mr-2"></i>枚数: {ticket.quantity}枚</p>
            )}
            <p><i className="ri-ticket-line mr-2"></i>チケットID: {ticket.id}</p>
          </div>
          
          <div className="pt-4">
            {getStatusBadge(ticket.status)}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {ticket.eventTitle}
            </h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><i className="ri-calendar-line mr-2"></i>{formatDate(ticket.eventDate)}</p>
              <p><i className="ri-map-pin-line mr-2"></i>{ticket.venue}</p>
              <p><i className="ri-ticket-2-line mr-2"></i>{ticket.ticketType}</p>
              {ticket.seatInfo && (
                <p><i className="ri-reserved-line mr-2"></i>{ticket.seatInfo}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            {getStatusBadge(ticket.status)}
            <div className="mt-2">
              <span className="text-2xl font-bold text-blue-600">
                {formatPrice(ticket.price)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <span>購入日: {formatDate(ticket.purchaseDate)}</span>
            <span>チケットID: {ticket.id}</span>
          </div>
          
          {showActions && (
            <div className="flex items-center space-x-2">
              {ticket.status === 'active' && (
                <>
                  <Button 
                    size="sm" 
                    onClick={() => onShowQR?.(ticket)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <i className="ri-qr-code-line mr-2"></i>
                    QRコード表示
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onDownload?.(ticket)}
                  >
                    <i className="ri-download-line mr-2"></i>
                    ダウンロード
                  </Button>
                </>
              )}
              
              {ticket.status === 'used' && (
                <Button variant="outline" size="sm" disabled>
                  <i className="ri-check-line mr-2"></i>
                  使用済み
                </Button>
              )}
              
              {(ticket.status === 'active' || ticket.status === 'expired') && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onCancel?.(ticket)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <i className="ri-close-line mr-2"></i>
                  キャンセル
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}