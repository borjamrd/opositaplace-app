'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

interface AutoResizingTextProps {
  text: string;
  className?: string;
  minFontSize?: number;
  maxFontSize?: number;
}

export function AutoResizingText({
  text,
  className,
  minFontSize = 12,
  maxFontSize = 32, // Increased max font size for better visibility on large cards
}: AutoResizingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(maxFontSize);

  useEffect(() => {
    const adjustFontSize = () => {
      const container = containerRef.current;
      const textElement = textRef.current;

      if (!container || !textElement) return;

      let currentFontSize = maxFontSize;
      textElement.style.fontSize = `${currentFontSize}px`;

      // Binary search-like approach or simple decrement could work.
      // Given the range isn't huge, simple decrement is safer and fast enough usually.
      // But let's try a smarter loop to avoid layout thrashing too much if possible,
      // though accessing scrollHeight causes layout/reflow anyway.

      while (
        (textElement.scrollHeight > container.clientHeight ||
          textElement.scrollWidth > container.clientWidth) &&
        currentFontSize > minFontSize
      ) {
        currentFontSize -= 1;
        textElement.style.fontSize = `${currentFontSize}px`;
      }

      setFontSize(currentFontSize);
    };

    adjustFontSize();

    // Optional: Re-adjust on window resize
    window.addEventListener('resize', adjustFontSize);
    return () => window.removeEventListener('resize', adjustFontSize);
  }, [text, maxFontSize, minFontSize]);

  return (
    <div
      ref={containerRef}
      className={cn('w-full h-full flex items-center justify-center overflow-hidden', className)}
    >
      <span
        ref={textRef}
        style={{ fontSize: `${fontSize}px`, lineHeight: 1.4 }}
        className="break-words whitespace-pre-wrap text-center transition-all duration-200"
      >
        {text}
      </span>
    </div>
  );
}
