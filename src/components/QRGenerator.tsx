"use client";

import { useEffect, useRef, useState, useCallback } from "react";

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
  cornerIconOpacity?: number;
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
  cornerIconOpacity = 0.4,
}: QRGeneratorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const qrCode = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);
  
  // Standard padding around QR code
  const padding = 20;
  const totalSize = size + padding * 2;
  
  // Finder patterns are approximately 23% of QR size (7 modules out of ~30)
  // Calculate position to CENTER icon on finder pattern
  const finderPatternSize = Math.round(size * 0.23);
  const finderPatternCenter = finderPatternSize / 2;
  // Offset to center the icon on the finder pattern
  const iconCenterOffset = finderPatternCenter - cornerItemSize / 2;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const initQR = async () => {
      const QRCodeStylingClass = (await import("qr-code-styling")).default;

      // Always use high error correction for better scannability with logos/icons
      const options = {
        width: size,
        height: size,
        type: "svg" as const,
        data: data || "https://example.com",
        qrOptions: {
          errorCorrectionLevel: "H" as const, // High error correction for logos
        },
        dotsOptions: {
          color: dotColor,
          type: dotType,
        },
        backgroundOptions: {
          color: backgroundColor,
        },
        cornersSquareOptions: {
          type: cornerSquareType,
          color: dotColor, // Keep corner patterns visible for scannability
        },
        cornersDotOptions: {
          type: cornerDotType,
          color: dotColor, // Keep corner dots visible for scannability
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

  // Helper to load an image as HTMLImageElement
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  // Custom download function that composites QR + corner icons
  const downloadQR = useCallback(async (extension: "png" | "svg") => {
    if (!qrCode.current) return;

    const hasCornerImages = cornerImageTopLeft || cornerImageTopRight || cornerImageBottomLeft;

    // If no corner images, use default download
    if (!hasCornerImages) {
      qrCode.current.download({
        name: "qr-code",
        extension: extension,
      });
      return;
    }

    // For corner images, we need to composite everything onto a canvas
    try {
      // Get QR code as blob
      const qrBlob = await qrCode.current.getRawData("png");
      if (!qrBlob) return;

      // Create canvas with full size including padding
      const canvas = document.createElement("canvas");
      const scale = 2; // Higher resolution for better quality
      canvas.width = totalSize * scale;
      canvas.height = totalSize * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Scale for high DPI
      ctx.scale(scale, scale);

      // Fill background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, totalSize, totalSize);

      // Draw QR code centered with proper padding
      const qrImg = await loadImage(URL.createObjectURL(qrBlob));
      ctx.drawImage(qrImg, padding, padding, size, size);

      // Draw corner images CENTERED on the finder patterns with reduced opacity
      // Low opacity allows finder patterns to show through for scanning
      ctx.globalAlpha = cornerIconOpacity;
      
      if (cornerImageTopLeft) {
        const img = await loadImage(cornerImageTopLeft);
        // Center icon on top-left finder pattern
        ctx.drawImage(img, padding + iconCenterOffset, padding + iconCenterOffset, cornerItemSize, cornerItemSize);
      }

      if (cornerImageTopRight) {
        const img = await loadImage(cornerImageTopRight);
        // Center icon on top-right finder pattern
        ctx.drawImage(img, padding + size - finderPatternSize + iconCenterOffset, padding + iconCenterOffset, cornerItemSize, cornerItemSize);
      }

      if (cornerImageBottomLeft) {
        const img = await loadImage(cornerImageBottomLeft);
        // Center icon on bottom-left finder pattern
        ctx.drawImage(img, padding + iconCenterOffset, padding + size - finderPatternSize + iconCenterOffset, cornerItemSize, cornerItemSize);
      }
      
      // Reset alpha
      ctx.globalAlpha = 1;

      // Download the composited image
      if (extension === "png") {
        const link = document.createElement("a");
        link.download = "qr-code.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      } else {
        // For SVG, we need to convert canvas to SVG
        // This is a simplified approach - embed canvas as image in SVG
        const svgWidth = totalSize;
        const svgHeight = totalSize;
        const dataUrl = canvas.toDataURL("image/png");
        
        const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
  <image width="${svgWidth}" height="${svgHeight}" xlink:href="${dataUrl}"/>
</svg>`;
        
        const blob = new Blob([svgContent], { type: "image/svg+xml" });
        const link = document.createElement("a");
        link.download = "qr-code.svg";
        link.href = URL.createObjectURL(blob);
        link.click();
      }
    } catch (error) {
      console.error("Error downloading QR code:", error);
      // Fallback to default download
      qrCode.current.download({
        name: "qr-code",
        extension: extension,
      });
    }
  }, [cornerImageTopLeft, cornerImageTopRight, cornerImageBottomLeft, cornerItemSize, totalSize, backgroundColor, size, padding, cornerIconOpacity, finderPatternSize, iconCenterOffset]);

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
              top: padding + iconCenterOffset, 
              left: padding + iconCenterOffset, 
              width: cornerItemSize, 
              height: cornerItemSize,
              opacity: cornerIconOpacity
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
              top: padding + iconCenterOffset, 
              right: padding + iconCenterOffset, 
              width: cornerItemSize, 
              height: cornerItemSize,
              opacity: cornerIconOpacity
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
              bottom: padding + iconCenterOffset, 
              left: padding + iconCenterOffset, 
              width: cornerItemSize, 
              height: cornerItemSize,
              opacity: cornerIconOpacity
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
