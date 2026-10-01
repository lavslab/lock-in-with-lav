import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.lockinwithlav.app",
  appName: "Lock In With Lav",
  webDir: "public",

  server: {
    url: "https://www.lockinwithlav.com",
    cleartext: false,
  },

  backgroundColor: "#F7F1ED",

  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
      backgroundColor: "#F7F1ED",
      showSpinner: false,
      launchFadeOutDuration: 250,
    },
  },
};

export default config;