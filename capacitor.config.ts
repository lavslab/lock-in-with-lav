import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.lockinwithlav.app",
  appName: "Lock In With Lav",
  webDir: "public",

  server: {
    url: "https://www.lockinwithlav.com",
    cleartext: false,
  },
};

export default config;