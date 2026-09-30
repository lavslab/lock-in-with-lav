import { createBrowserClient } from "@supabase/ssr";
import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

const capacitorStorage = {
  async getItem(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key });
    return value;
  },

  async setItem(key: string, value: string): Promise<void> {
    await Preferences.set({
      key,
      value,
    });
  },

  async removeItem(key: string): Promise<void> {
    await Preferences.remove({ key });
  },
};

let nativeClient: SupabaseClient | null = null;

export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  if (
    typeof window !== "undefined" &&
    Capacitor.isNativePlatform()
  ) {
    if (!nativeClient) {
      nativeClient = createSupabaseClient(
        supabaseUrl,
        supabaseKey,
        {
          auth: {
            storage: capacitorStorage,
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false,
          },
        }
      );
    }

    return nativeClient;
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseKey
  );
}