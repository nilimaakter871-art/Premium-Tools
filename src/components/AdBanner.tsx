import React, { useEffect, useRef } from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';

interface AdBannerProps {
  type: 'topBanner' | 'downloadBanner' | 'floatingSocialBar';
  customCode?: string;
  defaultAdLink?: string;
  title?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  type,
  customCode,
  defaultAdLink = 'https://splendid-garage.com/SJ7fF4',
  title,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // If in admin mode, do not render ads at all
  if (typeof window !== 'undefined' && (window as any).__IS_ADMIN_MODE) {
    return null;
  }

  useEffect(() => {
    // If custom code contains script tags, execute them safely in the container
    if (customCode && containerRef.current) {
      containerRef.current.innerHTML = '';
      const range = document.createRange();
      range.selectNode(containerRef.current);
      const documentFragment = range.createContextualFragment(customCode);
      containerRef.current.appendChild(documentFragment);
    }
  }, [customCode]);

  // If custom code is provided, render it directly
  if (customCode && customCode.trim().length > 0) {
    return (
      <div className={`ad-wrapper w-full ${type === 'topBanner' ? 'max-w-7xl mx-auto px-4 py-2 my-2' : ''}`}>
        <div ref={containerRef} className="overflow-hidden flex items-center justify-center min-h-[40px]" />
      </div>
    );
  }

  // Fallback high-CTR sponsored banner
  if (type === 'topBanner') {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <a
          href={defaultAdLink}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block w-full overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/60 via-[#10192e] to-purple-950/60 p-3 sm:p-4 text-center transition-all hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,242,234,0.25)] cursor-pointer"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap text-xs sm:text-sm">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40 text-[11px] tracking-wide uppercase">
              <Sparkles className="w-3 h-3 text-cyan-300 animate-spin" />
              Direct Mirror Sponsor
            </span>
            <span className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
              {title || '⚡ Fast Direct Downloads & Uncapped Premium Bandwidth Available Now'}
            </span>
            <span className="inline-flex items-center gap-1 text-cyan-400 font-bold group-hover:translate-x-0.5 transition-transform">
              <span>Access Fast Mirror</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </span>
          </div>
        </a>
      </div>
    );
  }

  if (type === 'downloadBanner') {
    return (
      <div className="w-full my-3">
        <a
          href={defaultAdLink}
          target="_blank"
          rel="noopener noreferrer"
          className="group block p-3.5 rounded-2xl bg-[#141624] border border-cyan-500/25 hover:border-cyan-400 transition-all text-center"
        >
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
            <span>⭐ SPONSORED FAST SERVER</span>
          </div>
          <div className="text-xs text-slate-300 font-medium group-hover:text-cyan-300">
            Skip queue with high-speed 10Gbps dedicated mirror link
          </div>
        </a>
      </div>
    );
  }

  return null;
};
