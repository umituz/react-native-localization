import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppDesignTokens } from '@umituz/react-native-design-system-theme';
import { useLocalization } from '../../infrastructure/hooks/useLocalization';
import { getLanguageByCode } from '../../infrastructure/config/languages';

export interface LanguageSectionConfig {
    route?: string;
    title?: string;
    description?: string;
    defaultLanguageDisplay?: string;
    // actions?
}

export interface LanguageSectionProps {
    config?: LanguageSectionConfig;
    containerStyle?: ViewStyle;
}

export const LanguageSection: React.FC<LanguageSectionProps> = ({
    config,
    containerStyle,
}) => {
    const navigation = useNavigation();
    const tokens = useAppDesignTokens();
    const colors = tokens.colors;
    const { t, currentLanguage } = useLocalization();

    const route = config?.route || 'LanguageSelection';
    const title = config?.title || t('settings.language') || 'Language';
    const description = config?.description || '';

    const currentLang = getLanguageByCode(currentLanguage);
    const defaultLanguageDisplay = config?.defaultLanguageDisplay || 'English';
    const languageDisplay = currentLang
        ? `${currentLang.flag} ${currentLang.nativeName}`
        : defaultLanguageDisplay;

    const handlePress = () => {
        navigation.navigate(route as never);
    };

    return (
        <View style={[styles.sectionContainer, { backgroundColor: colors.surface }, containerStyle]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t("settings.sections.app.title") || "App"}</Text>

            <Pressable
                style={({ pressed }) => [
                    styles.itemContainer,
                    {
                        backgroundColor: pressed ? `${colors.primary}08` : 'transparent',
                    },
                ]}
                onPress={handlePress}
            >
                <View style={styles.content}>
                    <View
                        style={[
                            styles.iconContainer,
                            { backgroundColor: `${colors.primary}15` },
                        ]}
                    >
                        <Feather name="globe" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
                        <Text style={[styles.description, { color: colors.textSecondary }]}>
                            {languageDisplay}
                        </Text>
                    </View>
                    <Feather name="chevron-right" size={20} color={colors.textSecondary} />
                </View>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    sectionContainer: {
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        minHeight: 72,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
        marginRight: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
    },
});
