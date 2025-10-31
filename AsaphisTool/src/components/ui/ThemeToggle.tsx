'use client';

import { useTheme } from '@/components/layout/ThemeProvider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const label = theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'System';

  return (
    <button
      onClick={toggleTheme}
      title={`Theme: ${label}`}
      aria-label={`Theme: ${label}`}
      className="inline-flex items-center justify-center p-2 rounded-md text-sm text-foreground/80 hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      {/* Simple icon switch */}
      {theme === 'dark' ? (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      ) : (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M7.05 16.95l-1.414 1.414m12.728 0l-1.414-1.414M7.05 7.05L5.636 5.636" />
        </svg>
      )}
    </button>
  );
}
