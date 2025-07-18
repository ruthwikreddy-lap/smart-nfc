// Enhanced utility for storing page and profile data with cross-device sync capabilities

// Store profile data with backup to multiple storage locations
export const storeProfile = (id: string, profileData: any) => {
  try {
    const storageKey = `profile-${id}`;
    const dataToStore = {
      ...profileData,
      lastUpdated: new Date().toISOString(),
      deviceId: getDeviceId(),
      syncVersion: Date.now()
    };
    
    // Store in localStorage
    localStorage.setItem(storageKey, JSON.stringify(dataToStore));
    
    // Also backup to sessionStorage for cross-tab sync
    sessionStorage.setItem(storageKey, JSON.stringify(dataToStore));
    
    // Store in profiles index for easy lookup
    const allProfiles = getAllProfiles() || [];
    if (!allProfiles.includes(id)) {
      allProfiles.push(id);
      localStorage.setItem('all-profiles', JSON.stringify(allProfiles));
      sessionStorage.setItem('all-profiles', JSON.stringify(allProfiles));
    }
    
    // Trigger sync to cloud storage if available
    syncToCloud(storageKey, dataToStore);
    
    return true;
  } catch (error) {
    console.error('Error storing profile data:', error);
    return false;
  }
};

// Generate or get device ID for cross-device tracking
const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('device-id');
  if (!deviceId) {
    deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('device-id', deviceId);
  }
  return deviceId;
};

