import jsPDF from 'jspdf';
import { Ticket } from '@/types/ticket';
import { generateQRData, encodeQRData, PDF_QR_OPTIONS } from './qr-generator';
import { formatDate } from './utils';

/**
 * チケットPDFを生成する
 */
export async function generateTicketPDF(ticket: Ticket): Promise<void> {
  const pdf = new jsPDF();
  
  // QRコードデータの生成
  const qrData = generateQRData(ticket.id, ticket.eventId, ticket.userId);
  const qrCodeValue = encodeQRData(qrData);
  
  // フォント設定（日本語対応）
  pdf.setFont('helvetica', 'normal');
  
  // ヘッダー
  pdf.setFontSize(20);
  pdf.text('入場チケット', 20, 20);
  
  // 線を引く
  pdf.setLineWidth(0.5);
  pdf.line(20, 25, 190, 25);
  
  // イベント情報
  pdf.setFontSize(16);
  pdf.text(ticket.eventTitle, 20, 40);
  
  pdf.setFontSize(12);
  pdf.text(`チケット種類: ${ticket.ticketType}`, 20, 50);
  pdf.text(`枚数: ${ticket.quantity}枚`, 20, 60);
  pdf.text(`価格: ¥${ticket.price.toLocaleString()}`, 20, 70);
  
  // イベント詳細
  pdf.text(`開催日: ${formatDate(ticket.eventDate)}`, 20, 85);
  pdf.text(`時間: ${ticket.eventTime}`, 20, 95);
  pdf.text(`会場: ${ticket.venue}`, 20, 105);
  
  if (ticket.seatInfo) {
    pdf.text(`座席: ${ticket.seatInfo}`, 20, 115);
  }
  
  // 購入者情報
  pdf.text(`購入者: ${ticket.customerName}`, 20, 130);
  pdf.text(`注文番号: ${ticket.orderNumber}`, 20, 140);
  pdf.text(`購入日: ${formatDate(ticket.purchaseDate)}`, 20, 150);
  
  // チケットID
  pdf.setFontSize(10);
  pdf.text(`チケットID: ${ticket.id}`, 20, 165);
  
  // QRコード生成（canvasを使用）
  try {
    const qrCodeDataURL = await generateQRCodeDataURL(qrCodeValue, PDF_QR_OPTIONS.size);
    
    if (qrCodeDataURL) {
      // QRコードを右側に配置
      pdf.addImage(qrCodeDataURL, 'PNG', 130, 40, 50, 50);
      pdf.setFontSize(8);
      pdf.text('入場時にスキャンしてください', 130, 100);
    }
  } catch (error) {
    console.error('QR code generation failed:', error);
    // QRコード生成に失敗した場合はテキストで代替
    pdf.setFontSize(10);
    pdf.text('QRコード:', 130, 50);
    pdf.setFontSize(8);
    pdf.text(ticket.id, 130, 60);
  }
  
  // 注意事項
  pdf.setFontSize(10);
  pdf.text('注意事項:', 20, 185);
  
  pdf.setFontSize(8);
  const notes = [
    '• 入場時にこのチケットまたはQRコードを提示してください',
    '• 身分証明書をご持参ください',
    '• チケットの転売・譲渡は禁止されています',
    '• 紛失・盗難については責任を負いかねます',
    '• 会場により入場開始時間が異なる場合があります'
  ];
  
  notes.forEach((note, index) => {
    pdf.text(note, 20, 195 + (index * 8));
  });
  
  // フッター
  pdf.setFontSize(6);
  pdf.text(`Generated at: ${new Date().toLocaleString('ja-JP')}`, 20, 270);
  
  // PDFダウンロード
  const fileName = `ticket-${ticket.eventTitle.replace(/[^a-zA-Z0-9]/g, '')}-${ticket.id}.pdf`;
  pdf.save(fileName);
}

/**
 * QRコードをData URLとして生成
 */
async function generateQRCodeDataURL(value: string, size: number): Promise<string> {
  return new Promise((resolve, reject) => {
    // 動的にqrcode.reactをインポート
    import('qrcode.react').then(() => {
      // 一時的なcanvas要素を作成
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      canvas.width = size;
      canvas.height = size;
      
      // QRコードを描画するための一時的なコンテナ
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      document.body.appendChild(container);
      
      // ReactElementをDOMに一時的にレンダリング
      const qrElement = document.createElement('canvas');
      qrElement.id = 'temp-qr-canvas';
      container.appendChild(qrElement);
      
      // QRコード生成ライブラリを直接使用
      import('qrcode').then((QRCode) => {
        QRCode.default.toCanvas(qrElement, value, {
          width: size,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        }, (error) => {
          document.body.removeChild(container);
          
          if (error) {
            reject(error);
          } else {
            resolve(qrElement.toDataURL());
          }
        });
      }).catch(reject);
    }).catch(reject);
  });
}

/**
 * 複数チケットのPDF生成
 */
export async function generateMultipleTicketsPDF(tickets: Ticket[]): Promise<void> {
  const pdf = new jsPDF();
  
  for (let i = 0; i < tickets.length; i++) {
    if (i > 0) {
      pdf.addPage();
    }
    
    const ticket = tickets[i];
    
    // 各チケットのPDF生成（簡略版）
    pdf.setFontSize(20);
    pdf.text(`チケット ${i + 1}/${tickets.length}`, 20, 20);
    
    pdf.setFontSize(16);
    pdf.text(ticket.eventTitle, 20, 40);
    
    pdf.setFontSize(12);
    pdf.text(`チケット種類: ${ticket.ticketType}`, 20, 55);
    pdf.text(`購入者: ${ticket.customerName}`, 20, 70);
    pdf.text(`開催日: ${formatDate(ticket.eventDate)}`, 20, 85);
    pdf.text(`会場: ${ticket.venue}`, 20, 100);
    
    // QRコード生成を試行
    try {
      const qrData = generateQRData(ticket.id, ticket.eventId, ticket.userId);
      const qrCodeValue = encodeQRData(qrData);
      const qrCodeDataURL = await generateQRCodeDataURL(qrCodeValue, 80);
      
      if (qrCodeDataURL) {
        pdf.addImage(qrCodeDataURL, 'PNG', 120, 40, 60, 60);
      }
    } catch (error) {
      console.error(`QR code generation failed for ticket ${ticket.id}:`, error);
    }
  }
  
  const fileName = `tickets-${tickets[0].eventTitle.replace(/[^a-zA-Z0-9]/g, '')}-${tickets.length}tickets.pdf`;
  pdf.save(fileName);
}