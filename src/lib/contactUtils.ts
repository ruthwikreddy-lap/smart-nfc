
/**
 * Utility functions for handling contact-related actions
 */

/**
 * Save the contact information to device
 * This creates a vCard file and downloads it
 */
export const saveContact = (profile: {
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  avatar?: string;
  location?: string;
}): void => {
  // Create vCard content
  const vCardLines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${profile.name}`,
    profile.title ? `TITLE:${profile.title}` : '',
    profile.email ? `EMAIL:${profile.email}` : '',
    profile.phone ? `TEL:${profile.phone}` : '',
    profile.location ? `ADR:;;${profile.location};;;` : '',
    profile.twitter ? `URL;type=Twitter:${profile.twitter.startsWith('http') ? profile.twitter : `https://twitter.com/${profile.twitter.replace('@', '')}`}` : '',
    profile.linkedin ? `URL;type=LinkedIn:${profile.linkedin.startsWith('http') ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`}` : '',
    profile.github ? `URL;type=GitHub:${profile.github.startsWith('http') ? profile.github : `https://github.com/${profile.github}`}` : '',
    'END:VCARD'
  ].filter(Boolean).join('\n');

  // Create a Blob from the vCard content
  const blob = new Blob([vCardLines], { type: 'text/vcard' });
  
  // Create a download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${profile.name.replace(/\s+/g, '_')}.vcf`;
  
  // Trigger the download
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  console.log('Contact saved as vCard:', profile.name);
};

/**
 * Add the contact to user's network
 * This uses the navigator.contacts API if available (mobile devices),
 * otherwise falls back to saving as vCard
 */
export const addToNetwork = async (profile: {
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  avatar?: string;
  location?: string;
}): Promise<boolean> => {
  console.log('Attempting to add contact to network:', profile.name);
  
  // Check if the Contacts API is available (mainly on mobile)
  if (hasNativeContactsSupport()) {
    try {
      console.log('Native contacts API available, attempting to use it');
      
      // @ts-ignore - The Contacts API is not fully typed in TypeScript
      const props = ['name', 'email', 'tel'];
      // @ts-ignore
      const contact = new window.ContactsManager.Contact();
      
      // Set contact properties
      contact.name = [profile.name];
      if (profile.email) contact.email = [profile.email];
      if (profile.phone) contact.tel = [profile.phone];
      
      // Save the contact
      await contact.save();
      console.log('Contact saved using native Contacts API');
      return true;
    } catch (error) {
      console.error("Error using Contacts API:", error);
      // Fall back to vCard download
      console.log('Falling back to vCard download');
      saveContact(profile);
      return false;
    }
  } else {
    console.log('Native contacts API not available, using vCard download');
    // Fall back to vCard download on desktop or unsupported browsers
    saveContact(profile);
    return false;
  }
};

/**
 * Check if the contact functionality is available natively
 */
export const hasNativeContactsSupport = (): boolean => {
  const hasContactsAPI = 'contacts' in navigator;
  const hasContactsManager = 'ContactsManager' in window;
  
  console.log('Native contacts support check:', { 
    hasContactsAPI, 
    hasContactsManager
  });
  
  return hasContactsAPI && hasContactsManager;
};
