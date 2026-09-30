import { createBrowserClient } from "@supabase/ssr";
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

const capacitorStorage = {
  getItem: async (key: string): Promise<string | null> => {
    const { value } = await Preferences.get({ key });
    return value;
  },

  setItem: async (key: string, value: string): Promise<void> => {
    await Preferences.set({
      key,
      value,
    });
  },

  removeItem: async (key: string): Promise<void> => {
    await Preferences.remove({ key });
  },
};

export function createClient() {
  const isNative = Capacitor.isNativePlatform();

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    isNative
      ? {
          auth: {
            storage: capacitorStorage,
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        }
      : undefined
  );
}