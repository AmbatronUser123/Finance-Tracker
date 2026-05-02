import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ToastProvider, useToast } from './contexts/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';

// Import global styles
import './global.css';

// Component to handle PWA installation prompt
const PWAInstallPrompt = () => {
  const [, setDeferredPrompt] = useState<Event | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const installEvent = e;
      addToast({
        message: 'Install Finance Tracker on your device for a better experience',
        type: 'info',
        action: {
          text: 'Install',
          onClick: () => {
            const ev = installEvent as any;
            if (ev && ev.prompt) {
              ev.prompt();
              ev.userChoice?.then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                  console.log('User accepted the install prompt');
                } else {
                  console.log('User dismissed the install prompt');
                }
                setDeferredPrompt(null);
              });
            }
          },
        },
        duration: 10000,
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [addToast]);

  return null;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Register the service worker for PWA (auto update)
registerSW({ immediate: true });

const AppWithPWA = () => (
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <PWAInstallPrompt />
          <App />
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

root.render(<AppWithPWA />);