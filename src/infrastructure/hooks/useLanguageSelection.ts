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
        setSelectedCode(code);
        await setLanguage(code);
        onComplete?.();
    };

    return {
        searchQuery,
        setSearchQuery,
        selectedCode,
        filteredLanguages,
        handleLanguageSelect,
    };
};
