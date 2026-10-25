import { useColorScheme } from 'react-native';

/**
 * The app only has light and dark palettes. Since React Native 0.83, useColorScheme()
 * can also return 'unspecified' (or null), so map anything that isn't 'dark' to 'light'.
 */
export function useTheme(): 'light' | 'dark' {
  return useColorScheme() === 'dark' ? 'dark' : 'light';
}
