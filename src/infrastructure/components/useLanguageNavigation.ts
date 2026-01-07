// @ts-ignore - Optional peer dependency
import { useNavigation } from '@react-navigation/native';
import { useLocalization } from '../hooks/useLocalization';
import { languageRepository } from '../repository/LanguageRepository';


export const useLanguageNavigation = (navigationScreen: string) => {
  const navigation = useNavigation();
  const { currentLanguage } = useLocalization();
  const currentLang = languageRepository.getLanguageByCode(currentLanguage) || languageRepository.getDefaultLanguage();

  const navigateToLanguageSelection = () => {
    if (navigation && navigationScreen) {
      navigation.navigate(navigationScreen as never);
    }
  };

  return { currentLang, navigateToLanguageSelection };
};

