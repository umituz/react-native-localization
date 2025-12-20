// @ts-ignore - Optional peer dependency
import { useNavigation } from '@react-navigation/native';
import { useLocalization } from '../hooks/useLocalization';
import { languageRegistry } from '../config/languagesData';


export const useLanguageNavigation = (navigationScreen: string) => {
  const navigation = useNavigation();
  const { currentLanguage } = useLocalization();
  const currentLang = languageRegistry.getLanguageByCode(currentLanguage) || languageRegistry.getDefaultLanguage();

  const navigateToLanguageSelection = () => {
    if (navigation && navigationScreen) {
      navigation.navigate(navigationScreen as never);
    }
  };

  return { currentLang, navigateToLanguageSelection };
};

