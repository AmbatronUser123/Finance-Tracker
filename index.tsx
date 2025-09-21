import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ToastProvider, useToast } from './contexts/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import { BrowserRouter } from 'react-router-dom';

// Import global styles
import './global.css';

// Component to handle PWA installation prompt
const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      
      // Show a custom install prompt
      addToast({
        message: 'Install Finance Tracker on your device for a better experience',
        type: 'info',
        action: {
          text: 'Install',
          onClick: () => {
            if (deferredPrompt) {
              // Show the install prompt
              (deferredPrompt as any).prompt();
              // Wait for the user to respond to the prompt
              (deferredPrompt as any).userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                  console.log('User accepted the install prompt');
                } else {
                  console.log('User dismissed the install prompt');
                }
                // Reset the deferred prompt variable
                setDeferredPrompt(null);
              });
            }
          },
        },
        duration: 10000, // Show for 10 seconds
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if the app is already installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [deferredPrompt, addToast]);

  return null;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

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