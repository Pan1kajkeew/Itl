import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';

export function useTelegram() {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [themeParams, setThemeParams] = useState<any>({});

  useEffect(() => {
    if (WebApp) {
      WebApp.ready();
      WebApp.expand();
      setIsReady(true);
      setUser(WebApp.initDataUnsafe?.user);
      setThemeParams(WebApp.themeParams);

      // Set CSS variables for theme
      document.documentElement.style.setProperty('--tg-theme-bg-color', WebApp.themeParams.bg_color || '#ffffff');
      document.documentElement.style.setProperty('--tg-theme-text-color', WebApp.themeParams.text_color || '#000000');
      document.documentElement.style.setProperty('--tg-theme-hint-color', WebApp.themeParams.hint_color || '#999999');
      document.documentElement.style.setProperty('--tg-theme-link-color', WebApp.themeParams.link_color || '#2481cc');
      document.documentElement.style.setProperty('--tg-theme-button-color', WebApp.themeParams.button_color || '#2481cc');
      document.documentElement.style.setProperty('--tg-theme-button-text-color', WebApp.themeParams.button_text_color || '#ffffff');
    }
  }, []);

  const onClose = () => {
    WebApp.close();
  };

  const onToggleButton = () => {
    if (WebApp.MainButton.isVisible) {
      WebApp.MainButton.hide();
    } else {
      WebApp.MainButton.show();
    }
  };

  return {
    onClose,
    onToggleButton,
    tg: WebApp,
    user,
    isReady,
    themeParams
  };
}
