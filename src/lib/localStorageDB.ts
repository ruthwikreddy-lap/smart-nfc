// A robust utility to store page and profile data in localStorage for persistence

// Store profile data
export const storeProfile = (id: string, profileData: any) => {
  try {
    const storageKey = `profile-${id}`;
    const dataToStore = {
      ...profileData,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(storageKey, JSON.stringify(dataToStore));
    
    // Also store in profiles index for easy lookup
    const allProfiles = getAllProfiles() || [];
    if (!allProfiles.includes(id)) {
      allProfiles.push(id);
      localStorage.setItem('all-profiles', JSON.stringify(allProfiles));
    }
    
    return true;
  } catch (error) {
    console.error('Error storing profile data:', error);
    return false;
  }
};

// Get profile data
export const getProfile = (id: string) => {
  try {
    const data = localStorage.getItem(`profile-${id}`);
    return data ? JSON.parse(data) : null;
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

// Store page data with consistent path handling
export const storePage = (path: string, userId: string) => {
  try {
    // Normalize the path to ensure consistency
    const normalizedPath = normalizePath(path);
    
    const pageData = {
      path: normalizedPath,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      id: Math.random().toString(36).substring(2, 15)
    };
    
    localStorage.setItem(`page-${normalizedPath}`, JSON.stringify(pageData));
    
    // Also store in pages index for easy lookup
    const allPages = getAllPages() || [];
    if (!allPages.includes(normalizedPath)) {
      allPages.push(normalizedPath);
      localStorage.setItem('all-pages', JSON.stringify(allPages));
    }
    
    // Also store in user-pages index
    const userPages = getUserPages(userId) || [];
    if (!userPages.includes(normalizedPath)) {
      userPages.push(normalizedPath);
      localStorage.setItem(`user-pages-${userId}`, JSON.stringify(userPages));
    }
    
    return pageData;
  } catch (error) {
    console.error('Error storing page data:', error);
    return null;
  }
};

// Get page data by path with normalized handling
export const getPageByPath = (path: string) => {
  try {
    if (!path) return null;
    
    // Normalize the path for consistent lookup
    const normalizedPath = normalizePath(path);
    
    const data = localStorage.getItem(`page-${normalizedPath}`);
    if (data) return JSON.parse(data);
    
    // Try to fetch from all pages if exact match not found
    const allPages = getAllPages();
    for (const storedPath of allPages) {
      if (normalizedPath === normalizePath(storedPath)) {
        const pageData = localStorage.getItem(`page-${storedPath}`);
        return pageData ? JSON.parse(pageData) : null;
      }
    }
    
    return null;
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

// Clear all data (for testing/debugging)
export const clearAllData = () => {
  try {
    const allProfiles = getAllProfiles();
    const allPages = getAllPages();
    
    // Remove all profile data
    allProfiles.forEach(id => {
      localStorage.removeItem(`profile-${id}`);
      localStorage.removeItem(`user-pages-${id}`);
    });
    
    // Remove all page data
    allPages.forEach(path => {
      localStorage.removeItem(`page-${path}`);
    });
    
    // Remove indices
    localStorage.removeItem('all-profiles');
    localStorage.removeItem('all-pages');
    
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    return false;
  }
};
