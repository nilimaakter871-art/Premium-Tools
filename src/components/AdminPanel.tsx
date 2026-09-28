import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Code,
  Copy,
  DollarSign,
  Download,
  Edit2,
  ExternalLink,
  Eye,
  FileCode,
  FolderSync,
  HardDrive,
  Key,
  Layers,
  Lock,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  Search,
  Send,
  Settings,
  Shield,
  ShieldCheck,
  Star,
  Trash2,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import { ToolApp, AdSettings, SiteSettings, StoreData } from '../types.ts';
import { setAdminMode, saveStoreData } from '../services/storeService.ts';
import { DEFAULT_APPS, DEFAULT_AD_SETTINGS, DEFAULT_SITE_SETTINGS } from '../defaultData.ts';

interface AdminPanelProps {
  apps: ToolApp[];
  setApps: React.Dispatch<React.SetStateAction<ToolApp[]>>;
  adSettings: AdSettings;
  setAdSettings: React.Dispatch<React.SetStateAction<AdSettings>>;
  siteSettings: SiteSettings;
  setSiteSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  onClose: () => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  apps,
  setApps,
  adSettings,
  setAdSettings,
  siteSettings,
  setSiteSettings,
  onClose,
  isAuthenticated,
  setIsAuthenticated,
}) => {
  // Activate Admin Shield to prevent ANY ad script from firing
  useEffect(() => {
    setAdminMode(true);
    return () => {
      setAdminMode(false);
    };
  }, []);

  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Tab: 'apps' | 'ads' | 'site' | 'sync'
  const [activeTab, setActiveTab] = useState<'apps' | 'ads' | 'site' | 'sync'>('apps');

  // Apps Management State
  const [appsSearch, setAppsSearch] = useState('');
  const [editingApp, setEditingApp] = useState<ToolApp | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form State for Add / Edit App
  const [formData, setFormData] = useState<Partial<ToolApp>>({
    name: '',
    category: 'Utilities & Tools',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    description: '',
    version: 'v1.0.0',
    fileSize: '50 MB',
    adLink: '',
    mainContentUrl: '',
    timerSeconds: 30,
    downloadsCount: 1000,
    rating: 5.0,
    isFeatured: false,
  });

  // Category presets
  const CATEGORIES = [
    'Design & Creative',
    'Video Editing',
    'Utilities & Tools',
    'AI & Productivity',
    'Security & VPN',
    'Development & Code',
    'Gaming & Entertainment',
    'Audio & Music',
  ];

  // Icon Presets for fast entry
  const ICON_PRESETS = [
    { name: 'Canva Pro', url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=200&auto=format&fit=crop&q=80' },
    { name: 'Video Editing', url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=200&auto=format&fit=crop&q=80' },
    { name: 'Photoshop', url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=200&auto=format&fit=crop&q=80' },
    { name: 'Filmora VIP', url: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=200&auto=format&fit=crop&q=80' },
    { name: 'Software Tool', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200&auto=format&fit=crop&q=80' },
    { name: 'AI Bot', url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=200&auto=format&fit=crop&q=80' },
    { name: 'VPN Security', url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=200&auto=format&fit=crop&q=80' },
    { name: 'Telegram Bot', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80' },
  ];

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = siteSettings.adminPassword || 'Aa123456@';
    if (passwordInput === correctPassword) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect admin password. Default is: Aa123456@');
    }
  };

  // 1-Click Save to Codebase & Storage
  const triggerSaveAll = async (
    customApps = apps,
    customAds = adSettings,
    customSite = siteSettings
  ) => {
    setIsSaving(true);
    setSaveStatus('Saving to data/store.json & syncing...');
    const result = await saveStoreData({
      apps: customApps,
      adSettings: customAds,
      siteSettings: customSite,
    });
    setIsSaving(false);
    if (result.success) {
      setSaveStatus('✓ Saved to codebase & repository successfully!');
      setTimeout(() => setSaveStatus(''), 4000);
    } else {
      setSaveStatus('Error saving: ' + result.message);
    }
  };

  // Save / Add App
  const handleSaveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    let updatedApps: ToolApp[];
    if (editingApp) {
      updatedApps = apps.map((a) =>
        a.id === editingApp.id
          ? ({ ...a, ...formData, id: a.id } as ToolApp)
          : a
      );
    } else {
      const newApp: ToolApp = {
        id: `app-${Date.now()}`,
        name: formData.name || 'Untitled Tool',
        category: formData.category || 'Utilities & Tools',
        logo: formData.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
        description: formData.description || '',
        version: formData.version || 'v1.0.0',
        fileSize: formData.fileSize || '50 MB',
        adLink: formData.adLink || '',
        mainContentUrl: formData.mainContentUrl || '',
        timerSeconds: Number(formData.timerSeconds) || 30,
        downloadsCount: Number(formData.downloadsCount) || 1200,
        rating: Number(formData.rating) || 5.0,
        isFeatured: Boolean(formData.isFeatured),
        createdAt: Date.now(),
      };
      updatedApps = [newApp, ...apps];
    }

    setApps(updatedApps);
    setEditingApp(null);
    setIsAddingNew(false);
    await triggerSaveAll(updatedApps, adSettings, siteSettings);
  };

  // Delete App
  const handleDeleteApp = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? It will be removed from the server immediately.`)) {
      const updatedApps = apps.filter((a) => a.id !== id);
      setApps(updatedApps);
      await triggerSaveAll(updatedApps, adSettings, siteSettings);
    }
  };

  // Open Edit Modal
  const startEditApp = (app: ToolApp) => {
    setEditingApp(app);
    setFormData({ ...app });
    setIsAddingNew(true);
  };

  // Open New Modal
  const startAddNew = () => {
    setEditingApp(null);
    setFormData({
      name: '',
      category: 'Utilities & Tools',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      description: '',
      version: 'v1.0.0',
      fileSize: '50 MB',
      adLink: '',
      mainContentUrl: siteSettings.telegramChannel,
      timerSeconds: 30,
      downloadsCount: Math.floor(Math.random() * 5000) + 1200,
      rating: 4.9,
      isFeatured: false,
    });
    setIsAddingNew(true);
  };

  // Ad Presets
  const applyAdPreset = (network: string) => {
    if (network === 'monetag') {
      setAdSettings((prev) => ({
        ...prev,
        headerScript:
          prev.headerScript +
          '\n<!-- Monetag MultiTag Tag -->\n<script src="https://quge5.com/88/tag.min.js" data-zone="286598" async data-cfasync="false"></script>',
        defaultAdLink: 'https://splendid-garage.com/SJ7fF4',
      }));
    } else if (network === 'adsterra') {
      setAdSettings((prev) => ({
        ...prev,
        headerScript:
          prev.headerScript +
          '\n<!-- Adsterra Popunder Script -->\n<script src="https://researchingsweatexit.com/0c/47/ef/0c47ef0c3b62aba1088eb126c11ab894.js"></script>',
        topBannerCode:
          '<script type="text/javascript">\n\tatOptions = {\n\t\t"key" : "your_banner_key",\n\t\t"format" : "iframe",\n\t\t"height" : 90,\n\t\t"width" : 728,\n\t\t"params" : {}\n\t};\n</script>',
      }));
    } else if (network === 'clean') {
      setAdSettings((prev) => ({
        ...prev,
        headerScript: '',
        topBannerCode: '',
        downloadBannerCode: '',
        floatingSocialBarCode: '',
      }));
    }
  };

  // If not authenticated, show password screen
  if (!isAuthenticated) {
    return (
      <div id="admin-panel-root" data-admin-panel="true" className="min-h-screen flex items-center justify-center p-4 bg-[#08090f] text-white">
        <div className="w-full max-w-md rounded-3xl bg-[#121320] border border-cyan-500/30 p-7 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />
          <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 mb-4 text-cyan-400 shadow-[0_0_20px_rgba(0,242,234,0.2)]">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">VIP Admin Access</h2>
          <p className="text-xs text-slate-400 mb-6">
            Enter the master administrator key to manage apps, ad networks, and server settings.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative text-left">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="Enter admin password (Default: Aa123456@)"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-[#181928] border border-white/10 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                autoFocus
              />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn-3d-cyan w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Unlock Admin Panel</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <button
              onClick={onClose}
              className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </button>
            <span className="font-mono text-[10px] text-slate-400">Default: Aa123456@</span>
          </div>
        </div>
      </div>
    );
  }

  // Filter apps
  const filteredApps = apps.filter(
    (a) =>
      a.name.toLowerCase().includes(appsSearch.toLowerCase()) ||
      a.category.toLowerCase().includes(appsSearch.toLowerCase()) ||
      a.description.toLowerCase().includes(appsSearch.toLowerCase())
  );

  return (
    <div
      id="admin-panel-root"
      data-admin-panel="true"
      className="min-h-screen bg-[#090a12] text-white flex flex-col font-sans"
    >
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#10121d]/95 backdrop-blur-xl px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>ADMIN DASHBOARD</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    <span>Ads Shielded (Safe)</span>
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400">
                  Data persists to server repository (<code className="text-cyan-300">data/store.json</code>)
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="sm:hidden p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
            {saveStatus && (
              <span className="text-xs font-mono text-cyan-300 bg-cyan-950/70 border border-cyan-400/40 px-3 py-1.5 rounded-xl animate-pulse">
                {saveStatus}
              </span>
            )}

            <button
              onClick={() => triggerSaveAll()}
              disabled={isSaving}
              className="btn-3d-cyan px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,242,234,0.3)]"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isSaving ? 'Syncing...' : '1-Click Save to Codebase'}</span>
            </button>

            <button
              onClick={() => {
                setIsAuthenticated(false);
                onClose();
              }}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-red-400 border border-white/10 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            <button
              onClick={onClose}
              className="hidden sm:flex px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto mt-3 flex items-center gap-2 overflow-x-auto pb-0.5">
          <button
            onClick={() => setActiveTab('apps')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'apps'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(0,242,234,0.2)]'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Manage Apps & Tools ({apps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ads')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'ads'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(0,242,234,0.2)]'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Ad Networks & Monetization</span>
          </button>

          <button
            onClick={() => setActiveTab('site')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'site'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(0,242,234,0.2)]'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Site & Telegram Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'sync'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(0,242,234,0.2)]'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <FolderSync className="w-3.5 h-3.5" />
            <span>Codebase & GitHub Storage</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* ======================= TAB 1: MANAGE APPS ======================= */}
        {activeTab === 'apps' && (
          <div className="space-y-5">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#131522] border border-white/5">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter existing tools..."
                  value={appsSearch}
                  onChange={(e) => setAppsSearch(e.target.value)}
                  className="w-full bg-[#1a1c2d] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                onClick={startAddNew}
                className="btn-3d-cyan w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,242,234,0.3)]"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Tool / App</span>
              </button>
            </div>

            {/* Apps Table */}
            <div className="rounded-2xl border border-white/5 bg-[#121420] overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0e0f18] text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/5">
                    <tr>
                      <th className="py-3 px-4">Tool / Software</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Version / Size</th>
                      <th className="py-3 px-4">Timer</th>
                      <th className="py-3 px-4">Featured</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredApps.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.logo}
                              alt={item.name}
                              className="h-10 w-10 rounded-xl object-cover border border-white/10 bg-black shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80';
                              }}
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-white text-sm truncate max-w-xs">{item.name}</div>
                              <div className="text-[11px] text-slate-400 line-clamp-1">{item.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] font-semibold">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-300">
                          {item.version || 'v1.0'} / {item.fileSize || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-cyan-400 font-bold">
                          {item.timerSeconds || 30}s
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {item.isFeatured ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                              ★ VIP
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Normal</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => startEditApp(item)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 hover:text-white transition-colors cursor-pointer"
                              title="Edit tool"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteApp(item.id, item.name)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                              title="Delete tool"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredApps.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">
                          No tools found. Click "Add New Tool" to create one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 2: ADS NETWORKS ======================= */}
        {activeTab === 'ads' && (
          <div className="space-y-6">
            {/* Quick Network Presets */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-[#131522] to-blue-950/40 border border-cyan-500/20">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Quick Ad Network Code Presets
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  Click a network preset to auto-insert recommended scripts:
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => applyAdPreset('monetag')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#1b1e33] hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-bold text-cyan-300 cursor-pointer transition-colors"
                >
                  + Add Monetag MultiTag Preset
                </button>
                <button
                  type="button"
                  onClick={() => applyAdPreset('adsterra')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#1b1e33] hover:bg-purple-500/20 border border-purple-500/30 text-xs font-bold text-purple-300 cursor-pointer transition-colors"
                >
                  + Add Adsterra Popunder & Banner Preset
                </button>
                <button
                  type="button"
                  onClick={() => applyAdPreset('clean')}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 cursor-pointer"
                >
                  Clear Custom Ad Scripts
                </button>
              </div>
            </div>

            {/* General Popunder & Direct Link Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Direct Link Ad */}
              <div className="p-5 rounded-2xl bg-[#121420] border border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-cyan-400">
                  <ExternalLink className="w-4 h-4" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Direct Link Ad (SmartLink)
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Put your Adsterra Direct Link, Monetag SmartLink, or CPA Offer link. When users click on software or unlock fast mirror, this URL opens.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Global Direct Ad Link URL:
                  </label>
                  <input
                    type="url"
                    value={adSettings.defaultAdLink}
                    onChange={(e) => setAdSettings({ ...adSettings, defaultAdLink: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-[#181a2b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5">
                  <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                    <span>Open Ad in New Tab when clicking download modal</span>
                    <input
                      type="checkbox"
                      checked={adSettings.openAdInNewTab}
                      onChange={(e) => setAdSettings({ ...adSettings, openAdInNewTab: e.target.checked })}
                      className="w-4 h-4 accent-cyan-400 cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                    <span>Auto-redirect to file when timer finishes</span>
                    <input
                      type="checkbox"
                      checked={adSettings.autoRedirect}
                      onChange={(e) => setAdSettings({ ...adSettings, autoRedirect: e.target.checked })}
                      className="w-4 h-4 accent-cyan-400 cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Popunder & Timer Controls */}
              <div className="p-5 rounded-2xl bg-[#121420] border border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-cyan-400">
                  <DollarSign className="w-4 h-4" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Popunder & Global Timer
                  </h3>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Default Unlock Timer (Seconds):
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={adSettings.defaultTimerSec}
                    onChange={(e) => setAdSettings({ ...adSettings, defaultTimerSec: parseInt(e.target.value, 10) || 30 })}
                    className="w-full bg-[#181a2b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-[11px] text-slate-400">Standard is 30 seconds for optimal ad revenue and high completion rate.</span>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-2">
                  <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                    <span>Popunder Trigger on Store Click</span>
                    <input
                      type="checkbox"
                      checked={adSettings.popunderOnClick}
                      onChange={(e) => setAdSettings({ ...adSettings, popunderOnClick: e.target.checked })}
                      className="w-4 h-4 accent-cyan-400 cursor-pointer"
                    />
                  </label>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Popunder Cooldown (Minutes between triggers per user):
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={adSettings.popunderCooldownMinutes}
                      onChange={(e) => setAdSettings({ ...adSettings, popunderCooldownMinutes: parseInt(e.target.value, 10) || 1 })}
                      className="w-full bg-[#181a2b] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Ad Codes */}
            <div className="space-y-5">
              {/* Header Scripts / MultiTag Code */}
              <div className="p-5 rounded-2xl bg-[#121420] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Header Scripts & MultiTag Code
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">Runs globally on store (Shielded in Admin)</span>
                </div>
                <p className="text-xs text-slate-400">
                  Paste your Monetag MultiTag script, Adsterra Popunder script, Google Analytics, or any HTML &lt;script&gt; tags here:
                </p>
                <textarea
                  rows={4}
                  value={adSettings.headerScript}
                  onChange={(e) => setAdSettings({ ...adSettings, headerScript: e.target.value })}
                  placeholder="<script src='https://...'></script>"
                  className="w-full bg-[#181a2b] border border-white/10 rounded-xl p-3 font-mono text-xs text-cyan-200 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Top Banner Code */}
              <div className="p-5 rounded-2xl bg-[#121420] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Top Banner Ad Code
                    </h3>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <span>Show Top Banner</span>
                    <input
                      type="checkbox"
                      checked={adSettings.showTopBanner}
                      onChange={(e) => setAdSettings({ ...adSettings, showTopBanner: e.target.checked })}
                      className="w-4 h-4 accent-cyan-400"
                    />
                  </label>
                </div>
                <p className="text-xs text-slate-400">
                  Place 728x90 banner code, Adsterra banner, Google AdSense banner code, or custom sponsor HTML:
                </p>
                <textarea
                  rows={3}
                  value={adSettings.topBannerCode}
                  onChange={(e) => setAdSettings({ ...adSettings, topBannerCode: e.target.value })}
                  placeholder="<div>...banner ad code...</div>"
                  className="w-full bg-[#181a2b] border border-white/10 rounded-xl p-3 font-mono text-xs text-cyan-200 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Download Modal Banner Code */}
              <div className="p-5 rounded-2xl bg-[#121420] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Download / Unlock Modal Banner Ad Code
                    </h3>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <span>Show Modal Banner</span>
                    <input
                      type="checkbox"
                      checked={adSettings.showDownloadBanner}
                      onChange={(e) => setAdSettings({ ...adSettings, showDownloadBanner: e.target.checked })}
                      className="w-4 h-4 accent-cyan-400"
                    />
                  </label>
                </div>
                <p className="text-xs text-slate-400">
                  Displayed directly above the unlock countdown timer inside the download window (high CTR placement):
                </p>
                <textarea
                  rows={3}
                  value={adSettings.downloadBannerCode}
                  onChange={(e) => setAdSettings({ ...adSettings, downloadBannerCode: e.target.value })}
                  placeholder="<div>...modal sponsor code...</div>"
                  className="w-full bg-[#181a2b] border border-white/10 rounded-xl p-3 font-mono text-xs text-cyan-200 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Save Ad Settings Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => triggerSaveAll(apps, adSettings, siteSettings)}
                className="btn-3d-cyan w-full py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(0,242,234,0.3)]"
              >
                <Save className="w-4 h-4" />
                <span>Save All Ad Networks & Monetization Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================= TAB 3: SITE & TELEGRAM ======================= */}
        {activeTab === 'site' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#121420] border border-white/5 space-y-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-4 h-4 text-cyan-400" />
                <span>Store Branding & Telegram Integration</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Site Title</label>
                  <input
                    type="text"
                    value={siteSettings.siteTitle}
                    onChange={(e) => setSiteSettings({ ...siteSettings, siteTitle: e.target.value })}
                    className="w-full bg-[#181a2b] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Site Subtitle</label>
                  <input
                    type="text"
                    value={siteSettings.siteSubtitle}
                    onChange={(e) => setSiteSettings({ ...siteSettings, siteSubtitle: e.target.value })}
                    className="w-full bg-[#181a2b] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Telegram Channel Link (e.g. https://t.me/yourchannel)</span>
                </label>
                <input
                  type="url"
                  value={siteSettings.telegramChannel}
                  onChange={(e) => setSiteSettings({ ...siteSettings, telegramChannel: e.target.value })}
                  className="w-full bg-[#181a2b] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Top Announcement Bar Text
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                    <span>Show announcement banner</span>
                    <input
                      type="checkbox"
                      checked={siteSettings.showAnnouncement !== false}
                      onChange={(e) => setSiteSettings({ ...siteSettings, showAnnouncement: e.target.checked })}
                      className="w-4 h-4 accent-cyan-400"
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={siteSettings.announcement}
                  onChange={(e) => setSiteSettings({ ...siteSettings, announcement: e.target.value })}
                  className="w-full bg-[#181a2b] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-4 border-t border-white/5">
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Panel Password</span>
                </label>
                <input
                  type="text"
                  value={siteSettings.adminPassword || 'Aa123456@'}
                  onChange={(e) => setSiteSettings({ ...siteSettings, adminPassword: e.target.value })}
                  className="w-full bg-[#181a2b] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 max-w-sm"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => triggerSaveAll(apps, adSettings, siteSettings)}
                  className="btn-3d-cyan px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Site & Telegram Settings</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 4: CODEBASE & GITHUB SYNC ======================= */}
        {activeTab === 'sync' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#121420] border border-white/5 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">
                  Server File & Codebase Persistence Active
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                All changes made in this admin panel (adding new tools, modifying ad network links, deleting apps) are saved directly to the server file <code className="text-cyan-300 px-1.5 py-0.5 rounded bg-black/40">data/store.json</code>.
                When you deploy to Cloud Run or push to your GitHub repository, all your tools and ad configurations remain intact.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
                <div className="p-4 rounded-xl bg-[#17192b] border border-white/5 text-center">
                  <div className="text-2xl font-black text-cyan-400 mb-1">{apps.length}</div>
                  <div className="text-xs text-slate-400 font-semibold uppercase">Total Tools in Codebase</div>
                </div>
                <div className="p-4 rounded-xl bg-[#17192b] border border-white/5 text-center">
                  <div className="text-2xl font-black text-emerald-400 mb-1">
                    {adSettings.showTopBanner || adSettings.headerScript ? 'ACTIVE' : 'READY'}
                  </div>
                  <div className="text-xs text-slate-400 font-semibold uppercase">Ad Network Status</div>
                </div>
                <div className="p-4 rounded-xl bg-[#17192b] border border-white/5 text-center">
                  <div className="text-2xl font-black text-purple-400 mb-1">100%</div>
                  <div className="text-xs text-slate-400 font-semibold uppercase">Ad Shield in Admin</div>
                </div>
              </div>

              {/* 1-Click Sync Button */}
              <div className="pt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => triggerSaveAll()}
                  disabled={isSaving}
                  className="btn-3d-cyan px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(0,242,234,0.3)]"
                >
                  <RefreshCw className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
                  <span>Force 1-Click Codebase Sync</span>
                </button>

                <a
                  href="/api/backup"
                  download="premium_store_backup.json"
                  className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Export JSON Backup File</span>
                </a>

                <button
                  onClick={() => {
                    if (window.confirm('Reset all apps and settings to initial factory defaults?')) {
                      setApps(DEFAULT_APPS);
                      setAdSettings(DEFAULT_AD_SETTINGS);
                      setSiteSettings(DEFAULT_SITE_SETTINGS);
                      triggerSaveAll(DEFAULT_APPS, DEFAULT_AD_SETTINGS, DEFAULT_SITE_SETTINGS);
                    }
                  }}
                  className="px-4 py-3 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-500/20 text-xs font-bold text-red-300 hover:text-red-200 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                  <span>Reset to Factory Defaults</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ======================= ADD / EDIT APP MODAL ======================= */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl my-auto rounded-3xl bg-[#121422] border border-cyan-500/30 p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.95)] text-left text-white max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                <span>{editingApp ? `Edit: ${editingApp.name}` : 'Add New Premium Tool / App'}</span>
              </h2>
              <button
                onClick={() => setIsAddingNew(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveApp} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Software / Tool Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Canva Pro Lifetime 2025"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#181a2c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#181a2c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Logo URL & Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Logo Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 bg-[#181a2c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                  {formData.logo && (
                    <img
                      src={formData.logo}
                      alt="Preview"
                      className="h-9 w-9 rounded-xl object-cover border border-white/10 bg-black shrink-0"
                    />
                  )}
                </div>

                {/* Fast Presets */}
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400">Quick presets:</span>
                  {ICON_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, logo: p.url })}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/5 transition-colors cursor-pointer"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Key features, unlock description, etc."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#181a2c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Version & File Size */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Version</label>
                  <input
                    type="text"
                    placeholder="v4.92.0"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full bg-[#181a2c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">File Size</label>
                  <input
                    type="text"
                    placeholder="48 MB"
                    value={formData.fileSize}
                    onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                    className="w-full bg-[#181a2c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Download URL & Ad Direct Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Main Download URL / Telegram Post Link
                  </label>
                  <input
                    type="url"
                    placeholder={siteSettings.telegramChannel || 'https://t.me/...'}
                    value={formData.mainContentUrl}
                    onChange={(e) => setFormData({ ...formData, mainContentUrl: e.target.value })}
                    className="w-full bg-[#181a2c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-[10px] text-slate-400">Leave blank to use default Telegram channel.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Custom Ad Direct Link (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="Leave blank to use global ad link"
                    value={formData.adLink}
                    onChange={(e) => setFormData({ ...formData, adLink: e.target.value })}
                    className="w-full bg-[#181a2c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Timer, Downloads & Featured */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Timer (Seconds)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={formData.timerSeconds}
                    onChange={(e) => setFormData({ ...formData, timerSeconds: parseInt(e.target.value, 10) || 30 })}
                    className="w-full bg-[#181a2c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Downloads Count
                  </label>
                  <input
                    type="number"
                    value={formData.downloadsCount}
                    onChange={(e) => setFormData({ ...formData, downloadsCount: parseInt(e.target.value, 10) || 1000 })}
                    className="w-full bg-[#181a2c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Rating (1-5)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 5.0 })}
                    className="w-full bg-[#181a2c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 accent-cyan-400 cursor-pointer"
                  />
                  <span>Mark as VIP / Featured Tool (Displays VIP ribbon)</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-3d-cyan px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,242,234,0.3)]"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingApp ? 'Save Tool Changes' : 'Create & Save Tool'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
