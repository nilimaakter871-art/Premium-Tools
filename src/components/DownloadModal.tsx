import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  ExternalLink,
  Lock,
  Radio,
  Send,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ToolApp, AdSettings, SiteSettings } from '../types.ts';
import { AdBanner } from './AdBanner.tsx';

interface DownloadModalProps {
  app: ToolApp | null;
  adSettings: AdSettings;
  siteSettings: SiteSettings;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  app,
  adSettings,
  siteSettings,
  onClose,
}) => {
  if (!app) return null;

  const totalTime = app.timerSeconds || adSettings.defaultTimerSec || 30;
  const targetAdLink = app.adLink || adSettings.defaultAdLink;
  const targetMainUrl = app.mainContentUrl || siteSettings.telegramChannel || adSettings.defaultMainContentUrl;

  const [timeLeft, setTimeLeft] = useState<number>(totalTime);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [adOpened, setAdOpened] = useState<boolean>(false);
  const [redirectNotice, setRedirectNotice] = useState<string>('');
  const timerRef = useRef<any>(null);

  // Auto-open ad in new tab on modal launch if configured
  useEffect(() => {
    setTimeLeft(totalTime);
    setIsRunning(true);
    setIsUnlocked(false);
    setRedirectNotice('');

    if (adSettings.openAdInNewTab && !adOpened) {
      try {
        const win = window.open(targetAdLink, '_blank');
        if (win) {
          setAdOpened(true);
        }
      } catch (e) {
        console.log('Pop-up notice or blocked by browser', e);
      }
    }
  }, [app.id]);

  // Countdown timer effect
  useEffect(() => {
    if (isRunning && !isUnlocked) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleUnlock();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [isRunning, isUnlocked]);

  const handleUnlock = () => {
    setIsUnlocked(true);
    setIsRunning(false);

    if (adSettings.autoRedirect) {
      setRedirectNotice('Redirecting to file / Telegram channel in 2 seconds...');
      setTimeout(() => {
        window.open(targetMainUrl, '_blank');
      }, 1800);
    }
  };

  const handleSponsorClick = () => {
    window.open(targetAdLink, '_blank');
    setAdOpened(true);
  };

  const percentComplete = Math.min(100, Math.round(((totalTime - timeLeft) / totalTime) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg my-auto rounded-3xl bg-gradient-to-b from-[#181926] to-[#10111a] border border-cyan-500/25 p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(0,242,234,0.15)] text-center text-white">
        {/* Back Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Server Status Tag */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 text-[11px] font-bold tracking-wider uppercase mb-4 shadow-[0_0_15px_rgba(0,242,234,0.2)]">
          <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>PREMIUM UNLOCK SERVER</span>
        </div>

        {/* App Logo */}
        <div className="relative mx-auto mb-3 inline-block">
          <div className="relative overflow-hidden rounded-2xl border-2 border-cyan-400/40 shadow-[0_12px_24px_rgba(0,0,0,0.8)]">
            <img
              src={app.logo}
              alt={app.name}
              className="h-20 w-20 sm:h-24 sm:w-24 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80';
              }}
            />
          </div>
        </div>

        {/* App Title & Info */}
        <h2 className="text-lg sm:text-xl font-extrabold text-white mb-1 leading-snug">
          {app.name}
        </h2>
        <div className="flex items-center justify-center gap-2 text-xs text-slate-300 mb-4">
          <span className="px-2 py-0.5 rounded-lg bg-white/5 font-mono text-[11px]">{app.version}</span>
          <span>•</span>
          <span className="px-2 py-0.5 rounded-lg bg-white/5 font-mono text-[11px]">{app.fileSize}</span>
          <span>•</span>
          <span className="text-cyan-400 font-semibold">{app.category}</span>
        </div>

        {/* Download Modal Banner Ad */}
        {adSettings.showDownloadBanner && (
          <AdBanner
            type="downloadBanner"
            customCode={adSettings.downloadBannerCode}
            defaultAdLink={targetAdLink}
          />
        )}

        {/* Timer & Unlock Card */}
        <div className="rounded-2xl border border-white/10 bg-[#121320] p-4 sm:p-5 mb-4 text-left shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {isUnlocked ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-bounce" />
              ) : (
                <Lock className="w-4 h-4 text-cyan-400 animate-pulse" />
              )}
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {isUnlocked ? 'Download Mirror Ready' : 'Decrypting Download Link...'}
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-300">
              {isUnlocked ? '100%' : `${timeLeft}s remaining`}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5 mb-3">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(0,242,234,0.5)]"
              style={{ width: `${percentComplete}%` }}
            />
          </div>

          {/* Fast Unlock Ad Button */}
          {!isUnlocked && (
            <button
              onClick={handleSponsorClick}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 group-hover:scale-125 transition-transform" />
              <span>Click Here for Instant High-Speed Direct Unlock</span>
              <ExternalLink className="w-3 h-3 text-cyan-400" />
            </button>
          )}

          {/* Security Features */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/5 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Virus-free & Clean</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Direct Fast Mirror</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {isUnlocked ? (
          <div className="space-y-2">
            <a
              href={targetMainUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-3d-cyan w-full py-3 px-6 rounded-2xl text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,242,234,0.5)] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>DOWNLOAD FILE NOW / GET KEY</span>
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>
            {redirectNotice && (
              <p className="text-xs text-cyan-300 font-mono animate-pulse">{redirectNotice}</p>
            )}
          </div>
        ) : (
          <button
            disabled
            className="w-full py-3 px-6 rounded-2xl bg-white/5 border border-white/10 text-slate-500 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed opacity-75"
          >
            <Lock className="w-4 h-4" />
            <span>Please wait {timeLeft}s to Unlock...</span>
          </button>
        )}

        {/* Telegram Channel Link footer */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-slate-400">
          <span>Having issues?</span>
          <a
            href={siteSettings.telegramChannel}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1"
          >
            <Send className="w-3 h-3 rotate-45" />
            <span>Ask in Telegram Support</span>
          </a>
        </div>
      </div>
    </div>
  );
};
