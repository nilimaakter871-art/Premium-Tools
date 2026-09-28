import React from 'react';
import { Send, Users } from 'lucide-react';

interface TelegramFloatProps {
  telegramUrl: string;
}

export const TelegramFloat: React.FC<TelegramFloatProps> = ({ telegramUrl }) => {
  // If in admin mode, do not show
  if (typeof window !== 'undefined' && (window as any).__IS_ADMIN_MODE) {
    return null;
  }

  return (
    <aside
      aria-label="Telegram Community"
      className="fixed bottom-5 right-5 z-30 flex items-center"
    >
      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs shadow-[0_10px_25px_rgba(0,180,216,0.4)] hover:shadow-[0_12px_30px_rgba(0,242,234,0.6)] transition-all hover:scale-105 active:scale-95"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
        </span>
        <Send className="w-4 h-4 rotate-45 group-hover:translate-x-0.5 transition-transform" />
        <span className="hidden sm:inline">Join Telegram</span>
        <span className="sm:hidden">Telegram</span>
      </a>
    </aside>
  );
};
