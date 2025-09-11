'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { decodeQRData, verifyQRSignature } from '@/lib/qr-generator';
import { TicketScanResult } from '@/types/ticket';

interface QRCodeScannerProps {
  onScanSuccess: (result: TicketScanResult) => void;
  onError?: (error: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _onErrorExample = (error: string) => console.error(error);

export default function QRCodeScanner({ onScanSuccess }: QRCodeScannerProps) {
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<TicketScanResult | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      // クリーンアップ
      if (scanner) {
        scanner.clear();
      }
    };
  }, [scanner]);

  const startScanning = () => {
    if (scannerRef.current && !isScanning) {
      const qrcodeScanner = new Html5QrcodeScanner(
        'qr-scanner-container',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 2
        },
        false
      );

      qrcodeScanner.render(
        (decodedText: string) => {
          // スキャン成功
          handleScanSuccess(decodedText);
        },
        (error: string) => {
          // スキャンエラー（通常は無視）
          console.debug('QR scan error:', error);
        }
      );

      setScanner(qrcodeScanner);
      setIsScanning(true);
    }
  };

  const stopScanning = () => {
    if (scanner) {
      scanner.clear();
      setScanner(null);
      setIsScanning(false);
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    // QRコードデータをデコード・検証
    const qrData = decodeQRData(decodedText);
    
    if (!qrData) {
      const errorResult: TicketScanResult = {
        success: false,
        message: '無効なQRコードです',
        scanTime: new Date().toISOString(),
        status: 'invalid'
      };
      setLastScanResult(errorResult);
      onScanSuccess(errorResult);
      return;
    }

    // 署名検証
    if (!verifyQRSignature(qrData)) {
      const errorResult: TicketScanResult = {
        success: false,
        message: 'QRコードの署名が無効です',
        scanTime: new Date().toISOString(),
        status: 'invalid'
      };
      setLastScanResult(errorResult);
      onScanSuccess(errorResult);
      return;
    }

    // モックデータでチケット情報を返す（実際の実装ではAPIを呼び出し）
    const mockTicket = {
      id: qrData.ticketId,
      eventId: qrData.eventId,
      userId: qrData.userId,
      eventTitle: '東京国際展示会2024',
      eventDate: '2024-03-15',
      eventTime: '10:00 - 18:00',
      venue: '東京ビッグサイト',
      ticketType: '一般入場券',
      price: 3000,
      quantity: 1,
      purchaseDate: '2024-02-01',
      status: 'active' as const,
      customerName: '田中太郎',
      customerEmail: 'tanaka@example.com',
      orderNumber: 'ORDER-12345678',
      createdAt: '2024-02-01T10:00:00Z',
      updatedAt: '2024-02-01T10:00:00Z'
    };

    const successResult: TicketScanResult = {
      success: true,
      message: 'チケットの検証に成功しました',
      scanTime: new Date().toISOString(),
      status: 'valid',
      ticket: mockTicket
    };

    setLastScanResult(successResult);
    onScanSuccess(successResult);
  };

  const handleManualInput = () => {
    const input = prompt('QRコードの内容を手動で入力してください:');
    if (input) {
      handleScanSuccess(input);
    }
  };

  return (
    <div className="space-y-6">
      {/* スキャナー制御 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">QRコードスキャナー</h3>
          <div className="flex space-x-2">
            <Button
              onClick={isScanning ? stopScanning : startScanning}
              variant={isScanning ? "destructive" : "default"}
            >
              {isScanning ? (
                <>
                  <i className="ri-stop-line mr-2"></i>
                  スキャン停止
                </>
              ) : (
                <>
                  <i className="ri-qr-scan-2-line mr-2"></i>
                  スキャン開始
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleManualInput}>
              <i className="ri-keyboard-line mr-2"></i>
              手動入力
            </Button>
          </div>
        </div>

        {/* スキャナー表示エリア */}
        <div className="relative">
          {!isScanning && (
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <i className="ri-qr-scan-2-line text-6xl mb-4"></i>
                <p className="text-lg font-medium mb-2">QRコードをスキャン</p>
                <p className="text-sm">「スキャン開始」ボタンをクリックしてください</p>
              </div>
            </div>
          )}
          <div
            id="qr-scanner-container"
            ref={scannerRef}
            className={`${isScanning ? 'block' : 'hidden'}`}
          />
        </div>
      </Card>

      {/* スキャン結果表示 */}
      {lastScanResult && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">スキャン結果</h3>
          
          <div className={`border-2 rounded-lg p-4 mb-4 ${
            lastScanResult.success 
              ? 'border-green-200 bg-green-50' 
              : 'border-red-200 bg-red-50'
          }`}>
            <div className="flex items-center mb-2">
              <i className={`text-xl mr-2 ${
                lastScanResult.success ? 'ri-check-line text-green-600' : 'ri-close-line text-red-600'
              }`}></i>
              <Badge className={
                lastScanResult.success 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }>
                {lastScanResult.status === 'valid' ? '有効' : '無効'}
              </Badge>
            </div>
            <p className={
              lastScanResult.success ? 'text-green-800' : 'text-red-800'
            }>
              {lastScanResult.message}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              スキャン時刻: {new Date(lastScanResult.scanTime).toLocaleString('ja-JP')}
            </p>
          </div>

          {/* チケット詳細表示 */}
          {lastScanResult.ticket && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">チケット詳細</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">イベント:</span>
                  <span className="font-medium">{lastScanResult.ticket.eventTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">お客様名:</span>
                  <span className="font-medium">{lastScanResult.ticket.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">チケット種類:</span>
                  <span className="font-medium">{lastScanResult.ticket.ticketType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">枚数:</span>
                  <span className="font-medium">{lastScanResult.ticket.quantity}枚</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">開催日時:</span>
                  <span className="font-medium">
                    {lastScanResult.ticket.eventDate} {lastScanResult.ticket.eventTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">会場:</span>
                  <span className="font-medium">{lastScanResult.ticket.venue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">チケットID:</span>
                  <span className="font-mono text-xs">{lastScanResult.ticket.id}</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}