'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import QRCodeDisplay from './QRCodeDisplay';
import { Ticket } from '@/types/ticket';
import { generateQRData, encodeQRData } from '@/lib/qr-generator';
import { formatDate } from '@/lib/utils';

interface QRCodeModalProps {
  ticket: Ticket;
  isOpen: boolean;
  onClose: () => void;
}

export default function QRCodeModal({ ticket, isOpen, onClose }: QRCodeModalProps) {
  // QRコードデータの生成
  const qrData = generateQRData(ticket.id, ticket.eventId, ticket.userId);
  const qrCodeValue = encodeQRData(qrData);

  const handleDownload = () => {
    console.log('QR code downloaded for ticket:', ticket.id);
  };

  const handleAddToCalendar = () => {
    const eventTitle = ticket.eventTitle;
    const eventDate = new Date(ticket.eventDate);
    const venue = ticket.venue;
    
    // Google Calendarへのリンクを生成
    const startTime = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endTime = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startTime}/${endTime}&location=${encodeURIComponent(venue)}&details=${encodeURIComponent(`チケット種類: ${ticket.ticketType}\nチケット番号: ${ticket.id}`)}`;
    
    window.open(calendarUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">チケットQRコード</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* イベント基本情報 */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">{ticket.eventTitle}</h3>
            <Badge 
              className={
                ticket.status === 'active' ? 'bg-green-100 text-green-800' :
                ticket.status === 'used' ? 'bg-gray-100 text-gray-800' :
                'bg-red-100 text-red-800'
              }
            >
              {ticket.status === 'active' ? '有効' :
               ticket.status === 'used' ? '使用済み' :
               ticket.status === 'expired' ? '期限切れ' : 'キャンセル済み'}
            </Badge>
          </div>

          {/* QRコード表示 */}
          <div className="flex justify-center">
            <QRCodeDisplay
              value={qrCodeValue}
              size={200}
              showBorder={true}
              onDownload={handleDownload}
            />
          </div>

          {/* チケット詳細 */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">チケット種類:</span>
              <span className="font-medium">{ticket.ticketType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">枚数:</span>
              <span className="font-medium">{ticket.quantity}枚</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">日時:</span>
              <span className="font-medium">
                {formatDate(ticket.eventDate)} {ticket.eventTime}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">会場:</span>
              <span className="font-medium">{ticket.venue}</span>
            </div>
            {ticket.seatInfo && (
              <div className="flex justify-between">
                <span className="text-gray-600">座席:</span>
                <span className="font-medium">{ticket.seatInfo}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">チケット番号:</span>
              <span className="font-mono text-xs">{ticket.id}</span>
            </div>
          </div>

          {/* アクションボタン */}
          {ticket.status === 'active' && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddToCalendar}
                className="flex-1"
              >
                <i className="ri-calendar-line mr-2"></i>
                カレンダーに追加
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.share?.({
                    title: ticket.eventTitle,
                    text: `${ticket.eventTitle}のチケットです`,
                    url: window.location.href
                  });
                }}
                className="flex-1"
              >
                <i className="ri-share-line mr-2"></i>
                共有
              </Button>
            </div>
          )}

          {/* 注意事項 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              <i className="ri-information-line mr-1"></i>
              利用時の注意事項
            </h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• 入場時にこのQRコードを提示してください</li>
              <li>• 身分証明書もご持参ください</li>
              <li>• スクリーンショット保存も利用可能です</li>
              <li>• 転売・譲渡は禁止されています</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}