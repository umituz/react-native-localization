// @ts-ignore - Optional peer dependency
import { useAppNavigation } from '@umituz/react-native-design-system';
import { useLocalization } from '../hooks/useLocalization';
import { languageRepository } from '../repository/LanguageRepository';


export const useLanguageNavigation = (navigationScreen: string) => {
  const navigation = useAppNavigation();
  const { currentLanguage } = useLocalization();
  const currentLang = languageRepository.getLanguageByCode(currentLanguage) || languageRepository.getDefaultLanguage();

  const navigateToLanguageSelection = () => {
    if (navigation && navigationScreen) {
      navigation.navigate(navigationScreen as never);
    }
  };

  return { currentLang, navigateToLanguageSelection };
};

