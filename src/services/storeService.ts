import { ToolApp, AdSettings, SiteSettings, StoreData } from '../types.ts';
import {
  DEFAULT_APPS,
  DEFAULT_AD_SETTINGS,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_STORE_DATA,
} from '../defaultData.ts';

const STORAGE_KEYS = {
  APPS: 'ps_apps_v2',
  ADS: 'ps_ad_settings_v2',
  SITE: 'ps_site_settings_v2',
  ADMIN_SESSION: 'ps_admin_session_auth',
  POPUNDER_LAST_TRIGGER: 'ps_popunder_last_trigger',
  POPUNDER_COUNT: 'ps_popunder_count',
};

// Set Admin Mode to prevent ads from firing in admin panel
export function setAdminMode(isAdmin: boolean) {
  if (typeof window !== 'undefined') {
    (window as any).__IS_ADMIN_MODE = isAdmin;
    if (isAdmin) {
      document.documentElement.classList.add('in-admin-mode');
      document.body.classList.add('in-admin-mode');
    } else {
      document.documentElement.classList.remove('in-admin-mode');
      document.body.classList.remove('in-admin-mode');
    }
  }
}

// Fetch initial data from server API or localStorage fallback
export async function loadInitialData(): Promise<StoreData> {
  try {
    const res = await fetch('/api/data');
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const serverData: StoreData = json.data;
        // Cache to localStorage
        if (serverData.apps?.length) {
          localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(serverData.apps));
        }
        if (serverData.adSettings) {
          localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(serverData.adSettings));
        }
        if (serverData.siteSettings) {
          localStorage.setItem(STORAGE_KEYS.SITE, JSON.stringify(serverData.siteSettings));
        }
        return {
          apps: serverData.apps || DEFAULT_APPS,
          adSettings: { ...DEFAULT_AD_SETTINGS, ...serverData.adSettings },
          siteSettings: { ...DEFAULT_SITE_SETTINGS, ...serverData.siteSettings },
          lastUpdated: serverData.lastUpdated || new Date().toISOString(),
        };
      }
    }
  } catch (err) {
    console.warn('Backend API not reachable, loading from browser storage:', err);
  }

  // Fallback to localStorage
  try {
    const localApps = localStorage.getItem(STORAGE_KEYS.APPS);
    const localAds = localStorage.getItem(STORAGE_KEYS.ADS);
    const localSite = localStorage.getItem(STORAGE_KEYS.SITE);

    const apps = localApps ? JSON.parse(localApps) : DEFAULT_APPS;
    const adSettings = localAds ? { ...DEFAULT_AD_SETTINGS, ...JSON.parse(localAds) } : DEFAULT_AD_SETTINGS;
    const siteSettings = localSite ? { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(localSite) } : DEFAULT_SITE_SETTINGS;

    return { apps, adSettings, siteSettings, lastUpdated: new Date().toISOString() };
  } catch (e) {
    console.error('Error reading localStorage:', e);
    return DEFAULT_STORE_DATA;
  }
}

// Save complete store data to Server API (persisting to data/store.json in repository) and localStorage
export async function saveStoreData(data: StoreData): Promise<{ success: boolean; message: string; lastUpdated?: string }> {
  // Update localStorage immediately
  try {
    localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(data.apps));
    localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(data.adSettings));
    localStorage.setItem(STORAGE_KEYS.SITE, JSON.stringify(data.siteSettings));
  } catch (e) {
    console.error('Failed to write to localStorage:', e);
  }

  // Push to Server API
  try {
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const json = await res.json();
      return {
        success: true,
        message: json.message || 'Saved to codebase successfully!',
        lastUpdated: json.lastUpdated || new Date().toISOString(),
      };
    }
    return {
      success: false,
      message: 'Server returned error, changes cached in browser storage.',
    };
  } catch (err: any) {
    console.warn('Network error saving to backend:', err);
    return {
      success: true,
      message: 'Saved to local browser storage (offline mode).',
      lastUpdated: new Date().toISOString(),
    };
  }
}

// Check popunder cooldown
export function shouldTriggerPopunder(cooldownMinutes: number = 1): boolean {
  if (typeof window === 'undefined') return false;
  if ((window as any).__IS_ADMIN_MODE) return false;
  try {
    const last = localStorage.getItem(STORAGE_KEYS.POPUNDER_LAST_TRIGGER);
    if (!last) return true;
    const diffMs = Date.now() - parseInt(last, 10);
    return diffMs > cooldownMinutes * 60 * 1000;
  } catch {
    return true;
  }
}

// Mark popunder triggered
export function recordPopunderTrigger(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.POPUNDER_LAST_TRIGGER, Date.now().toString());
  } catch (e) {
    console.error('Failed to record popunder timestamp', e);
  }
}

// Admin session helpers
export function getIsAdminAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';
  } catch {
    return false;
  }
}

export function setAdminAuthenticated(auth: boolean): void {
  try {
    if (auth) {
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    }
  } catch (e) {
    console.error('Failed to update admin session', e);
  }
}
