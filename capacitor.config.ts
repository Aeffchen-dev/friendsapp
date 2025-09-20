import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.aad5b0980a8a4f5386685add20cfbe85',
  appName: 'friendsapp',
  webDir: 'dist',
  server: {
    url: 'https://aad5b098-0a8a-4f53-8668-5add20cfbe85.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Motion: {
      intervalMilliseconds: 16
    }
  }
};

export default config;