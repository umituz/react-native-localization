/**
 * Translation Hook
 *
 * Provides translation function with proper fallbacks
 * - React i18next integration
 * - Direct i18n fallback
 * - Type-safe translation function
 */

import { useTranslation } from 'react-i18next';
import i18n from '../config/i18n';

/**
 * Hook for translation functionality
 */
export const useTranslationFunction = (): ((key: string, options?: any) => string) => {
  // Ensure settings translations are loaded (always try)
  try {
    const existingTranslations = i18n.getResourceBundle('en-US', 'translation') || {};

    // Always add settings translations as fallback
    const settingsTranslations = {
      settings: {
        editProfile: "Edit Profile",
        sections: {
          physicalInfoAndGoals: "Physical Info and Goals",
          appSettings: "App Settings",
          accountManagement: "Account Management"
        },
        personalInfo: {
          title: "Personal Information",
          subtitle: "Height, Weight, Age, Gender"
        },
        nutritionGoals: {
          title: "Nutrition Goals",
          subtitle: "Calories, Protein, Carbs, Fat"
        },
        notifications: {
          title: "Notification Preferences",
          subtitle: "Water and meal reminders"
        },
        darkMode: {
          title: "Dark Mode",
          subtitle: "Change app theme"
        },
        passwordChange: {
          title: "Change Password"
        },
        saveChanges: "Save Changes",
        logout: "Logout",
        emptyState: {
          title: "No recipes yet",
          subtitle: "Create your first recipe to get started"
        },
        addToList: "Add to List"
      }
    };

    const mergedTranslations = { ...existingTranslations, ...settingsTranslations };
    i18n.addResourceBundle('en-US', 'translation', mergedTranslations, true, true);
  } catch (error) {
    console.error('❌ Failed to load settings translations:', error);
  }

  // Return translation function with guaranteed fallback
  return (key: string, options?: any): string => {
    try {
      if (i18n.isInitialized && typeof i18n.t === 'function') {
        const result = i18n.t(key, options);
        // If result is the same as key, it means translation not found
        if (result !== key && typeof result === 'string') {
          return result;
        }
      }
    } catch (error) {
      console.error('❌ Translation error:', error);
    }

    // Final fallback: return key
    return key;
  };
};
