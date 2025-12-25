"use client";

import { useEffect, useRef, useState } from "react";


type DotType = "dots" | "rounded" | "classy" | "classy-rounded" | "square" | "extra-rounded";
type CornerSquareType = "dot" | "square" | "extra-rounded";
type CornerDotType = "dot" | "square";

interface QRGeneratorProps {
  data: string;
  dotColor: string;
  backgroundColor: string;
  dotType: DotType;
  cornerSquareType: CornerSquareType;
  cornerDotType: CornerDotType;
  logoImage: string | null;
  size: number;
  imageSize?: number;
  imageMargin?: number;
  cornerImageTopLeft?: string | null;
  cornerImageTopRight?: string | null;
  cornerImageBottomLeft?: string | null;
  cornerItemSize?: number;
}

export default function QRGenerator({
  data,
  dotColor,
  backgroundColor,
  dotType,
  cornerSquareType,
  cornerDotType,
  logoImage,
  size,
  imageSize = 0.4,
  imageMargin = 10,
  cornerImageTopLeft,
  cornerImageTopRight,
  cornerImageBottomLeft,
  cornerItemSize = 40,
}: QRGeneratorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const qrCode = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);
  const padding = 20;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const initQR = async () => {
      const QRCodeStylingClass = (await import("qr-code-styling")).default;
      
      const hasAnyCornerImage = cornerImageTopLeft || cornerImageTopRight || cornerImageBottomLeft;

      const options = {
        width: size,
        height: size,
        type: "svg" as const,
        data: data || "https://example.com",
        dotsOptions: {
          color: dotColor,
          type: dotType,
        },
        backgroundOptions: {
          color: backgroundColor,
        },
        cornersSquareOptions: {
          type: cornerSquareType,
          color: hasAnyCornerImage ? "transparent" : dotColor,
        },
        cornersDotOptions: {
          type: cornerDotType,
          color: hasAnyCornerImage ? "transparent" : dotColor,
        },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: imageMargin,
          imageSize: imageSize,
          hideBackgroundDots: true,
        },
        image: logoImage || undefined,
      };

      if (!qrCode.current) {
        qrCode.current = new QRCodeStylingClass(options);

        if (ref.current) {
          ref.current.innerHTML = "";
          qrCode.current.append(ref.current);
        }
      } else {
        qrCode.current.update(options);
      }
    };

    initQR();
  }, [isClient, data, dotColor, backgroundColor, dotType, cornerSquareType, cornerDotType, logoImage, size, imageSize, imageMargin, cornerImageTopLeft, cornerImageTopRight, cornerImageBottomLeft]);

  const downloadQR = async (extension: "png" | "svg") => {
    if (qrCode.current) {
      qrCode.current.download({
        name: "qr-code",
        extension: extension,
      });
    }
  };

  if (!isClient) {
    return (
      <div 
        className="flex items-center justify-center"
        style={{ width: size, height: size, backgroundColor }}
      >
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative group">
        <div 
          ref={ref} 
          className="qr-container rounded-2xl overflow-hidden shadow-2xl"
          style={{ 
            background: backgroundColor,
            padding: `${padding}px`,
          }}
        />
        
        {/* Top Left */}
        {cornerImageTopLeft && (
          <img 
            src={cornerImageTopLeft} 
            alt="corner-tl"
            className="absolute pointer-events-none select-none"
            style={{ 
              top: padding, 
              left: padding, 
              width: cornerItemSize, 
              height: cornerItemSize 
            }} 
          />
        )}

        {/* Top Right */}
        {cornerImageTopRight && (
          <img 
            src={cornerImageTopRight} 
            alt="corner-tr"
            className="absolute pointer-events-none select-none"
            style={{ 
              top: padding, 
              right: padding, 
              width: cornerItemSize, 
              height: cornerItemSize 
            }} 
          />
        )}

        {/* Bottom Left */}
        {cornerImageBottomLeft && (
          <img 
            src={cornerImageBottomLeft} 
            alt="corner-bl"
            className="absolute pointer-events-none select-none"
            style={{ 
              bottom: padding, 
              left: padding, 
              width: cornerItemSize, 
              height: cornerItemSize 
            }} 
          />
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => downloadQR("png")}
          className="download-btn flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold transition-all duration-300 hover:from-violet-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-violet-500/30 hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PNG
        </button>
        <button
          onClick={() => downloadQR("svg")}
          className="download-btn flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold transition-all duration-300 hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download SVG
        </button>
      </div>
    </div>
  );
}
