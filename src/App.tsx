import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Download,
  ExternalLink,
  Lock,
  Radio,
  Search,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ToolApp, AdSettings, SiteSettings } from './types.ts';
import {
  DEFAULT_APPS,
  DEFAULT_AD_SETTINGS,
  DEFAULT_SITE_SETTINGS,
} from './defaultData.ts';
import {
  loadInitialData,
  setAdminMode,
  shouldTriggerPopunder,
  recordPopunderTrigger,
  getIsAdminAuthenticated,
  setAdminAuthenticated,
} from './services/storeService.ts';
import { Header } from './components/Header.tsx';
import { AdBanner } from './components/AdBanner.tsx';
import { AppCard } from './components/AppCard.tsx';
import { DownloadModal } from './components/DownloadModal.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { TelegramFloat } from './components/TelegramFloat.tsx';

export default function App() {
  const [apps, setApps] = useState<ToolApp[]>(DEFAULT_APPS);
  const [adSettings, setAdSettings] = useState<AdSettings>(DEFAULT_AD_SETTINGS);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  const [view, setView] = useState<'store' | 'admin'>('store');
  const [selectedApp, setSelectedApp] = useState<ToolApp | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load store data initially
  useEffect(() => {
    let isMounted = true;
    loadInitialData().then((data) => {
      if (isMounted) {
        setApps(data.apps);
        setAdSettings(data.adSettings);
        setSiteSettings(data.siteSettings);
        setIsLoading(false);
      }
    });

    // Check URL parameters for direct navigation (e.g. ?view=admin or ?id=app-1)
    try {
      const url = new URL(window.location.href);
      const viewParam = url.searchParams.get('view');
      const idParam = url.searchParams.get('id');

      if (viewParam === 'admin' || window.location.pathname.includes('/admin')) {
        setView('admin');
      }

      if (idParam) {
        const found = DEFAULT_APPS.find((a) => a.id === idParam);
        if (found) setSelectedApp(found);
      }
    } catch (e) {}

    // Check session auth
    setIsAuthenticated(getIsAdminAuthenticated());

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync auth state to session storage
  const handleSetIsAuthenticated = (auth: boolean) => {
    setIsAuthenticated(auth);
    setAdminAuthenticated(auth);
  };

  // Switch view handler with Ad Shield integration
  const handleNavigateView = (newView: 'store' | 'admin') => {
    setView(newView);
    setAdminMode(newView === 'admin');

    // Update URL quietly
    try {
      const url = new URL(window.location.href);
      if (newView === 'admin') {
        url.searchParams.set('view', 'admin');
      } else {
        url.searchParams.delete('view');
      }
      window.history.pushState({}, '', url.toString());
    } catch (e) {}
  };

  // Dynamic Header Script Execution (Ads injection on Store mode only)
  useEffect(() => {
    if (view === 'admin') return;

    if (adSettings.headerScript && adSettings.headerScript.trim().length > 0) {
      const containerId = 'dynamic-ad-header-scripts';
      let container = document.getElementById(containerId);
      if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.style.display = 'none';
        document.body.appendChild(container);
      }

      container.innerHTML = '';
      const range = document.createRange();
      range.selectNode(container);
      const fragment = range.createContextualFragment(adSettings.headerScript);
      container.appendChild(fragment);

      return () => {
        if (container) {
          container.innerHTML = '';
        }
      };
    }
  }, [adSettings.headerScript, view]);

  // Handle global popunder trigger on user interaction
  const handleStoreClick = (e: React.MouseEvent) => {
    if (view === 'admin') return;
    if (!adSettings.popunderOnClick) return;

    // Check if target is not inside an anchor or button that has its own action
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input')) {
      return;
    }

    if (shouldTriggerPopunder(adSettings.popunderCooldownMinutes)) {
      try {
        recordPopunderTrigger();
        window.open(adSettings.defaultAdLink, '_blank');
      } catch (err) {
        console.log('Popunder prevented by browser or AdBlock', err);
      }
    }
  };

  // Select App for download
  const handleSelectApp = (app: ToolApp) => {
    setSelectedApp(app);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('id', app.id);
      window.history.pushState({}, '', url.toString());
    } catch (e) {}
  };

  // Close Download Modal
  const handleCloseModal = () => {
    setSelectedApp(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('id');
      window.history.pushState({}, '', url.toString());
    } catch (e) {}
  };

  // Compute Categories from apps list
  const categories = useMemo(() => {
    const set = new Set<string>();
    apps.forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return ['All', ...Array.from(set)];
  }, [apps]);

  // Filter apps by category and search query
  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const matchesCategory =
        selectedCategory === 'All' || app.category.toLowerCase() === selectedCategory.toLowerCase();
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        app.name.toLowerCase().includes(query) ||
        app.description.toLowerCase().includes(query) ||
        app.category.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [apps, selectedCategory, searchQuery]);

  // If in Admin view, render AdminPanel
  if (view === 'admin') {
    return (
      <AdminPanel
        apps={apps}
        setApps={setApps}
        adSettings={adSettings}
        setAdSettings={setAdSettings}
        siteSettings={siteSettings}
        setSiteSettings={setSiteSettings}
        onClose={() => handleNavigateView('store')}
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={handleSetIsAuthenticated}
      />
    );
  }

  return (
    <div
      onClick={handleStoreClick}
      className="min-h-screen flex flex-col bg-[#0b0c12] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,242,234,0.12),rgba(255,255,255,0))] text-white selection:bg-[#00f2ea] selection:text-black font-sans"
    >
      {/* Header */}
      <Header
        siteSettings={siteSettings}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        onOpenAdmin={() => handleNavigateView('admin')}
      />

      {/* Top Banner Ad if enabled */}
      {adSettings.showTopBanner && (
        <AdBanner
          type="topBanner"
          customCode={adSettings.topBannerCode}
          defaultAdLink={adSettings.defaultAdLink}
          title="⚡ Direct Mirror Active: Download Unlocked VIP Tools With Max Speed"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Section Heading Bar */}
        <div className="flex items-center justify-between mb-6 pb-2.5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-bold tracking-wide uppercase text-white">
              {selectedCategory === 'All' ? 'All Verified Applications' : selectedCategory}
            </h2>
            <span className="text-xs font-semibold bg-white/5 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">
              {filteredApps.length} Tools Available
            </span>
          </div>

          <a
            href={siteSettings.telegramChannel}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5 hover:underline"
          >
            <Send className="w-3.5 h-3.5 rotate-45" />
            <span className="hidden sm:inline">Request a Software / Tool</span>
            <span className="sm:hidden">Request</span>
          </a>
        </div>

        {/* Tools Grid */}
        {filteredApps.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredApps.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                onSelectApp={handleSelectApp}
                defaultAdLink={adSettings.defaultAdLink}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center rounded-3xl bg-[#12131d] border border-white/5 p-8 max-w-md mx-auto my-8">
            <Search className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white mb-1">No tools found</h4>
            <p className="text-xs text-slate-400 mb-4">
              We couldn't find any software matching "{searchQuery}".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="btn-3d-cyan px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
            >
              Clear Search & Filter
            </button>
          </div>
        )}
      </main>

      {/* Floating Telegram Widget */}
      <TelegramFloat telegramUrl={siteSettings.telegramChannel} />

      {/* Download / Unlock Modal */}
      {selectedApp && (
        <DownloadModal
          app={selectedApp}
          adSettings={adSettings}
          siteSettings={siteSettings}
          onClose={handleCloseModal}
        />
      )}

      {/* Footer */}
      <footer className="w-full border-t border-white/5 bg-[#0e0f17] py-8 text-center text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{siteSettings.siteTitle}</span>
            <span>•</span>
            <span>100% Safe, Tested & Working Downloads</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={siteSettings.telegramChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 rotate-45" />
              <span>Telegram Channel</span>
            </a>

            <button
              onClick={() => {
                setIsAuthenticated(false);
                handleNavigateView('admin');
              }}
              className="hover:text-cyan-400 text-slate-500 transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
              title="Admin Portal"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
