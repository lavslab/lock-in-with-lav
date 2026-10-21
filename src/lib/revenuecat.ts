
import { Capacitor } from "@capacitor/core";
import { Purchases } from "@revenuecat/purchases-capacitor";

let isConfigured = false;
let currentUserId: string | null = null;

export async function initializeRevenueCat(userId: string) {
  // Only run inside the native iOS app.
  if (typeof window === "undefined") return false;
  if (!Capacitor.isNativePlatform()) return false;
  if (Capacitor.getPlatform() !== "ios") return false;

  if (!userId) return false;

  const apiKey =
    process.env.NEXT_PUBLIC_REVENUECAT_APPLE_API_KEY;

  if (!apiKey) {
    console.warn("RevenueCat Apple API key is missing.");
    return false;
  }

  try {
    if (!isConfigured) {
      await Purchases.configure({
        apiKey,
        appUserID: userId,
      });

      isConfigured = true;
      currentUserId = userId;

      return true;
    }

    // Handle a different Supabase user signing in.
    if (currentUserId !== userId) {
      await Purchases.logIn({ appUserID: userId });
      currentUserId = userId;
    }

    return true;
  } catch (error) {
    console.error("RevenueCat initialization failed:", error);
    return false;

    
  }

  
}

export function clearRevenueCatUserTracking() {
  currentUserId = null;
}
