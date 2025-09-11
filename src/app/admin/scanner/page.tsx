
'use client';

import { useState } from 'react';
import Link from 'next/link';
import QRCodeScanner from '../../../components/ticket/QRCodeScanner';
import { TicketScanResult } from '../../../types/ticket';

// interface Ticket {
//   ticketId: string;
//   customerName: string;
//   customerEmail: string;
//   eventTitle: string;
//   ticketType: string;
//   quantity: number;
//   eventDate: string;
//   eventTime: string;
//   venue: string;
//   isUsed: boolean;
//   purchaseDate: string;
// }

// interface ScanResult {
//   ticketId?: string;
//   customerName?: string;
//   eventTitle?: string;
//   scanTime?: string;
//   status: 'valid' | 'invalid' | 'used' | 'confirmed';
//   message?: string;
//   timestamp?: string;
//   ticket?: Ticket;
// }

interface ScanHistoryItem {
  id: number;
  ticketId: string;
  customerName: string;
  eventTitle: string;
  scanTime: string;
  status: 'valid' | 'invalid' | 'used';
}

export default function QRScanner() {
  const [scanResult, setScanResult] = useState<TicketScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([
    {id: 1, ticketId: 'ticket-001', customerName: '田中太郎', eventTitle: '春のコンサート2024', scanTime: '2024-03-15 19:30', status: 'valid'},
    {id: 2, ticketId: 'ticket-002', customerName: '佐藤花子', eventTitle: '夏祭り2024', scanTime: '2024-03-15 18:45', status: 'valid'},
    {id: 3, ticketId: 'ticket-003', customerName: '山田次郎', eventTitle: 'ビジネスセミナー', scanTime: '2024-03-15 10:15', status: 'used'}
  ]);
  const [isConfirming, setIsConfirming] = useState(false);

  // const mockTickets: Record<string, Ticket> = {
  //   'QR-123456': {
  //     ticketId: 'QR-123456',
  //     customerName: '田中太郎',
  //     customerEmail: 'tanaka@example.com',
  //     eventTitle: '春のコンサート2024',
  //     ticketType: 'VIPチケット',
  //     quantity: 2,
  //     eventDate: '2024-04-15',
  //     eventTime: '19:00',
  //     venue: 'メインホール',
  //     isUsed: false,
  //     purchaseDate: '2024-03-01'
  //   },
  //   'QR-123457': {
  //     ticketId: 'QR-123457',
  //     customerName: '佐藤花子',
  //     customerEmail: 'sato@example.com',
  //     eventTitle: '夏祭り2024',
  //     ticketType: '一般チケット',
  //     quantity: 1,
  //     eventDate: '2024-07-15',
  //     eventTime: '18:00',
  //     venue: '野外ステージ',
  //     isUsed: false,
  //     purchaseDate: '2024-02-15'
  //   },
  //   'QR-123458': {
  //     ticketId: 'QR-123458',
  //     customerName: '山田次郎',
  //     customerEmail: 'yamada@example.com',
  //     eventTitle: 'ビジネスセミナー',
  //     ticketType: '一般チケット',
  //     quantity: 1,
  //     eventDate: '2024-04-20',
  //     eventTime: '10:00',
  //     venue: '会議室A',
  //     isUsed: true,
  //     purchaseDate: '2024-01-20'
  //   }
  // };

  const handleScanSuccess = (result: TicketScanResult) => {
    setScanResult(result);
    
    if (result.success && result.ticket) {
      // スキャン履歴に追加
      const newScan = {
        id: scanHistory.length + 1,
        ticketId: result.ticket.id,
        customerName: result.ticket.customerName,
        eventTitle: result.ticket.eventTitle,
        scanTime: new Date(result.scanTime).toLocaleString('ja-JP'),
        status: 'valid' as const
      };
      
      setScanHistory([newScan, ...scanHistory.slice(0, 9)]); // 最新10件のみ保持
    }
  };

  const markAsUsed = () => {
    if (scanResult && scanResult.ticket && scanResult.success) {
      setIsConfirming(true);
      
      // 実際の実装では、ここでAPIを呼び出してチケットを使用済みにマーク
      setTimeout(() => {
        setScanResult({
          ...scanResult,
          status: 'used',
          message: 'チケットが使用済みとしてマークされました'
        });
        setIsConfirming(false);
      }, 1000);
    }
  };

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'valid':
  //       return 'bg-green-100 text-green-800 border-green-200';
  //     case 'used':
  //       return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  //     case 'invalid':
  //       return 'bg-red-100 text-red-800 border-red-200';
  //     case 'confirmed':
  //       return 'bg-blue-100 text-blue-800 border-blue-200';
  //     default:
  //       return 'bg-gray-100 text-gray-800 border-gray-200';
  //   }
  // };

  // const getStatusText = (status: string) => {
  //   switch (status) {
  //     case 'valid':
  //       return '有効';
  //     case 'used':
  //       return '使用済み';
  //     case 'invalid':
  //       return '無効';
  //     case 'confirmed':
  //       return '確認済み';
  //     default:
  //       return '不明';
  //   }
  // };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="ri-arrow-left-line text-gray-600 text-xl w-5 h-5 flex items-center justify-center"></i>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">QRコード照合</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* スキャン部分 */}
          <div className="space-y-6">
            <QRCodeScanner 
              onScanSuccess={handleScanSuccess}
              onError={(error) => console.error('Scanner error:', error)}
            />
          </div>

          {/* 結果表示部分 */}
          <div className="space-y-6">
            {/* スキャン結果 */}
            {scanResult && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">スキャン結果</h2>
                
                <div className={`border-2 rounded-lg p-4 mb-4 ${
                  scanResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-center mb-2">
                    <i className={`text-xl mr-2 w-6 h-6 flex items-center justify-center ${
                      scanResult.success ? 'ri-check-line text-green-600' : 'ri-close-line text-red-600'
                    }`}></i>
                    <span className="font-semibold text-sm">
                      {scanResult.status === 'valid' ? '有効なチケット' :
                       scanResult.status === 'used' ? '使用済みチケット' :
                       scanResult.status === 'invalid' ? '無効なチケット' : 'その他'}
                    </span>
                  </div>
                  <p className={`text-sm ${scanResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {scanResult.message}
                  </p>
                  <p className="text-xs mt-2 opacity-75">
                    スキャン時刻: {new Date(scanResult.scanTime).toLocaleString('ja-JP')}
                  </p>
                </div>
                
                {scanResult.ticket && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">チケット詳細</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">チケットID:</span>
                        <span className="font-medium">{scanResult.ticket.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">お客様名:</span>
                        <span className="font-medium">{scanResult.ticket.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">イベント:</span>
                        <span className="font-medium">{scanResult.ticket.eventTitle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">チケット種類:</span>
                        <span className="font-medium">{scanResult.ticket.ticketType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">枚数:</span>
                        <span className="font-medium">{scanResult.ticket.quantity}枚</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">イベント日時:</span>
                        <span className="font-medium">{scanResult.ticket.eventDate} {scanResult.ticket.eventTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">会場:</span>
                        <span className="font-medium">{scanResult.ticket.venue}</span>
                      </div>
                    </div>
                    
                    {scanResult.status === 'valid' && scanResult.success && (
                      <button
                        onClick={markAsUsed}
                        disabled={isConfirming}
                        className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap disabled:bg-gray-400"
                      >
                        {isConfirming ? (
                          <>
                            <i className="ri-loader-4-line mr-2 animate-spin"></i>
                            処理中...
                          </>
                        ) : (
                          '入場を許可する'
                        )}
                      </button>
                    )}
                    
                    {scanResult.status === 'used' && (
                      <div className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-center">
                        <i className="ri-check-line mr-2"></i>
                        入場済み
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* スキャン履歴 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">スキャン履歴</h2>
              
              <div className="space-y-3">
                {scanHistory.map((scan) => (
                  <div key={scan.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{scan.customerName}</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            scan.status === 'valid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {scan.status === 'valid' ? '入場許可' : '使用済み'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{scan.eventTitle}</p>
                        <p className="text-xs text-gray-500">{scan.scanTime}</p>
                      </div>
                      <div className="text-xs text-gray-500">{scan.ticketId}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