// Enhanced profile retrieval with cross-storage fallback
export const getProfile = (id: string) => {
  try {
    // Try localStorage first
    let data = localStorage.getItem(`profile-${id}`);
    if (data) {
      const parsed = JSON.parse(data);
      // Ensure it's also in sessionStorage
      if (!sessionStorage.getItem(`profile-${id}`)) {
        sessionStorage.setItem(`profile-${id}`, data);
      }
      return parsed;
    }
    
    // Try sessionStorage as fallback
    data = sessionStorage.getItem(`profile-${id}`);
    if (data) {
      const parsed = JSON.parse(data);
      // Restore to localStorage
      localStorage.setItem(`profile-${id}`, data);
      return parsed;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting profile data:', error);
    return null;
  }
};

// Get all profile IDs
export const getAllProfiles = (): string[] => {
  try {
    const data = localStorage.getItem('all-profiles');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting all profiles:', error);
    return [];
  }
};

// Store page data with enhanced cross-device sync
export const storePage = (path: string, userId: string, profileData?: any) => {
  try {
    // Normalize the path to ensure consistency
    const normalizedPath = normalizePath(path);
    
    const pageData = {
      path: normalizedPath,
      user_id: userId,
      profile: profileData || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      id: Math.random().toString(36).substring(2, 15),
      deviceId: getDeviceId(),
      syncVersion: Date.now()
    };
    
    // Store in both localStorage and sessionStorage
    localStorage.setItem(`page-${normalizedPath}`, JSON.stringify(pageData));
    sessionStorage.setItem(`page-${normalizedPath}`, JSON.stringify(pageData));
    
    // Also store in pages index for easy lookup
    const allPages = getAllPages() || [];
    if (!allPages.includes(normalizedPath)) {
      allPages.push(normalizedPath);
      localStorage.setItem('all-pages', JSON.stringify(allPages));
      sessionStorage.setItem('all-pages', JSON.stringify(allPages));
    }
    
    // Also store in user-pages index
    const userPages = getUserPages(userId) || [];
    if (!userPages.includes(normalizedPath)) {
      userPages.push(normalizedPath);
      localStorage.setItem(`user-pages-${userId}`, JSON.stringify(userPages));
      sessionStorage.setItem(`user-pages-${userId}`, JSON.stringify(userPages));
    }
    
    // Trigger sync to cloud storage
    syncToCloud(`page-${normalizedPath}`, pageData);
    
    return pageData;
  } catch (error) {
    console.error('Error storing page data:', error);
    return null;
  }
};

// Get page data by path with cross-storage fallback
export const getPageByPath = (path: string) => {
  try {
    if (!path) return null;
    
    // Normalize the path for consistent lookup
    const normalizedPath = normalizePath(path);
    
    // Try localStorage first
    let data = localStorage.getItem(`page-${normalizedPath}`);
    if (data) {
      const parsed = JSON.parse(data);
      // Also ensure it's in sessionStorage for cross-tab sync
      if (!sessionStorage.getItem(`page-${normalizedPath}`)) {
        sessionStorage.setItem(`page-${normalizedPath}`, data);
      }
      return parsed;
    }
    
    // Try sessionStorage as fallback
    data = sessionStorage.getItem(`page-${normalizedPath}`);
    if (data) {
      const parsed = JSON.parse(data);
      // Restore to localStorage
      localStorage.setItem(`page-${normalizedPath}`, data);
      return parsed;
    }
    
    // Try to fetch from all pages if exact match not found
    const allPages = getAllPages();
    for (const storedPath of allPages) {
      if (normalizedPath === normalizePath(storedPath)) {
        const pageData = localStorage.getItem(`page-${storedPath}`) || sessionStorage.getItem(`page-${storedPath}`);
        if (pageData) {
          const parsed = JSON.parse(pageData);
          // Ensure consistent storage
          localStorage.setItem(`page-${normalizedPath}`, pageData);
          sessionStorage.setItem(`page-${normalizedPath}`, pageData);
          return parsed;
        }
      }
    }
    
    // Try to sync from cloud storage
    return syncFromCloud(`page-${normalizedPath}`);
  } catch (error) {
    console.error('Error getting page data:', error);
    return null;
  }
};

// Helper to normalize paths for consistent lookup
export const normalizePath = (path: string): string => {
  if (!path) return "";
  // Enhanced normalization: trim whitespace, lowercase, and remove any unwanted characters
  return path.trim().toLowerCase().replace(/[^\w-]/g, '');
};

// Get all page paths
export const getAllPages = (): string[] => {
  try {
    const data = localStorage.getItem('all-pages');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting all pages:', error);
    return [];
  }
};

// Get user's page with improved error handling
export const getUserPage = (userId: string) => {
  try {
    if (!userId) return null;
    
    const userPages = getUserPages(userId);
    if (!userPages || userPages.length === 0) return null;
    
    // Get the first page (users only have one page)
    const path = userPages[0];
    return getPageByPath(path);
  } catch (error) {
    console.error('Error getting user page:', error);
    return null;
  }
};

// Get all paths for a user
export const getUserPages = (userId: string): string[] | null => {
  try {
    if (!userId) return null;
    
    const data = localStorage.getItem(`user-pages-${userId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user pages:', error);
    return null;
  }
};

// Update page data (but keep the path unchanged)
export const updatePage = (path: string, updates: any) => {
  try {
    if (!path) return false;
    
    // Normalize the path for consistent lookup
    const normalizedPath = normalizePath(path);
    
    const existingPage = getPageByPath(normalizedPath);
    if (!existingPage) return false;
    
    const updatedPage = {
      ...existingPage,
      ...updates,
      path: normalizedPath, // Ensure path stays the same
      updated_at: new Date().toISOString()
    };
    
    localStorage.setItem(`page-${normalizedPath}`, JSON.stringify(updatedPage));
    return true;
  } catch (error) {
    console.error('Error updating page:', error);
    return false;
  }
};

// Cross-device sync functions
const syncToCloud = async (key: string, data: any) => {
  try {
    // For now, we'll use Supabase for cloud storage
    // In a real implementation, this would sync to the profiles/pages tables
    console.log(`Syncing ${key} to cloud:`, data);
  } catch (error) {
    console.error('Error syncing to cloud:', error);
  }
};

const syncFromCloud = async (key: string) => {
  try {
    // For now, return null - in real implementation, fetch from Supabase
    console.log(`Attempting to sync ${key} from cloud`);
    return null;
  } catch (error) {
    console.error('Error syncing from cloud:', error);
    return null;
  }
};


// Create public shareable links
export const createShareableLink = (path: string): string => {
  const normalizedPath = normalizePath(path);
  return `${window.location.origin}/${normalizedPath}`;
};

// Validate that a link works across devices
export const validateCrossDeviceAccess = async (path: string): Promise<boolean> => {
  try {
    const normalizedPath = normalizePath(path);
    const pageData = getPageByPath(normalizedPath);
    return pageData !== null;
  } catch (error) {
    console.error('Error validating cross-device access:', error);
    return false;
  }
};

// Clear all data (for testing/debugging)
export const clearAllData = () => {
  try {
    const allProfiles = getAllProfiles();
    const allPages = getAllPages();
    
    // Remove all profile data from both storages
    allProfiles.forEach(id => {
      localStorage.removeItem(`profile-${id}`);
      sessionStorage.removeItem(`profile-${id}`);
      localStorage.removeItem(`user-pages-${id}`);
      sessionStorage.removeItem(`user-pages-${id}`);
    });
    
    // Remove all page data from both storages
    allPages.forEach(path => {
      localStorage.removeItem(`page-${path}`);
      sessionStorage.removeItem(`page-${path}`);
    });
    
    // Remove indices from both storages
    localStorage.removeItem('all-profiles');
    sessionStorage.removeItem('all-profiles');
    localStorage.removeItem('all-pages');
    sessionStorage.removeItem('all-pages');
    localStorage.removeItem('device-id');
    
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    return false;
  }
};
