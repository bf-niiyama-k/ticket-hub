
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function QRScanner() {
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanHistory, setScanHistory] = useState([
    {id: 1, ticketId: 'QR-123456', customerName: '田中太郎', eventTitle: '春のコンサート2024', scanTime: '2024-03-15 19:30', status: 'valid'},
    {id: 2, ticketId: 'QR-123457', customerName: '佐藤花子', eventTitle: '夏祭り2024', scanTime: '2024-03-15 18:45', status: 'valid'},
    {id: 3, ticketId: 'QR-123458', customerName: '山田次郎', eventTitle: 'ビジネスセミナー', scanTime: '2024-03-15 10:15', status: 'used'}
  ]);
  const [manualInput, setManualInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const mockTickets = {
    'QR-123456': {
      ticketId: 'QR-123456',
      customerName: '田中太郎',
      customerEmail: 'tanaka@example.com',
      eventTitle: '春のコンサート2024',
      ticketType: 'VIPチケット',
      quantity: 2,
      eventDate: '2024-04-15',
      eventTime: '19:00',
      venue: 'メインホール',
      isUsed: false,
      purchaseDate: '2024-03-01'
    },
    'QR-123457': {
      ticketId: 'QR-123457',
      customerName: '佐藤花子',
      customerEmail: 'sato@example.com',
      eventTitle: '夏祭り2024',
      ticketType: '一般チケット',
      quantity: 1,
      eventDate: '2024-07-15',
      eventTime: '18:00',
      venue: '野外ステージ',
      isUsed: false,
      purchaseDate: '2024-02-15'
    },
    'QR-123458': {
      ticketId: 'QR-123458',
      customerName: '山田次郎',
      customerEmail: 'yamada@example.com',
      eventTitle: 'ビジネスセミナー',
      ticketType: '一般チケット',
      quantity: 1,
      eventDate: '2024-04-20',
      eventTime: '10:00',
      venue: '会議室A',
      isUsed: true,
      purchaseDate: '2024-01-20'
    }
  };

  const handleScan = (qrCode: string) => {
    const ticket = mockTickets[qrCode as keyof typeof mockTickets];
    
    if (!ticket) {
      setScanResult({
        status: 'invalid',
        message: '無効なQRコードです',
        timestamp: new Date().toLocaleString('ja-JP')
      });
      return;
    }

    if (ticket.isUsed) {
      setScanResult({
        status: 'used',
        message: 'このチケットは既に使用済みです',
        ticket,
        timestamp: new Date().toLocaleString('ja-JP')
      });
      return;
    }

    setScanResult({
      status: 'valid',
      message: 'チケットが確認されました',
      ticket,
      timestamp: new Date().toLocaleString('ja-JP')
    });
  };

  const handleManualScan = () => {
    if (manualInput.trim()) {
      handleScan(manualInput.trim());
      setManualInput('');
    }
  };

  const markAsUsed = () => {
    if (scanResult && scanResult.ticket) {
      // 実際の実装では、ここでデータベースを更新
      const newScan = {
        id: scanHistory.length + 1,
        ticketId: scanResult.ticket.ticketId,
        customerName: scanResult.ticket.customerName,
        eventTitle: scanResult.ticket.eventTitle,
        scanTime: new Date().toLocaleString('ja-JP'),
        status: 'valid'
      };
      
      setScanHistory([newScan, ...scanHistory]);
      setScanResult({
        ...scanResult,
        status: 'confirmed',
        message: 'チケットが使用済みとしてマークされました'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'used':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'invalid':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'valid':
        return '有効';
      case 'used':
        return '使用済み';
      case 'invalid':
        return '無効';
      case 'confirmed':
        return '確認済み';
      default:
        return '不明';
    }
  };

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
            {/* カメラスキャン */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">カメラでスキャン</h2>
              
              <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                {isScanning ? (
                  <div className="text-center">
                    <div className="w-48 h-48 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center mb-4">
                      <i className="ri-camera-line text-4xl text-blue-400"></i>
                    </div>
                    <p className="text-sm text-gray-600">QRコードをカメラに向けてください</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <i className="ri-qr-scan-2-line text-6xl text-gray-400 mb-4"></i>
                    <p className="text-gray-600 mb-4">カメラでQRコードをスキャンします</p>
                    <button
                      onClick={() => setIsScanning(true)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                      スキャン開始
                    </button>
                  </div>
                )}
              </div>
              
              {isScanning && (
                <div className="flex justify-center">
                  <button
                    onClick={() => setIsScanning(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap"
                  >
                    スキャン停止
                  </button>
                </div>
              )}
            </div>

            {/* 手動入力 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">手動入力</h2>
              
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualScan()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="QRコードを入力してください (例: QR-123456)"
                />
                <button
                  onClick={handleManualScan}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  確認
                </button>
              </div>
              
              {/* テスト用サンプルQRコード */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">テスト用QRコード:</p>
                <div className="space-y-1">
                  <button 
                    onClick={() => setManualInput('QR-123456')}
                    className="block text-sm text-blue-600 hover:text-blue-800"
                  >
                    QR-123456 (有効チケット)
                  </button>
                  <button 
                    onClick={() => setManualInput('QR-123457')}
                    className="block text-sm text-blue-600 hover:text-blue-800"
                  >
                    QR-123457 (有効チケット)
                  </button>
                  <button 
                    onClick={() => setManualInput('QR-123458')}
                    className="block text-sm text-blue-600 hover:text-blue-800"
                  >
                    QR-123458 (使用済みチケット)
                  </button>
                  <button 
                    onClick={() => setManualInput('QR-invalid')}
                    className="block text-sm text-blue-600 hover:text-blue-800"
                  >
                    QR-invalid (無効チケット)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 結果表示部分 */}
          <div className="space-y-6">
            {/* スキャン結果 */}
            {scanResult && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">スキャン結果</h2>
                
                <div className={`border-2 rounded-lg p-4 mb-4 ${getStatusColor(scanResult.status)}`}>
                  <div className="flex items-center mb-2">
                    <i className={`text-xl mr-2 w-6 h-6 flex items-center justify-center ${
                      scanResult.status === 'valid' || scanResult.status === 'confirmed' ? 'ri-check-line' :
                      scanResult.status === 'used' ? 'ri-time-line' : 'ri-close-line'
                    }`}></i>
                    <span className="font-semibold">{getStatusText(scanResult.status)}</span>
                  </div>
                  <p className="text-sm">{scanResult.message}</p>
                  <p className="text-xs mt-2 opacity-75">{scanResult.timestamp}</p>
                </div>
                
                {scanResult.ticket && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">チケット詳細</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">チケットID:</span>
                        <span className="font-medium">{scanResult.ticket.ticketId}</span>
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
                    
                    {scanResult.status === 'valid' && (
                      <button
                        onClick={markAsUsed}
                        className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                      >
                        入場を許可する
                      </button>
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
