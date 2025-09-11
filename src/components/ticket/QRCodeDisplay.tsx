'use client';

import { QRCodeCanvas } from 'qrcode.react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QR_CODE_OPTIONS } from '@/lib/qr-generator';
import { cn } from '@/lib/utils';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
  showBorder?: boolean;
  includeMargin?: boolean;
  level?: 'L' | 'M' | 'Q' | 'H';
  bgColor?: string;
  fgColor?: string;
  onDownload?: () => void;
}

export default function QRCodeDisplay({
  value,
  size = QR_CODE_OPTIONS.size,
  className,
  showBorder = true,
  includeMargin = QR_CODE_OPTIONS.includeMargin,
  level = QR_CODE_OPTIONS.level,
  bgColor = QR_CODE_OPTIONS.bgColor,
  fgColor = QR_CODE_OPTIONS.fgColor,
  onDownload
}: QRCodeDisplayProps) {
  const handleDownload = () => {
    const canvas = document.querySelector('#qr-canvas') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qrcode.png';
      a.click();
    }
    onDownload?.();
  };

  return (
    <div className={cn('flex flex-col items-center space-y-4', className)}>
      <Card 
        className={cn(
          'p-4 bg-white',
          showBorder ? 'border' : 'border-none shadow-none'
        )}
      >
        <QRCodeCanvas
          id="qr-canvas"
          value={value}
          size={size}
          level={level}
          includeMargin={includeMargin}
          bgColor={bgColor}
          fgColor={fgColor}
        />
      </Card>
      
      {onDownload && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="text-sm"
        >
          <i className="ri-download-line mr-2"></i>
          QRコードを保存
        </Button>
      )}
    </div>
  );
}