// @ts-ignore - Optional peer dependency
import { useNavigation } from '@react-navigation/native';
import { useLocalization } from '../storage/LocalizationStore';
import { getLanguageByCode, getDefaultLanguage } from '../config/languages';
import { Language } from '../../domain/repositories/ILocalizationRepository';

export const useLanguageNavigation = (navigationScreen: string) => {
  const navigation = useNavigation();
  const { currentLanguage } = useLocalization();
  const currentLang = getLanguageByCode(currentLanguage) || getDefaultLanguage();

  const navigateToLanguageSelection = () => {
    if (navigation && navigationScreen) {
      navigation.navigate(navigationScreen as never);
    }
  };

  return { currentLang, navigateToLanguageSelection };
};

