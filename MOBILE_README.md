# Finance Tracker Mobile App

This is a Progressive Web App (PWA) version of the Finance Tracker that can be installed on your Android device.

## Features

- 📱 Installable on Android devices
- 📊 Track your income and expenses
- 🎯 Set and manage financial goals
- 📱 Works offline
- 🔄 Automatic updates

## How to Install on Android

1. Open Chrome or any Chromium-based browser (like Microsoft Edge) on your Android device
2. Navigate to the app's URL (where it's deployed)
3. Tap the menu (three dots) in the top-right corner
4. Select "Install app" or "Add to Home screen"
5. Confirm the installation
6. The app will now be available on your home screen

## Development

To run the app locally:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to the local development URL (usually http://localhost:5173)

## Building for Production

To build the app for production:

```bash
npm run build
```

This will create a `dist` folder with the production-ready files that can be deployed to any static hosting service.

## Browser Support

This PWA works on all modern browsers that support Service Workers and the Web App Manifest, including:

- Google Chrome (Android)
- Microsoft Edge (Android)
- Samsung Internet
- Mozilla Firefox (Android)
- Safari (iOS 11.3+)

## Offline Support

The app works offline thanks to service workers. Your data is stored locally in your browser's IndexedDB.

## License

This project is licensed under the MIT License.
