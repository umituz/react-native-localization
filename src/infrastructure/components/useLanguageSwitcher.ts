/**
 * Language Switcher Hook
 * Manages the logic for the LanguageSwitcher component
 */

import { useMemo, useCallback } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { languageRepository } from '../repository/LanguageRepository';
import type { Language } from '../storage/types/Language';

export interface UseLanguageSwitcherProps {
    onPress?: () => void;
    disabled?: boolean;
}

export const useLanguageSwitcher = ({ onPress, disabled }: UseLanguageSwitcherProps) => {
    const { currentLanguage } = useLocalization();

    const currentLang = useMemo((): Language => {
        return languageRepository.getLanguageByCode(currentLanguage) || languageRepository.getDefaultLanguage();
    }, [currentLanguage]);

    const handlePress = useCallback(() => {
        if (disabled) {
            return;
        }
        onPress?.();
    }, [disabled, onPress]);

    return {
        currentLang,
        handlePress,
    };
};
