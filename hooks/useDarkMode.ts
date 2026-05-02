import { useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

/**
 * A custom hook to manage and persist the theme (light/dark mode).
 *
 * @returns A tuple containing the current theme ('light' or 'dark') and a function to toggle it.
 */
export function useDarkMode(): [string, () => void] {
    const [theme, setTheme] = useLocalStorage<string>('theme', 'dark');

    // Effect to apply the correct class to the <html> element for Tailwind CSS.
    useEffect(() => {
        const root = window.document.documentElement;
        const isDark = theme === 'dark';
        
        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    // A memoized function to toggle the theme between 'light' and 'dark'.
    const toggleTheme = useCallback(() => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    }, [setTheme]);

    return [theme, toggleTheme];
}
