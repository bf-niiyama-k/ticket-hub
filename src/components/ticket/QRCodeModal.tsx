'use client';

import QRCode from './QRCode';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  qrCode: string;
  eventTitle: string;
  eventDate: string;
  ticketType: string;
}

export default function QRCodeModal({
  isOpen,
  onClose,
  ticketId,
  qrCode,
  eventTitle,
  eventDate,
  ticketType
}: QRCodeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">チケットQRコード</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <i className="ri-close-line text-gray-600 text-xl w-5 h-5 flex items-center justify-center"></i>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* イベント基本情報 */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">{eventTitle}</h3>
            <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
              有効
            </span>
          </div>

          {/* QRコード表示 */}
          <div className="flex justify-center">
            <QRCode value={qrCode} size={240} level="H" />
          </div>

          {/* チケット詳細 */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">チケット種類:</span>
              <span className="font-medium">{ticketType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">日時:</span>
              <span className="font-medium">{eventDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">チケット番号:</span>
              <span className="font-mono text-xs">{ticketId}</span>
            </div>
          </div>

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
      </div>
    </div>
  );
}