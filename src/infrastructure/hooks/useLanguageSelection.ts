/**
 * Language Selection Hook
 * Manages language selection state and filtering
 */

import { useState, useMemo } from 'react';
import { useLocalization } from './useLocalization';
import { searchLanguages } from '../config/LanguageQuery';

export const useLanguageSelection = () => {
    const { currentLanguage, setLanguage } = useLocalization();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCode, setSelectedCode] = useState(currentLanguage);

    const filteredLanguages = useMemo(() => {
        return searchLanguages(searchQuery);
    }, [searchQuery]);

    const handleLanguageSelect = async (code: string, onComplete?: () => void) => {
        if (__DEV__) {
            console.log('[useLanguageSelection] handleLanguageSelect called:', { code, currentLanguage });
        }
        setSelectedCode(code);
        if (__DEV__) {
            console.log('[useLanguageSelection] Calling setLanguage...');
        }
        await setLanguage(code);
        if (__DEV__) {
            console.log('[useLanguageSelection] Language changed to:', code);
        }
        onComplete?.();
        if (__DEV__) {
            console.log('[useLanguageSelection] onComplete callback executed');
        }
    };

    return {
        searchQuery,
        setSearchQuery,
        selectedCode,
        filteredLanguages,
        handleLanguageSelect,
    };
};
