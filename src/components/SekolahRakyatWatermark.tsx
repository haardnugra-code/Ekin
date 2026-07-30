import React from 'react';
import { DEFAULT_KEMENSOS_LOGO } from '../utils/kemensosLogo';

interface SekolahRakyatWatermarkProps {
  show: boolean;
  opacity: number; // e.g. 0.05 to 0.5
  type?: string;
  customText?: string;
  customImg?: string;
  width?: number;
  height?: number | 'auto';
  isSizePinned?: boolean;
}

export const SekolahRakyatWatermark: React.FC<SekolahRakyatWatermarkProps> = ({
  show,
  opacity,
  customImg,
  width = 450,
  height = 'auto',
  isSizePinned = true
}) => {
  if (!show) return null;

  const watermarkSrc = customImg || DEFAULT_KEMENSOS_LOGO;

  const widthStyle = `${width}px`;
  const heightStyle = isSizePinned || height === 'auto' ? 'auto' : `${height}px`;

  return (
    <div
      className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0 select-none print:flex"
      style={{ opacity }}
      aria-hidden="true"
    >
      <div
        className="max-w-[95%] flex flex-col items-center justify-center transition-all duration-150"
        style={{
          width: widthStyle,
          height: heightStyle !== 'auto' ? heightStyle : undefined,
        }}
      >
        <img
          src={watermarkSrc}
          alt="Watermark Logo Sekolah Rakyat"
          className="w-full h-full object-contain"
          style={{
            maxHeight: isSizePinned ? '80vh' : undefined
          }}
        />
      </div>
    </div>
  );
};

