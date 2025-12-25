"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import QRGenerator to avoid SSR issues
const QRGenerator = dynamic(() => import("@/components/QRGenerator"), {
  ssr: false,
  loading: () => (
    <div className="w-[300px] h-[300px] flex items-center justify-center bg-white/5 rounded-2xl">
      <div className="animate-pulse text-white/40">Loading QR Generator...</div>
    </div>
  ),
});

type DotType = "dots" | "rounded" | "classy" | "classy-rounded" | "square" | "extra-rounded";
type CornerSquareType = "dot" | "square" | "extra-rounded";
type CornerDotType = "dot" | "square";

export default function Home() {
  const [data, setData] = useState("https://github.com");
  const [dotColor, setDotColor] = useState("#8b5cf6");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [dotType, setDotType] = useState<DotType>("rounded");
  const [cornerSquareType, setCornerSquareType] = useState<CornerSquareType>("extra-rounded");
  const [cornerDotType, setCornerDotType] = useState<CornerDotType>("dot");
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [logoFileName, setLogoFileName] = useState<string>("");
  const [logoSize, setLogoSize] = useState(0.4);
  const [logoMargin, setLogoMargin] = useState(10);
  const [logoOpacity, setLogoOpacity] = useState(1);
  const [logoShape, setLogoShape] = useState<"square" | "circle" | "rounded">("square");
  const [processedLogo, setProcessedLogo] = useState<string | null>(null);
  const [cornerImageTopLeft, setCornerImageTopLeft] = useState<string | null>(null);
  const [cornerImageTopRight, setCornerImageTopRight] = useState<string | null>(null);
  const [cornerImageBottomLeft, setCornerImageBottomLeft] = useState<string | null>(null);
  const [cornerItemSize, setCornerItemSize] = useState(40);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cornerFileInputRefTL = useRef<HTMLInputElement>(null);
  const cornerFileInputRefTR = useRef<HTMLInputElement>(null);
  const cornerFileInputRefBL = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCornerUpload = (corner: 'tl' | 'tr' | 'bl') => (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (corner === 'tl') setCornerImageTopLeft(result);
        if (corner === 'tr') setCornerImageTopRight(result);
        if (corner === 'bl') setCornerImageBottomLeft(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Process logo image when styling changes
  useEffect(() => {
    if (!logoImage) {
      setProcessedLogo(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = logoImage;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const size = Math.min(img.width, img.height);
      canvas.width = size;
      canvas.height = size;

      // Apply opacity
      ctx.globalAlpha = logoOpacity;

      // Draw shape
      ctx.beginPath();
      if (logoShape === "circle") {
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();
      } else if (logoShape === "rounded") {
        const r = size * 0.2; // 20% radius
        ctx.roundRect(0, 0, size, size, r);
        ctx.clip();
      }
      // "square" needs no clipping

      // Draw image centered and cropped to square
      const offsetX = (img.width - size) / 2;
      const offsetY = (img.height - size) / 2;
      ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);

      setProcessedLogo(canvas.toDataURL());
    };
  }, [logoImage, logoShape, logoOpacity]);

  const removeLogo = () => {
    setLogoImage(null);
    setLogoFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const dotTypeOptions: { value: DotType; label: string }[] = [
    { value: "dots", label: "Dots" },
    { value: "rounded", label: "Rounded" },
    { value: "classy", label: "Classy" },
    { value: "classy-rounded", label: "Classy Rounded" },
    { value: "square", label: "Square" },
    { value: "extra-rounded", label: "Extra Rounded" },
  ];

  const cornerSquareOptions: { value: CornerSquareType; label: string }[] = [
    { value: "dot", label: "Dot" },
    { value: "square", label: "Square" },
    { value: "extra-rounded", label: "Extra Rounded" },
  ];

  const cornerDotOptions: { value: CornerDotType; label: string }[] = [
    { value: "dot", label: "Dot" },
    { value: "square", label: "Square" },
  ];

  return (
    <div className="min-h-screen bg-gradient-animated relative overflow-hidden">
      {/* Floating orbs */}
      <div className="floating-orb orb-1" />
      <div className="floating-orb orb-2" />
      <div className="floating-orb orb-3" />

      <div className="relative z-10 min-h-screen py-8 px-4">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold title-gradient mb-4">
            QR Code Generator
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Create stunning, customizable QR codes with logos. Perfect for branding, 
            marketing materials, and personal use.
          </p>
        </header>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* QR Preview Section */}
            <div className="glass-card p-8 order-1 lg:order-2">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                Live Preview
              </h2>
              <div className="flex justify-center">
                <QRGenerator
                  data={data}
                  dotColor={dotColor}
                  backgroundColor={backgroundColor}
                  dotType={dotType}
                  cornerSquareType={cornerSquareType}
                  cornerDotType={cornerDotType}
                  logoImage={processedLogo}
                  size={300}
                  imageSize={logoSize}
                  imageMargin={logoMargin}
                  cornerImageTopLeft={cornerImageTopLeft}
                  cornerImageTopRight={cornerImageTopRight}
                  cornerImageBottomLeft={cornerImageBottomLeft}
                  cornerItemSize={cornerItemSize}
                />
              </div>
            </div>

            {/* Controls Section */}
            <div className="glass-card p-8 order-2 lg:order-1">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Customize Your QR
              </h2>

              {/* Data Input */}
              <div className="control-section">
                <label className="label">URL or Text</label>
                <input
                  type="text"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  placeholder="Enter URL or text..."
                  className="input-field"
                />
              </div>

              {/* Colors */}
              <div className="control-section">
                <label className="label">Colors</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-white/50 mb-2 block">QR Color</span>
                    <div className="color-picker-wrapper">
                      <input
                        type="color"
                        value={dotColor}
                        onChange={(e) => setDotColor(e.target.value)}
                        className="color-picker"
                      />
                      <span className="text-sm text-white/70 font-mono">{dotColor}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-white/50 mb-2 block">Background</span>
                    <div className="color-picker-wrapper">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="color-picker"
                      />
                      <span className="text-sm text-white/70 font-mono">{backgroundColor}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dot Style */}
              <div className="control-section">
                <label className="label">Dot Style</label>
                <select
                  value={dotType}
                  onChange={(e) => setDotType(e.target.value as DotType)}
                  className="select-field w-full"
                >
                  {dotTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Corner Styles */}
              <div className="control-section">
                <label className="label">Corner Styles</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-white/50 mb-2 block">Corner Square</span>
                    <select
                      value={cornerSquareType}
                      onChange={(e) => setCornerSquareType(e.target.value as CornerSquareType)}
                      className="select-field w-full"
                    >
                      {cornerSquareOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="text-sm text-white/50 mb-2 block">Corner Dot</span>
                    <select
                      value={cornerDotType}
                      onChange={(e) => setCornerDotType(e.target.value as CornerDotType)}
                      className="select-field w-full"
                    >
                      {cornerDotOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Corner Image Uploads */}
              <div className="control-section">
                <label className="label">Corner Icons (Optional)</label>
                <div className="grid grid-cols-3 gap-2">
                  {/* Top Left */}
                  <div 
                    className={`logo-upload p-2 ${cornerImageTopLeft ? 'has-logo' : ''}`}
                    onClick={() => cornerFileInputRefTL.current?.click()}
                  >
                    <input
                      type="file"
                      ref={cornerFileInputRefTL}
                      onChange={handleCornerUpload('tl')}
                      accept="image/*"
                      className="hidden"
                    />
                    {cornerImageTopLeft ? (
                      <div className="relative w-full aspect-square flex items-center justify-center">
                        <img src={cornerImageTopLeft} className="w-8 h-8 object-contain" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCornerImageTopLeft(null);
                            if (cornerFileInputRefTL.current) cornerFileInputRefTL.current.value = "";
                          }}
                          className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5"
                        >
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <span className="text-[10px] text-white/50 block mb-1">TL</span>
                        <svg className="w-5 h-5 mx-auto text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      </div>
                    )}
                  </div>

                  {/* Top Right */}
                  <div 
                    className={`logo-upload p-2 ${cornerImageTopRight ? 'has-logo' : ''}`}
                    onClick={() => cornerFileInputRefTR.current?.click()}
                  >
                    <input
                      type="file"
                      ref={cornerFileInputRefTR}
                      onChange={handleCornerUpload('tr')}
                      accept="image/*"
                      className="hidden"
                    />
                    {cornerImageTopRight ? (
                      <div className="relative w-full aspect-square flex items-center justify-center">
                        <img src={cornerImageTopRight} className="w-8 h-8 object-contain" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCornerImageTopRight(null);
                            if (cornerFileInputRefTR.current) cornerFileInputRefTR.current.value = "";
                          }}
                          className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5"
                        >
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <span className="text-[10px] text-white/50 block mb-1">TR</span>
                        <svg className="w-5 h-5 mx-auto text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      </div>
                    )}
                  </div>

                  {/* Bottom Left */}
                  <div 
                    className={`logo-upload p-2 ${cornerImageBottomLeft ? 'has-logo' : ''}`}
                    onClick={() => cornerFileInputRefBL.current?.click()}
                  >
                    <input
                      type="file"
                      ref={cornerFileInputRefBL}
                      onChange={handleCornerUpload('bl')}
                      accept="image/*"
                      className="hidden"
                    />
                    {cornerImageBottomLeft ? (
                      <div className="relative w-full aspect-square flex items-center justify-center">
                        <img src={cornerImageBottomLeft} className="w-8 h-8 object-contain" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCornerImageBottomLeft(null);
                            if (cornerFileInputRefBL.current) cornerFileInputRefBL.current.value = "";
                          }}
                          className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5"
                        >
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <span className="text-[10px] text-white/50 block mb-1">BL</span>
                        <svg className="w-5 h-5 mx-auto text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      </div>
                    )}
                  </div>
                </div>

                {(cornerImageTopLeft || cornerImageTopRight || cornerImageBottomLeft) && (
                  <div className="mt-3">
                    <label className="label text-xs flex justify-between">
                      Size <span>{cornerItemSize}px</span>
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      step="1"
                      value={cornerItemSize}
                      onChange={(e) => setCornerItemSize(parseInt(e.target.value))}
                      className="w-full accent-violet-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Logo Upload */}
              <div className="control-section">
                <label className="label">Logo (Optional)</label>
                <div 
                  className={`logo-upload ${logoImage ? 'has-logo' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  {logoImage ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={logoImage} 
                          alt="Logo preview" 
                          className="w-12 h-12 object-contain rounded-lg"
                        />
                        <span className="text-white/70 text-sm">{logoFileName}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLogo();
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors p-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="py-4">
                      <svg className="w-10 h-10 mx-auto text-white/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-white/50 text-sm">Click to upload a logo</p>
                      <p className="text-white/30 text-xs mt-1">PNG, JPG, SVG (max 5MB)</p>
                    </div>
                  )}
                </div>
                
                {logoImage && (
                  <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
                    <div>
                      <label className="label text-xs">Logo Shape</label>
                      <div className="flex gap-2">
                        {(["square", "rounded", "circle"] as const).map((shape) => (
                          <button
                            key={shape}
                            onClick={() => setLogoShape(shape)}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                              logoShape === shape
                                ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                                : "bg-white/5 text-white/60 hover:bg-white/10"
                            }`}
                          >
                            {shape.charAt(0).toUpperCase() + shape.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label text-xs flex justify-between">
                          Size <span>{Math.round(logoSize * 100)}%</span>
                        </label>
                        <input
                          type="range"
                          min="0.1"
                          max="0.5"
                          step="0.05"
                          value={logoSize}
                          onChange={(e) => setLogoSize(parseFloat(e.target.value))}
                          className="w-full accent-violet-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="label text-xs flex justify-between">
                          Margin <span>{logoMargin}px</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          step="1"
                          value={logoMargin}
                          onChange={(e) => setLogoMargin(parseInt(e.target.value))}
                          className="w-full accent-violet-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label text-xs flex justify-between">
                        Opacity <span>{Math.round(logoOpacity * 100)}%</span>
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={logoOpacity}
                        onChange={(e) => setLogoOpacity(parseFloat(e.target.value))}
                        className="w-full accent-violet-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
       
      </div>
    </div>
  );
}
