import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';

/**
 * Plant floor quick navigation hotkey handler.
 * Enables factory workers to switch between operational consoles using industrial keyboards.
 */
export function useFactoryHotkeys(): void {
  const navigate = useNavigate();
  const { setUserGuideVisible, toggleSidebar, toggleKioskMode, setShiftHandoverVisible } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow F1 or Shift+? anytime
      if (e.key === 'F1' || (e.shiftKey && e.key === '?')) {
        e.preventDefault();
        setUserGuideVisible(true);
        return;
      }

      // Check if user is typing in form controls
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isInput =
        activeTag === 'input' ||
        activeTag === 'textarea' ||
        document.activeElement?.getAttribute('contenteditable') === 'true';

      if (isInput) {
        return;
      }

      // Alt key combinations for instant console switching
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const key = e.key.toLowerCase();
        switch (key) {
          case 'd':
            e.preventDefault();
            navigate('/dashboard');
            break;
          case 'p':
            e.preventDefault();
            navigate('/production');
            break;
          case 'i':
            e.preventDefault();
            navigate('/inventory');
            break;
          case 'b': // Buying / Purchasing
            e.preventDefault();
            navigate('/purchasing');
            break;
          case 's': // Sales
            e.preventDefault();
            navigate('/sales');
            break;
          case 'm': // Master Data / Items
            e.preventDefault();
            navigate('/items');
            break;
          case 'a': // Audit Logs
            e.preventDefault();
            navigate('/audit');
            break;
          case 't': // Terminal Settings
            e.preventDefault();
            navigate('/settings');
            break;
          case 'k': // TV Kiosk Mode
            e.preventDefault();
            toggleKioskMode();
            break;
          case 'h': // Shift Handover Docket
            e.preventDefault();
            setShiftHandoverVisible(true);
            break;
          case 'x': // Toggle Sidebar
            e.preventDefault();
            toggleSidebar();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, setUserGuideVisible, toggleSidebar, toggleKioskMode, setShiftHandoverVisible]);
}
