
"use client";

import { useEffect } from "react";
import { initializeRevenueCat } from "@/lib/revenuecat";

type RevenueCatInitializerProps = {
  userId: string;
};

export default function RevenueCatInitializer({
  userId,
}: RevenueCatInitializerProps) {
  useEffect(() => {
    if (!userId) return;

    void initializeRevenueCat(userId);
  }, [userId]);

  return null;
}
