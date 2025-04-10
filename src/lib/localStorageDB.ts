
// A simple utility to store page and profile data in localStorage as a fallback

// Store profile data
export const storeProfile = (id: string, profileData: any) => {
  try {
    localStorage.setItem(`profile-${id}`, JSON.stringify(profileData));
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

// Store page data
export const storePage = (path: string, userId: string) => {
  try {
    const pageData = {
      path,
      user_id: userId,
      created_at: new Date().toISOString(),
      id: Math.random().toString(36).substring(2, 15)
    };
    
    localStorage.setItem(`page-${path}`, JSON.stringify(pageData));
    
    // Also store in user-pages index
    const userPages = getUserPages(userId) || [];
    if (!userPages.includes(path)) {
      userPages.push(path);
      localStorage.setItem(`user-pages-${userId}`, JSON.stringify(userPages));
    }
    
    return pageData;
  } catch (error) {
    console.error('Error storing page data:', error);
    return null;
  }
};

// Get page data by path
export const getPageByPath = (path: string) => {
  try {
    const data = localStorage.getItem(`page-${path}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting page data:', error);
    return null;
  }
};

// Get user's page
export const getUserPage = (userId: string) => {
  try {
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
    const data = localStorage.getItem(`user-pages-${userId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user pages:', error);
    return null;
  }
};
