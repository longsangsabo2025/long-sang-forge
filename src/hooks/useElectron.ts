/**
 * 🖥️ Electron Hook
 * 
 * React hook for using Electron APIs in the renderer process.
 */

export function useElectron() {
  const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron === true;
  const api = isElectron ? window.electronAPI : null;
  
  return {
    isElectron,
    api,
    
    // Helpers
    openExternal: async (url: string) => {
      if (api) {
        return api.openExternal(url);
      }
      // Fallback for web
      window.open(url, '_blank');
      return { success: true };
    },
    
    getAppInfo: async () => {
      if (api) {
        return api.getAppInfo();
      }
      return null;
    },
    
    getSystemInfo: async () => {
      if (api) {
        return api.getSystemInfo();
      }
      return null;
    },
  };
}

export default useElectron;
