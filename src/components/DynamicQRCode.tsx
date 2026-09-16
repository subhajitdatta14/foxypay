import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface DynamicQRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export const DynamicQRCode: React.FC<DynamicQRCodeProps> = ({
  value,
  size = 140,
  className = '',
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(value, {
      width: size * 2, // 2x for sharp retina rendering
      margin: 1,
      color: {
        dark: '#030712',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (isMounted) {
          setDataUrl(url);
        }
      })
      .catch((err) => {
        console.error('Failed to generate QR code', err);
      });

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-white rounded-lg p-2 ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={`relative p-1.5 bg-white rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.25)] flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={dataUrl}
        alt="Scannable UPI Payment QR Code"
        className="w-full h-full object-contain rounded select-none"
        draggable={false}
      />
    </div>
  );
};
