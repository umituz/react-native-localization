import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
// @ts-ignore - Optional peer dependency
import {
    useAppDesignTokens,
    AtomicText,
    ListItem,
    AppNavigation,
} from '@umituz/react-native-design-system';
import { useLocalization } from '../../infrastructure/hooks/useLocalization';
import { getLanguageByCode } from '../../infrastructure/config/languages';

export interface LanguageSectionConfig {
    route?: string;
    title?: string;
    description?: string;
    defaultLanguageDisplay?: string;
}

export interface LanguageSectionProps {
    config?: LanguageSectionConfig;
    containerStyle?: ViewStyle;
    sectionTitle?: string;
}

export const LanguageSection: React.FC<LanguageSectionProps> = ({
    config,
    containerStyle,
    sectionTitle,
}) => {
    const tokens = useAppDesignTokens();
    const { t, currentLanguage } = useLocalization();

    const route = config?.route || 'LanguageSelection';
    const title = config?.title || t('settings.languageSelection.title') || 'Language';
    const displaySectionTitle = sectionTitle || title;

    const currentLang = getLanguageByCode(currentLanguage);
    const defaultLanguageDisplay = config?.defaultLanguageDisplay || 'English';
    const languageDisplay = currentLang
        ? `${currentLang.flag} ${currentLang.nativeName}`
        : defaultLanguageDisplay;

    const handlePress = () => {
        AppNavigation.navigate(route as never);
    };

    return (
        <View style={[styles.sectionContainer, { backgroundColor: tokens.colors.surface }, containerStyle]}>
            <View style={styles.headerContainer}>
                <AtomicText type="titleMedium" color="primary">
                    {displaySectionTitle}
                </AtomicText>
            </View>
            <ListItem
                title={title}
                subtitle={languageDisplay}
                leftIcon="globe"
                rightIcon="chevron-forward"
                onPress={handlePress}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    sectionContainer: {
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    headerContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
});
