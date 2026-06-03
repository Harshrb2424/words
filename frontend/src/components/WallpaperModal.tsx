"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Download, Eye, Smartphone, Monitor, Settings, Check, LayoutGrid } from "lucide-react";
import { Quote } from "@/types";

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

interface WallpaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote;
}

type ResolutionPreset = "phone-hd" | "phone-4k" | "pc-fhd" | "pc-2k" | "pc-4k" | "insta-square" | "insta-portrait" | "twitter-post" | "custom";

export default function WallpaperModal({ isOpen, onClose, quote }: WallpaperModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Customization states
  const [preset, setPreset] = useState<ResolutionPreset>("phone-hd");
  const [width, setWidth] = useState(1080);
  const [height, setHeight] = useState(1920);
  const [themeMode, setThemeMode] = useState<"old-book" | "midnight" | "sage" | "aura">("old-book");
  
  // Toggle states
  const [showAuthor, setShowAuthor] = useState(true);
  const [showSource, setShowSource] = useState(true);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showIndex, setShowIndex] = useState(false);
  const [showWatermark, setShowWatermark] = useState(true);

  // New options: Padding, Font scaling, background image, and filters
  const [paddingPercent, setPaddingPercent] = useState(10);
  const [fontScale, setFontScale] = useState(100);
  const [bgImageUrl, setBgImageUrl] = useState("");
  const [loadedBgImage, setLoadedBgImage] = useState<HTMLImageElement | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [blurAmount, setBlurAmount] = useState(0);
  const [brightnessAmount, setBrightnessAmount] = useState(100);
  const [grayscaleAmount, setGrayscaleAmount] = useState(0);
  const [sepiaAmount, setSepiaAmount] = useState(0);
  
  // Preset dimensions
  useEffect(() => {
    switch (preset) {
      case "phone-hd":
        setWidth(1080);
        setHeight(1920);
        break;
      case "phone-4k":
        setWidth(1440);
        setHeight(3200);
        break;
      case "pc-fhd":
        setWidth(1920);
        setHeight(1080);
        break;
      case "pc-2k":
        setWidth(2560);
        setHeight(1440);
        break;
      case "pc-4k":
        setWidth(3840);
        setHeight(2160);
        break;
      case "insta-square":
        setWidth(1080);
        setHeight(1080);
        break;
      case "insta-portrait":
        setWidth(1080);
        setHeight(1350);
        break;
      case "twitter-post":
        setWidth(1200);
        setHeight(675);
        break;
      default:
        break;
    }
  }, [preset]);

  // Load background image from URL with CORS settings
  useEffect(() => {
    if (!bgImageUrl.trim()) {
      setLoadedBgImage(null);
      setImageLoadError(false);
      setIsImageLoading(false);
      return;
    }

    setIsImageLoading(true);
    setImageLoadError(false);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = bgImageUrl.trim();

    img.onload = () => {
      setLoadedBgImage(img);
      setImageLoadError(false);
      setIsImageLoading(false);
    };

    img.onerror = () => {
      setLoadedBgImage(null);
      setImageLoadError(true);
      setIsImageLoading(false);
    };
  }, [bgImageUrl]);

  // Reset customization options when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setPreset("phone-hd");
      setThemeMode("old-book");
      setShowAuthor(true);
      setShowSource(true);
      setShowLanguage(false);
      setShowIndex(false);
      setShowWatermark(true);
      setPaddingPercent(10);
      setFontScale(100);
      setBgImageUrl("");
      setLoadedBgImage(null);
      setImageLoadError(false);
      setIsImageLoading(false);
      setBlurAmount(0);
      setBrightnessAmount(100);
      setGrayscaleAmount(0);
      setSepiaAmount(0);
    }
  }, [isOpen]);

  // Redraw canvas whenever options change
  useEffect(() => {
    if (!isOpen) return;
    
    // Tiny delay to ensure font loaded or layout rendered
    const timer = setTimeout(() => {
      drawWallpaper();
    }, 50);
    
    return () => clearTimeout(timer);
  }, [
    isOpen,
    width,
    height,
    themeMode,
    showAuthor,
    showSource,
    showLanguage,
    showIndex,
    showWatermark,
    quote,
    loadedBgImage,
    blurAmount,
    brightnessAmount,
    grayscaleAmount,
    sepiaAmount,
    fontScale,
    paddingPercent
  ]);

  const drawWallpaper = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Color palettes
    let bg = "#fcf8ee";
    let textPrimary = "#2a241b";
    let textSecondary = "#7c5f2b";
    let borderLine = "#eadecc";

    if (themeMode === "midnight") {
      bg = "#09090b";
      textPrimary = "#f4f4f5";
      textSecondary = "#a1a1aa";
      borderLine = "#27272a";
    } else if (themeMode === "sage") {
      bg = "#f0f4f1";
      textPrimary = "#1c2e24";
      textSecondary = "#4a6b57";
      borderLine = "#dbe5df";
    } else if (themeMode === "aura") {
      const accentColor = quote.color || "#d97706";
      const cleanHex = accentColor.replace("#", "");
      const r = parseInt(cleanHex.substring(0, 2), 16) || 217;
      const g = parseInt(cleanHex.substring(2, 4), 16) || 119;
      const b = parseInt(cleanHex.substring(4, 6), 16) || 6;
      bg = `rgba(${r}, ${g}, ${b}, 0.15)`;
      textPrimary = accentColor;
      textSecondary = `rgba(${r}, ${g}, ${b}, 0.8)`;
      borderLine = `rgba(${r}, ${g}, ${b}, 0.35)`;
    }

    // Override colors for background image layout
    if (loadedBgImage) {
      textPrimary = "#ffffff";
      textSecondary = "#e4e4e7";
      borderLine = "rgba(255, 255, 255, 0.3)";
    }

    // 1. Draw Background Image or Solid Color
    if (loadedBgImage) {
      // Clear with dark fill to prevent flash or border light leak
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      // Apply filters (blur, brightness/dim, grayscale, sepia)
      let filterParts = [];
      if (blurAmount > 0) filterParts.push(`blur(${blurAmount}px)`);
      if (brightnessAmount < 100) filterParts.push(`brightness(${brightnessAmount}%)`);
      if (grayscaleAmount > 0) filterParts.push(`grayscale(${grayscaleAmount}%)`);
      if (sepiaAmount > 0) filterParts.push(`sepia(${sepiaAmount}%)`);
      
      if (filterParts.length > 0) {
        ctx.filter = filterParts.join(" ");
      }

      // Draw background image as cover
      const imgWidth = loadedBgImage.width;
      const imgHeight = loadedBgImage.height;
      const canvasRatio = width / height;
      const imgRatio = imgWidth / imgHeight;

      let sWidth = imgWidth;
      let sHeight = imgHeight;
      let sx = 0;
      let sy = 0;

      if (imgRatio > canvasRatio) {
        sWidth = imgHeight * canvasRatio;
        sx = (imgWidth - sWidth) / 2;
      } else {
        sHeight = imgWidth / canvasRatio;
        sy = (imgHeight - sHeight) / 2;
      }

      ctx.drawImage(loadedBgImage, sx, sy, sWidth, sHeight, 0, 0, width, height);
      ctx.restore();
      ctx.filter = "none";
    } else {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Draw subtle border frame
    const margin = Math.min(width, height) * 0.05; // 5% of smaller dimension
    ctx.lineWidth = Math.max(1, Math.min(width, height) * 0.003);
    ctx.strokeStyle = borderLine;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

    // 3. Typographical setup
    const isPortrait = height > width;
    const paddingX = width * (paddingPercent / 100);
    const maxContentWidth = width - paddingX * 2;
    
    // Scale font size based on wallpaper size & font scale factor
    const baseFontSize = Math.max(24, Math.floor(Math.min(width, height) * (isPortrait ? 0.045 : 0.038)));
    const quoteFontSize = Math.floor(baseFontSize * (fontScale / 100));
    const authorFontSize = Math.max(16, Math.floor(quoteFontSize * 0.65));
    const metaFontSize = Math.max(12, Math.floor(quoteFontSize * 0.45));

    // Dynamic wrap calculation
    ctx.font = `italic 500 ${quoteFontSize}px Georgia, "Playfair Display", serif`;
    const words = `“ ${quote.quote_text} ”`.split(" ");
    const lines: string[] = [];
    let currentLine = "";
    
    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine + words[i] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxContentWidth && i > 0) {
        lines.push(currentLine.trim());
        currentLine = words[i] + " ";
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine.trim());

    const quoteLineHeight = quoteFontSize * 1.5;
    const totalQuoteHeight = lines.length * quoteLineHeight;
    
    // Calculate total block height for perfect centering
    let totalBlockHeight = totalQuoteHeight;
    
    // Author spacer
    if (showAuthor) {
      totalBlockHeight += authorFontSize * 2.2;
    }
    
    // Source provenance spacer
    if (showSource && quote.source) {
      totalBlockHeight += metaFontSize * 2;
    }
    
    // Language spacer
    if (showLanguage) {
      totalBlockHeight += metaFontSize * 1.5;
    }

    // Dynamic vertical start position
    let startY = (height - totalBlockHeight) / 2;

    // 4. Draw Quote Lines
    ctx.fillStyle = textPrimary;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    
    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, startY + index * quoteLineHeight);
    });

    let currentY = startY + totalQuoteHeight;

    // 5. Draw Author
    if (showAuthor) {
      currentY += authorFontSize * 1.2;
      ctx.font = `italic 600 ${authorFontSize}px Georgia, "Playfair Display", serif`;
      ctx.fillStyle = textSecondary;
      ctx.fillText(`— ${quote.author || "Unknown"}`, width / 2, currentY);
      currentY += authorFontSize;
    }

    // 6. Draw Source
    if (showSource && quote.source) {
      currentY += metaFontSize * 1.2;
      ctx.font = `normal 500 ${metaFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillStyle = textSecondary;
      ctx.fillText(quote.source, width / 2, currentY);
      currentY += metaFontSize;
    }

    // 7. Draw Language
    if (showLanguage) {
      currentY += metaFontSize * 0.8;
      ctx.font = `normal 500 ${metaFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillStyle = textSecondary;
      ctx.fillText(`Language: ${quote.language || "English"}`, width / 2, currentY);
    }

    // 8. Draw Archive Index ID (top corner or bottom)
    if (showIndex) {
      ctx.font = `500 ${metaFontSize}px monospace`;
      ctx.fillStyle = textSecondary;
      ctx.fillText(`#000${quote.id}`, width / 2, margin + margin / 2);
    }

    // 9. Draw Watermark
    if (showWatermark) {
      ctx.font = `bold tracking-widest ${metaFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillStyle = textSecondary;
      ctx.globalAlpha = 0.55;
      ctx.fillText("words.harshrb.in", width / 2, height - margin - margin / 2);
      ctx.globalAlpha = 1.0;
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    try {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      const slug = quote.quote_text.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 20);
      link.download = `wallpaper-${slug || "quote"}-${width}x${height}.png`;
      link.href = url;
      link.click();
    } catch (e) {
      console.error("Failed to generate download URL:", e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-5xl h-[90vh] md:h-[80vh] flex flex-col md:flex-row overflow-hidden rounded-3xl border border-border-custom bg-card-custom shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full p-2 text-foreground/50 hover:bg-accent-bg-custom hover:text-accent-custom transition-all cursor-pointer bg-card-custom/80 border border-border-custom/50"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left Side: Live Canvas Preview - Fixed height on mobile, fluid on desktop */}
        <div className="h-[280px] md:h-auto md:flex-1 bg-background/30 p-4 md:p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border-custom overflow-hidden shrink-0">
          <span className="text-[10px] font-bold tracking-widest uppercase text-foreground/45 mb-3 flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            Preview
          </span>

          <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden max-h-[200px] md:max-h-[60vh]">
            <canvas 
              ref={canvasRef} 
              className="max-h-full max-w-full rounded-lg border border-border-custom shadow-lg object-contain bg-zinc-100 dark:bg-zinc-900 transition-all duration-300"
            />
          </div>
        </div>

        {/* Right Side: Options & Customizer Panel */}
        <div className="w-full md:w-96 p-6 flex flex-col justify-between overflow-y-auto bg-card-custom">
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-lg font-bold text-foreground">
                Wallpaper Studio
              </h3>
              <p className="text-xs text-foreground/60">
                Design custom PC or mobile typographic wallpapers.
              </p>
            </div>

            {/* Target Preset Select */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest uppercase text-foreground/60 flex items-center gap-1.5">
                <LayoutGrid className="h-3 w-3" />
                Select Canvas Layout
              </label>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPreset("phone-hd")}
                  className={`flex items-center gap-2 rounded-xl border p-2 text-xs font-semibold cursor-pointer transition-all ${
                    preset === "phone-hd"
                      ? "border-accent-custom bg-accent-bg-custom text-accent-custom"
                      : "border-border-custom hover:border-zinc-400 text-foreground"
                  }`}
                >
                  <Smartphone className="h-4 w-4 shrink-0" />
                  <div className="text-left">
                    <span className="block">Mobile HD</span>
                    <span className="text-[9px] opacity-70">1080 x 1920</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPreset("pc-fhd")}
                  className={`flex items-center gap-2 rounded-xl border p-2 text-xs font-semibold cursor-pointer transition-all ${
                    preset === "pc-fhd"
                      ? "border-accent-custom bg-accent-bg-custom text-accent-custom"
                      : "border-border-custom hover:border-zinc-400 text-foreground"
                  }`}
                >
                  <Monitor className="h-4 w-4 shrink-0" />
                  <div className="text-left">
                    <span className="block">PC FHD</span>
                    <span className="text-[9px] opacity-70">1920 x 1080</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPreset("phone-4k")}
                  className={`flex items-center gap-2 rounded-xl border p-2 text-xs font-semibold cursor-pointer transition-all ${
                    preset === "phone-4k"
                      ? "border-accent-custom bg-accent-bg-custom text-accent-custom"
                      : "border-border-custom hover:border-zinc-400 text-foreground"
                  }`}
                >
                  <Smartphone className="h-4 w-4 shrink-0" />
                  <div className="text-left">
                    <span className="block">Mobile UHD</span>
                    <span className="text-[9px] opacity-70">1440 x 3200</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPreset("pc-4k")}
                  className={`flex items-center gap-2 rounded-xl border p-2 text-xs font-semibold cursor-pointer transition-all ${
                    preset === "pc-4k"
                      ? "border-accent-custom bg-accent-bg-custom text-accent-custom"
                      : "border-border-custom hover:border-zinc-400 text-foreground"
                  }`}
                >
                  <Monitor className="h-4 w-4 shrink-0" />
                  <div className="text-left">
                    <span className="block">PC 4K Ultra</span>
                    <span className="text-[9px] opacity-70">3840 x 2160</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPreset("insta-square")}
                  className={`flex items-center gap-2 rounded-xl border p-2 text-xs font-semibold cursor-pointer transition-all ${
                    preset === "insta-square"
                      ? "border-accent-custom bg-accent-bg-custom text-accent-custom"
                      : "border-border-custom hover:border-zinc-400 text-foreground"
                  }`}
                >
                  <InstagramIcon className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-455" />
                  <div className="text-left">
                    <span className="block">Insta Square</span>
                    <span className="text-[9px] opacity-70">1080 x 1080</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPreset("insta-portrait")}
                  className={`flex items-center gap-2 rounded-xl border p-2 text-xs font-semibold cursor-pointer transition-all ${
                    preset === "insta-portrait"
                      ? "border-accent-custom bg-accent-bg-custom text-accent-custom"
                      : "border-border-custom hover:border-zinc-400 text-foreground"
                  }`}
                >
                  <InstagramIcon className="h-4 w-4 shrink-0 text-rose-500" />
                  <div className="text-left">
                    <span className="block">Insta Portrait</span>
                    <span className="text-[9px] opacity-70">1080 x 1350</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPreset("twitter-post")}
                  className={`flex items-center gap-2 rounded-xl border p-2 text-xs font-semibold cursor-pointer transition-all col-span-2 ${
                    preset === "twitter-post"
                      ? "border-accent-custom bg-accent-bg-custom text-accent-custom"
                      : "border-border-custom hover:border-zinc-400 text-foreground"
                  }`}
                >
                  <TwitterIcon className="h-4 w-4 shrink-0 text-sky-500" />
                  <div className="text-left">
                    <span className="block">Twitter/X Post (1200 x 675)</span>
                  </div>
                </button>
              </div>

              {/* Custom Dimensions inputs */}
              <div className="pt-1.5 flex gap-2">
                <div className="flex-1">
                  <span className="text-[9px] uppercase font-bold text-foreground/50 block mb-0.5">Width (px)</span>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => {
                      setPreset("custom");
                      setWidth(Number(e.target.value));
                    }}
                    className="w-full rounded-lg border border-border-custom bg-background/50 px-2 py-1 text-xs font-mono text-foreground focus:outline-none focus:border-accent-custom"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-[9px] uppercase font-bold text-foreground/50 block mb-0.5">Height (px)</span>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => {
                      setPreset("custom");
                      setHeight(Number(e.target.value));
                    }}
                    className="w-full rounded-lg border border-border-custom bg-background/50 px-2 py-1 text-xs font-mono text-foreground focus:outline-none focus:border-accent-custom"
                  />
                </div>
              </div>
            </div>

            {/* Typography Sliders */}
            <div className="space-y-3 pt-4 border-t border-dashed border-border-custom">
              <label className="text-[10px] font-bold tracking-widest uppercase text-foreground/60 block">
                Typography Controls
              </label>

              <div className="space-y-3">
                {/* Font Size Scale */}
                <div>
                  <div className="flex justify-between text-[11px] font-medium text-foreground mb-1">
                    <span>Font Size Scale</span>
                    <span className="font-mono text-accent-custom">{fontScale}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={fontScale}
                    onChange={(e) => setFontScale(Number(e.target.value))}
                    className="w-full h-1 bg-border-custom rounded-lg appearance-none cursor-pointer accent-accent-custom"
                  />
                </div>

                {/* Left/Right Padding Percentage Slider */}
                <div>
                  <div className="flex justify-between text-[11px] font-medium text-foreground mb-1">
                    <span>Side Padding (Left / Right)</span>
                    <span className="font-mono text-accent-custom">{paddingPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={paddingPercent}
                    onChange={(e) => setPaddingPercent(Number(e.target.value))}
                    className="w-full h-1 bg-border-custom rounded-lg appearance-none cursor-pointer accent-accent-custom"
                  />
                </div>
              </div>
            </div>

            {/* Background Image Options */}
            <div className="space-y-3 pt-4 border-t border-dashed border-border-custom">
              <label className="text-[10px] font-bold tracking-widest uppercase text-foreground/60 block">
                Background Image Customizer
              </label>

              <div className="space-y-3">
                <div>
                  <span className="text-[9px] uppercase font-bold text-foreground/50 block mb-1">Image URL</span>
                  <input
                    type="text"
                    value={bgImageUrl}
                    onChange={(e) => setBgImageUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full rounded-xl border border-border-custom bg-background/50 px-3 py-2 text-xs text-foreground placeholder-foreground/30 focus:outline-none focus:border-accent-custom transition-all"
                  />
                </div>

                {/* Pre-configured Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] uppercase font-bold text-foreground/45">Presets:</span>
                  <button
                    type="button"
                    onClick={() => setBgImageUrl("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80")}
                    className="text-[10px] bg-background/50 hover:bg-accent-bg-custom/40 border border-border-custom rounded-lg px-2 py-0.5 text-foreground/80 hover:text-accent-custom transition-all cursor-pointer font-medium"
                  >
                    Mountains
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgImageUrl("https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200&q=80")}
                    className="text-[10px] bg-background/50 hover:bg-accent-bg-custom/40 border border-border-custom rounded-lg px-2 py-0.5 text-foreground/80 hover:text-accent-custom transition-all cursor-pointer font-medium"
                  >
                    Forest
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgImageUrl("https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=1200&q=80")}
                    className="text-[10px] bg-background/50 hover:bg-accent-bg-custom/40 border border-border-custom rounded-lg px-2 py-0.5 text-foreground/80 hover:text-accent-custom transition-all cursor-pointer font-medium"
                  >
                    Stars
                  </button>
                  {bgImageUrl && (
                    <button
                      type="button"
                      onClick={() => setBgImageUrl("")}
                      className="text-[10px] border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 rounded-lg px-2 py-0.5 text-rose-500 transition-all cursor-pointer font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {isImageLoading && (
                  <span className="text-[10px] text-accent-custom animate-pulse block">Loading background image...</span>
                )}

                {imageLoadError && (
                  <span className="text-[10px] text-rose-500 block leading-tight">
                    Failed to load image. Ensure the URL allows CORS sharing.
                  </span>
                )}

                {loadedBgImage && (
                  <div className="space-y-3 pt-1.5">
                    {/* Blur Amount Slider */}
                    <div>
                      <div className="flex justify-between text-[11px] font-medium text-foreground mb-1">
                        <span>Image Blur</span>
                        <span className="font-mono text-accent-custom">{blurAmount}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        value={blurAmount}
                        onChange={(e) => setBlurAmount(Number(e.target.value))}
                        className="w-full h-1 bg-border-custom rounded-lg appearance-none cursor-pointer accent-accent-custom"
                      />
                    </div>

                    {/* Overlay Darkness (derived via Brightness) */}
                    <div>
                      <div className="flex justify-between text-[11px] font-medium text-foreground mb-1">
                        <span>Overlay Darkness (Dim)</span>
                        <span className="font-mono text-accent-custom">{100 - brightnessAmount}%</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={brightnessAmount}
                        onChange={(e) => setBrightnessAmount(Number(e.target.value))}
                        className="w-full h-1 bg-border-custom rounded-lg appearance-none cursor-pointer accent-accent-custom"
                      />
                    </div>

                    {/* Effect Filter Pills */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setGrayscaleAmount(prev => prev === 100 ? 0 : 100)}
                        className={`flex-1 py-1.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                          grayscaleAmount > 0
                            ? "border-accent-custom bg-accent-bg-custom text-accent-custom"
                            : "border-border-custom hover:border-zinc-400 text-foreground"
                        }`}
                      >
                        Monochrome
                      </button>
                      <button
                        type="button"
                        onClick={() => setSepiaAmount(prev => prev === 100 ? 0 : 100)}
                        className={`flex-1 py-1.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                          sepiaAmount > 0
                            ? "border-accent-custom bg-accent-bg-custom text-accent-custom"
                            : "border-border-custom hover:border-zinc-400 text-foreground"
                        }`}
                      >
                        Sepia
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Aesthetics Wallpaper Theme */}
            {!loadedBgImage && (
              <div className="space-y-2 pt-4 border-t border-dashed border-border-custom">
                <label className="text-[10px] font-bold tracking-widest uppercase text-foreground/60 flex items-center gap-1.5">
                  <Settings className="h-3 w-3" />
                  Color Theme
                </label>
                
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setThemeMode("old-book")}
                    className={`flex-1 rounded-xl border py-2 text-xs font-semibold transition-all cursor-pointer ${
                      themeMode === "old-book"
                        ? "border-accent-custom bg-accent-bg-custom text-accent-custom"
                        : "border-border-custom hover:border-zinc-400 text-foreground"
                    }`}
                  >
                    Old Book
                  </button>
                  <button
                    type="button"
                    onClick={() => setThemeMode("midnight")}
                    className={`flex-1 rounded-xl border py-2 text-xs font-semibold transition-all cursor-pointer ${
                      themeMode === "midnight"
                        ? "border-zinc-600 bg-zinc-950 text-white shadow-xs"
                        : "border-border-custom hover:border-zinc-400 text-foreground"
                    }`}
                  >
                    Midnight
                  </button>
                  <button
                    type="button"
                    onClick={() => setThemeMode("sage")}
                    className={`flex-1 rounded-xl border py-2 text-xs font-semibold transition-all cursor-pointer ${
                      themeMode === "sage"
                        ? "border-emerald-600/50 bg-emerald-50/20 text-emerald-800"
                        : "border-border-custom hover:border-zinc-400 text-foreground"
                    }`}
                  >
                    Sage
                  </button>
                  <button
                    type="button"
                    onClick={() => setThemeMode("aura")}
                    style={{
                      borderColor: themeMode === "aura" ? (quote.color || "#d97706") : undefined,
                      backgroundColor: themeMode === "aura" ? `rgba(${parseInt((quote.color || "#d97706").substring(1,3), 16) || 217}, ${parseInt((quote.color || "#d97706").substring(3,5), 16) || 119}, ${parseInt((quote.color || "#d97706").substring(5,7), 16) || 6}, 0.15)` : undefined,
                      color: themeMode === "aura" ? (quote.color || "#d97706") : undefined
                    }}
                    className={`flex-1 rounded-xl border py-2 text-xs font-semibold transition-all cursor-pointer ${
                      themeMode === "aura"
                        ? ""
                        : "border-border-custom hover:border-zinc-400 text-foreground"
                    }`}
                  >
                    Aura
                  </button>
                </div>
              </div>
            )}

            {/* Toggle components (Author, source, index, lang, watermark) */}
            <div className="space-y-3 pt-4 border-t border-dashed border-border-custom">
              <label className="text-[10px] font-bold tracking-widest uppercase text-foreground/60 block">
                Visible Provenance
              </label>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showAuthor}
                    onChange={(e) => setShowAuthor(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-border-custom bg-background/50 accent-accent-custom focus:outline-none"
                  />
                  <span>Show Author Signature</span>
                </label>

                {quote.source && (
                  <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showSource}
                      onChange={(e) => setShowSource(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-border-custom bg-background/50 accent-accent-custom focus:outline-none"
                    />
                    <span>Show Source Provenance</span>
                  </label>
                )}

                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showLanguage}
                    onChange={(e) => setShowLanguage(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-border-custom bg-background/50 accent-accent-custom focus:outline-none"
                  />
                  <span>Show Language Code</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showIndex}
                    onChange={(e) => setShowIndex(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-border-custom bg-background/50 accent-accent-custom focus:outline-none"
                  />
                  <span>Show Quote index ID (#000{quote.id})</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showWatermark}
                    onChange={(e) => setShowWatermark(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-border-custom bg-background/50 accent-accent-custom focus:outline-none"
                  />
                  <span>Show watermark (words.harshrb.in)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Download Trigger */}
          <div className="pt-6">
            <button
              onClick={handleDownload}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground text-background py-3.5 text-sm font-semibold hover:opacity-90 transition-all cursor-pointer shadow-xs"
            >
              <Download className="h-4 w-4" />
              <span>Download Wallpaper</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
