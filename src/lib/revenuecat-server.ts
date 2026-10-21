
import "server-only";

const REVENUECAT_API_BASE =
  "https://api.revenuecat.com/v2";

export async function getRevenueCatCustomer(
  appUserId: string
) {
  const apiKey = process.env.REVENUECAT_SECRET_API_KEY;
  const projectId = process.env.REVENUECAT_PROJECT_ID;

  if (!apiKey || !projectId) {
    throw new Error(
      "RevenueCat server configuration is missing."
    );
  }

  if (!appUserId) {
    throw new Error("RevenueCat customer ID is required.");
  }

  const url =
    `${REVENUECAT_API_BASE}/projects/` +
    `${encodeURIComponent(projectId)}/customers/` +
    `${encodeURIComponent(appUserId)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `RevenueCat customer lookup failed: ${response.status}`
    );
  }

  return response.json();
}
