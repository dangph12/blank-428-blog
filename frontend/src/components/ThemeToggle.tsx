import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get saved theme from localStorage
    const savedTheme =
      (localStorage.getItem('theme') as 'light' | 'dark' | 'auto') || 'auto';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark' | 'auto') => {
    const html = document.documentElement;

    if (newTheme === 'auto') {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      html.setAttribute('data-theme', newTheme);
    }

    localStorage.setItem('theme', newTheme);
  };

  const cycleTheme = () => {
    const modes: ('auto' | 'light' | 'dark')[] = ['auto', 'light', 'dark'];
    const currentIndex = modes.indexOf(theme);
    const nextTheme = modes[(currentIndex + 1) % 3];

    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  if (!mounted) return null;

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'auto':
        return '🔄';
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className='theme-toggle'
      aria-label='Toggle theme'
      title={`Current: ${theme}`}
    >
      <span className='theme-icon'>{getIcon()}</span>
      <style>{`
        .theme-toggle {
          position: fixed;
          top: 1rem;
          right: 1rem;
          z-index: 100;
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          background: var(--color-wrap);
          box-shadow: var(--shadow-card);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          border: 2px solid var(--color-border);
        }

        .theme-toggle:hover {
          transform: scale(1.1);
          box-shadow: var(--shadow-card-hover);
        }

        .theme-icon {
          font-size: 1.5rem;
          line-height: 1;
        }

        @media (max-width: 768px) {
          .theme-toggle {
            width: 2.5rem;
            height: 2.5rem;
            top: 0.75rem;
            right: 0.75rem;
          }
          
          .theme-icon {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </button>
  );
}
