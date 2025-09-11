import { NextRequest, NextResponse } from 'next/server';
import { decodeQRData, verifyQRSignature, isQRExpired } from '@/lib/qr-generator';

export async function POST(request: NextRequest) {
  try {
    const { qrCodeData, markAsUsed = false } = await request.json();

    if (!qrCodeData) {
      return NextResponse.json(
        { success: false, message: 'QRコードデータが必要です' },
        { status: 400 }
      );
    }

    // QRコードデータのデコード
    const qrData = decodeQRData(qrCodeData);
    if (!qrData) {
      return NextResponse.json({
        success: false,
        message: '無効なQRコードです',
        status: 'invalid',
        scanTime: new Date().toISOString()
      });
    }

    // 署名検証
    if (!verifyQRSignature(qrData)) {
      return NextResponse.json({
        success: false,
        message: 'QRコードの署名が無効です',
        status: 'invalid',
        scanTime: new Date().toISOString()
      });
    }

    // 期限チェック
    if (isQRExpired(qrData.timestamp)) {
      return NextResponse.json({
        success: false,
        message: 'QRコードの有効期限が切れています',
        status: 'expired',
        scanTime: new Date().toISOString()
      });
    }

    // データベースからチケット情報を取得（モック実装）
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ticket = await getTicketFromDatabase(qrData.ticketId) as any;
    
    if (!ticket) {
      return NextResponse.json({
        success: false,
        message: 'チケットが見つかりません',
        status: 'invalid',
        scanTime: new Date().toISOString()
      });
    }

    // チケットの状態チェック
    if (ticket.status === 'used') {
      return NextResponse.json({
        success: false,
        message: 'このチケットは既に使用済みです',
        status: 'used',
        scanTime: new Date().toISOString(),
        ticket
      });
    }

    if (ticket.status === 'cancelled') {
      return NextResponse.json({
        success: false,
        message: 'このチケットはキャンセル済みです',
        status: 'invalid',
        scanTime: new Date().toISOString(),
        ticket
      });
    }

    if (ticket.status === 'expired') {
      return NextResponse.json({
        success: false,
        message: 'このチケットは期限切れです',
        status: 'expired',
        scanTime: new Date().toISOString(),
        ticket
      });
    }

    // 使用済みとしてマーク
    if (markAsUsed && ticket.status === 'active') {
      await markTicketAsUsed(ticket.id);
      ticket.status = 'used';
      ticket.updatedAt = new Date().toISOString();
    }

    // 成功レスポンス
    return NextResponse.json({
      success: true,
      message: markAsUsed ? 'チケットが使用済みとしてマークされました' : 'チケットの検証に成功しました',
      status: markAsUsed ? 'used' : 'valid',
      scanTime: new Date().toISOString(),
      ticket
    });

  } catch (error) {
    console.error('Ticket verification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'サーバーエラーが発生しました',
        status: 'error',
        scanTime: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * データベースからチケット情報を取得（モック実装）
 */
async function getTicketFromDatabase(ticketId: string) {
  // 実際の実装ではSupabaseなどのデータベースから取得
  const mockTickets: Record<string, unknown> = {
    'ticket-001': {
      id: 'ticket-001',
      eventId: 'event-001',
      userId: 'user-001',
      eventTitle: '東京国際展示会2024',
      eventDescription: '最新のテクノロジーとイノベーションを体験できる展示会',
      eventDate: '2024-03-15',
      eventTime: '10:00 - 18:00',
      venue: '東京ビッグサイト',
      ticketType: '一般入場券',
      price: 3000,
      quantity: 1,
      purchaseDate: '2024-02-01',
      status: 'active',
      customerName: '田中太郎',
      customerEmail: 'tanaka@example.com',
      orderNumber: 'ORDER-12345678',
      createdAt: '2024-02-01T10:00:00Z',
      updatedAt: '2024-02-01T10:00:00Z'
    },
    'ticket-002': {
      id: 'ticket-002',
      eventId: 'event-002',
      userId: 'user-001',
      eventTitle: 'ホテル春の特別ディナー',
      eventDescription: 'シェフ特製のコースディナーをお楽しみください',
      eventDate: '2024-03-20',
      eventTime: '19:00 - 22:00',
      venue: 'グランドホテル東京',
      ticketType: 'ワインペアリングコース',
      price: 12000,
      quantity: 1,
      purchaseDate: '2024-02-05',
      status: 'active',
      customerName: '田中太郎',
      customerEmail: 'tanaka@example.com',
      orderNumber: 'ORDER-12345679',
      createdAt: '2024-02-05T10:00:00Z',
      updatedAt: '2024-02-05T10:00:00Z'
    },
    'ticket-003': {
      id: 'ticket-003',
      eventId: 'event-003',
      userId: 'user-001',
      eventTitle: '冬のアートフェスティバル2024',
      eventDescription: '現代アート作品の展示とパフォーマンス',
      eventDate: '2024-01-15',
      eventTime: '11:00 - 19:00',
      venue: '六本木アートセンター',
      ticketType: '一般入場券',
      price: 2500,
      quantity: 1,
      purchaseDate: '2024-01-01',
      status: 'used',
      customerName: '田中太郎',
      customerEmail: 'tanaka@example.com',
      orderNumber: 'ORDER-12345677',
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-15T11:30:00Z'
    }
  };

  return mockTickets[ticketId] || null;
}

/**
 * チケットを使用済みとしてマーク（モック実装）
 */
async function markTicketAsUsed(ticketId: string) {
  // 実際の実装ではデータベースを更新
  console.log(`Marking ticket ${ticketId} as used`);
  
  // 使用履歴を記録
  const usageRecord = {
    id: `usage-${Date.now()}`,
    ticketId,
    scanTime: new Date().toISOString(),
    scanLocation: 'Main Entrance',
    scannedBy: 'admin-001',
    deviceInfo: 'Admin Scanner Device',
    verificationMethod: 'qr',
    notes: 'Ticket scanned successfully'
  };
  
  // 実際の実装では使用履歴をデータベースに保存
  console.log('Usage record:', usageRecord);
  
  return usageRecord;
}