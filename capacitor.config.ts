import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.lockinwithlav.app",
  appName: "Lock In With Lav",
  webDir: "public",

  server: {
    url: "https://www.lockinwithlav.com",
    cleartext: false,
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: "#F7F1ED",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      iosSpinnerStyle: "small",
      launchFadeOutDuration: 250,
    },
  },
};

export default config;