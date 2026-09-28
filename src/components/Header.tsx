import React from 'react';
import { Search, Send, Shield, Sparkles, X } from 'lucide-react';
import { SiteSettings } from '../types.ts';

interface HeaderProps {
  siteSettings: SiteSettings;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  categories: string[];
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  siteSettings,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
  onOpenAdmin,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0e1019]/90 backdrop-blur-xl">
      {/* Top Telegram Announcement bar if enabled */}
      {siteSettings.announcement && siteSettings.showAnnouncement !== false && (
        <div className="bg-gradient-to-r from-cyan-950 via-[#00f2ea]/20 to-blue-950 px-3 py-1.5 text-center text-xs text-cyan-200 border-b border-cyan-500/20 flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-pulse" />
          <span className="truncate max-w-2xl">{siteSettings.announcement}</span>
          <a
            href={siteSettings.telegramChannel}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 font-bold text-cyan-300 hover:text-white underline shrink-0 inline-flex items-center gap-1"
          >
            <span>Join Now</span>
            <Send className="w-3 h-3 rotate-45" />
          </a>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 sm:gap-6">
          {/* Logo & Brand */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-[0_0_20px_rgba(0,242,234,0.4)] flex items-center justify-center">
                <div className="h-full w-full bg-[#0d0e17] rounded-[14px] flex items-center justify-center">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                    P
                  </span>
                </div>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold tracking-wider text-white flex items-center gap-2">
                  <span>{siteSettings.siteTitle || 'PREMIUM STORE'}</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    FREE VIP
                  </span>
                </h1>
                <p className="text-xs text-slate-400 hidden sm:block">
                  {siteSettings.siteSubtitle || '100% Working Apps & Tools Download'}
                </p>
              </div>
            </div>

            {/* Mobile Admin & Telegram buttons */}
            <div className="flex items-center gap-2 sm:hidden">
              <button
                onClick={onOpenAdmin}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-cyan-400"
                title="Admin Panel"
              >
                <Shield className="w-4 h-4" />
              </button>
              <a
                href={siteSettings.telegramChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-3d-cyan px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 rotate-45" />
                <span>Telegram</span>
              </a>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search premium tools, software, games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161726] border border-white/10 focus:border-cyan-400/50 rounded-2xl pl-10 pr-9 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={siteSettings.telegramChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-3d-cyan px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(0,242,234,0.3)]"
            >
              <Send className="w-3.5 h-3.5 rotate-45" />
              <span>Join Telegram</span>
            </a>

            <button
              onClick={onOpenAdmin}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              title="Admin Portal"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Admin</span>
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'btn-3d-cyan font-bold shadow-[0_0_12px_rgba(0,242,234,0.35)]'
                    : 'bg-[#151624] text-slate-400 hover:text-white hover:bg-white/5 border border-white/5'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
