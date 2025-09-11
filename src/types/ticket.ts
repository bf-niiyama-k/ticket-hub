export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  eventTitle: string;
  eventDescription?: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  ticketType: string;
  price: number;
  quantity: number;
  purchaseDate: string;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  qrCode?: string;
  shortCode?: string;
  seatInfo?: string;
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketScanResult {
  success: boolean;
  message: string;
  ticket?: Ticket;
  scanTime: string;
  status: 'valid' | 'invalid' | 'used' | 'expired';
}

export interface TicketUsageRecord {
  id: string;
  ticketId: string;
  eventId: string;
  userId: string;
  scanTime: string;
  scanLocation?: string;
  scannedBy?: string;
  deviceInfo?: string;
  verificationMethod: 'qr' | 'manual' | 'nfc';
  notes?: string;
}

export interface TicketPDFData {
  ticket: Ticket;
  qrCodeDataURL: string;
  eventLogo?: string;
  companyLogo?: string;
  additionalInfo?: string;
}

export interface QRDisplayModalData {
  ticket: Ticket;
  qrCodeValue: string;
  isOpen: boolean;
  onClose: () => void;
}