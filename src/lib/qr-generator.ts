import { createHash } from 'crypto';

export interface QRTicketData {
  ticketId: string;
  eventId: string;
  userId: string;
  timestamp: number;
  signature: string;
}

export interface TicketValidationData {
  ticketId: string;
  eventId: string;
  isValid: boolean;
  isUsed: boolean;
  message: string;
  ticket?: {
    id: string;
    eventTitle: string;
    customerName: string;
    customerEmail: string;
    ticketType: string;
    quantity: number;
    eventDate: string;
    eventTime: string;
    venue: string;
    purchaseDate: string;
  };
}

const QR_SECRET = process.env.QR_SECRET || 'default-secret-key-change-in-production';

/**
 * QRコードのセキュリティ署名を生成
 */
export function generateQRSignature(data: {
  ticketId: string;
  eventId: string;
  userId: string;
  timestamp: number;
}): string {
  const payload = `${data.ticketId}:${data.eventId}:${data.userId}:${data.timestamp}`;
  return createHash('sha256')
    .update(payload + QR_SECRET)
    .digest('hex')
    .substring(0, 16);
}

/**
 * QRコード用データの生成
 */
export function generateQRData(
  ticketId: string,
  eventId: string,
  userId: string
): QRTicketData {
  const timestamp = Date.now();
  const signature = generateQRSignature({
    ticketId,
    eventId,
    userId,
    timestamp
  });

  return {
    ticketId,
    eventId,
    userId,
    timestamp,
    signature
  };
}

/**
 * QRコードのJSONデータをエンコード
 */
export function encodeQRData(qrData: QRTicketData): string {
  return JSON.stringify(qrData);
}

/**
 * QRコードのデータをデコード・検証
 */
export function decodeQRData(qrString: string): QRTicketData | null {
  try {
    const data = JSON.parse(qrString) as QRTicketData;
    
    // データ形式の検証
    if (!data.ticketId || !data.eventId || !data.userId || !data.timestamp || !data.signature) {
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('QR code decode error:', error);
    return null;
  }
}

/**
 * QRコードの署名を検証
 */
export function verifyQRSignature(qrData: QRTicketData): boolean {
  const expectedSignature = generateQRSignature({
    ticketId: qrData.ticketId,
    eventId: qrData.eventId,
    userId: qrData.userId,
    timestamp: qrData.timestamp
  });
  
  return qrData.signature === expectedSignature;
}

/**
 * チケットの有効期限チェック（24時間）
 */
export function isQRExpired(timestamp: number): boolean {
  const now = Date.now();
  const expiration = 24 * 60 * 60 * 1000; // 24時間
  return (now - timestamp) > expiration;
}

/**
 * 短縮QRコード文字列の生成（手動入力用）
 */
export function generateShortQRCode(ticketId: string): string {
  const hash = createHash('md5')
    .update(ticketId + QR_SECRET)
    .digest('hex')
    .substring(0, 8)
    .toUpperCase();
  
  return `TH-${hash}`;
}

/**
 * 短縮QRコードからチケットIDの逆引き（仮実装）
 */
export function resolveShortQRCode(shortCode: string, ticketId: string): boolean {
  const expectedCode = generateShortQRCode(ticketId);
  return shortCode === expectedCode;
}

/**
 * QRコード生成オプション
 */
export const QR_CODE_OPTIONS = {
  size: 200,
  level: 'M' as const,
  includeMargin: true,
  bgColor: '#FFFFFF',
  fgColor: '#000000'
};

/**
 * PDF用QRコードオプション
 */
export const PDF_QR_OPTIONS = {
  size: 150,
  level: 'H' as const,
  includeMargin: true,
  bgColor: '#FFFFFF',
  fgColor: '#000000'
};