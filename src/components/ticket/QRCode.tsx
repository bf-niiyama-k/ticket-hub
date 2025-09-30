'use client';

import QRCodeSVG from 'react-qr-code';

interface QRCodeProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  className?: string;
}

export default function QRCode({
  value,
  size = 192,
  level = 'H',
  className = ''
}: QRCodeProps) {
  if (!value) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="text-center">
          <i className="ri-qr-code-line text-4xl text-gray-400 mb-2"></i>
          <p className="text-gray-500 text-sm">QRコード生成中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-block p-4 bg-white rounded-lg ${className}`}>
      <QRCodeSVG
        value={value}
        size={size}
        level={level}
      />
    </div>
  );
}
