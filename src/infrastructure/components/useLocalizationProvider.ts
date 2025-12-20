/**
 * Localization Provider Hook
 * Manages localization initialization and language changes
 */

import { useEffect, useRef, useCallback } from 'react';
import { useLocalizationStore } from '../storage/LocalizationStore';
import { I18nInitializer } from '../config/I18nInitializer';

export interface UseLocalizationProviderProps {
    translations: Record<string, any>;
    defaultLanguage: string;
    onLanguageChange?: (languageCode: string) => void;
    onError?: (error: Error) => void;
}

export const useLocalizationProvider = ({
    translations,
    defaultLanguage,
    onLanguageChange,
    onError,
}: UseLocalizationProviderProps) => {
    const store = useLocalizationStore();
    const { initialize, setLanguage, isInitialized, currentLanguage } = store;

    const isInitializingRef = useRef(false);
    const previousLanguageRef = useRef(currentLanguage);

    // Memoize translations
    const memoizedTranslations = useRef(translations);

    useEffect(() => {
        memoizedTranslations.current = translations;
    }, [translations]);

    // Initialization
    useEffect(() => {
        if (isInitializingRef.current || isInitialized) {
            return;
        }

        isInitializingRef.current = true;

        const initializeLocalization = async () => {
            try {
                if (__DEV__) {
                    console.log('[LocalizationProvider] Initializing with language:', defaultLanguage);
                }

                await I18nInitializer.initialize(memoizedTranslations.current, defaultLanguage);
                await initialize();

                if (__DEV__) {
                    console.log('[LocalizationProvider] Initialization complete');
                }
            } catch (error) {
                const initializationError = error instanceof Error ? error : new Error('Initialization failed');
                if (__DEV__) {
                    console.error('[LocalizationProvider] Initialization failed:', initializationError);
                }
                onError?.(initializationError);
            } finally {
                isInitializingRef.current = false;
            }
        };

        initializeLocalization();
    }, [defaultLanguage, initialize, onError, isInitialized]);

    // Language Change Listener
    useEffect(() => {
        if (previousLanguageRef.current !== currentLanguage) {
            previousLanguageRef.current = currentLanguage;
            onLanguageChange?.(currentLanguage);

            if (__DEV__) {
                console.log('[LocalizationProvider] Language changed to:', currentLanguage);
            }
        }
    }, [currentLanguage, onLanguageChange]);

    // Manual Language Change
    const handleLanguageChange = useCallback(async (languageCode: string) => {
        try {
            await setLanguage(languageCode);
        } catch (error) {
            const changeError = error instanceof Error ? error : new Error('Language change failed');
            if (__DEV__) {
                console.error('[LocalizationProvider] Language change failed:', changeError);
            }
            onError?.(changeError);
            throw changeError;
        }
    }, [setLanguage, onError]);

    return {
        isInitialized,
        currentLanguage,
        handleLanguageChange,
    };
};
