import React from 'react';
import { Download, HardDrive, Star, Sparkles, Tag } from 'lucide-react';
import { ToolApp } from '../types.ts';

interface AppCardProps {
  app: ToolApp;
  onSelectApp: (app: ToolApp) => void;
  defaultAdLink: string;
}

export const AppCard: React.FC<AppCardProps> = ({ app, onSelectApp }) => {
  return (
    <div
      onClick={() => onSelectApp(app)}
      className="card-3d group relative flex flex-col justify-between rounded-3xl p-4 sm:p-5 cursor-pointer text-left overflow-hidden"
    >
      {/* Featured Ribbon */}
      {app.isFeatured && (
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-400/30">
          <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
          <span>VIP</span>
        </div>
      )}

      {/* Top Details */}
      <div>
        <div className="flex items-center gap-3.5 mb-3.5">
          <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-[#0d0e17] shadow-lg group-hover:border-cyan-400/50 transition-colors">
            <img
              src={app.logo}
              alt={app.name}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 mb-0.5 truncate">
              <Tag className="w-3 h-3 shrink-0" />
              <span className="truncate">{app.category}</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors leading-tight line-clamp-2">
              {app.name}
            </h3>
          </div>
        </div>

        {/* Badges: Version, Size, Downloads */}
        <div className="flex items-center flex-wrap gap-1.5 mb-2.5 text-[11px] text-slate-300">
          {app.version && (
            <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-mono text-[10px]">
              {app.version}
            </span>
          )}
          {app.fileSize && (
            <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-mono text-[10px] flex items-center gap-1">
              <HardDrive className="w-2.5 h-2.5 text-slate-400" />
              {app.fileSize}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-amber-300 font-mono text-[10px] flex items-center gap-1 ml-auto">
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            {app.rating ? app.rating.toFixed(1) : '5.0'}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {app.description}
        </p>
      </div>

      {/* Button CTA */}
      <div className="mt-auto pt-2">
        <button
          type="button"
          className="btn-3d-cyan w-full py-2.5 px-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer group-hover:shadow-[0_0_16px_rgba(0,242,234,0.4)]"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Verify & Unlock</span>
        </button>
      </div>
    </div>
  );
};
