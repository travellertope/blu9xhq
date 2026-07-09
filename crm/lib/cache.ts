/**
 * Cached wrappers for frequently-read, rarely-changed data.
 * Uses Next.js unstable_cache with per-route revalidation windows.
 *
 * Do NOT use for: credential reveal, payments, POST/PATCH/DELETE.
 */
import { unstable_cache } from "next/cache";
import {
  listClientPosts,
  wpRestList,
  listSubscriptionsByClient,
  listInvoices,
  type WPServicePost,
} from "./wp-api";

export const getCachedClients = unstable_cache(
  (params: Parameters<typeof listClientPosts>[0]) => listClientPosts(params),
  ["admin-clients"],
  { revalidate: 60 }
);

export const getCachedServices = unstable_cache(
  () => wpRestList<WPServicePost>("/wp/v2/bluu_service", { per_page: 100 }),
  ["admin-services"],
  { revalidate: 120 }
);

export const getCachedClientSubscriptions = (clientId: number) =>
  unstable_cache(
    () => listSubscriptionsByClient(clientId),
    [`client-subs-${clientId}`],
    { revalidate: 10 }
  )();

export const getCachedPortalInvoices = (clientId: number) =>
  unstable_cache(
    () => listInvoices({ clientId, per_page: 50 }),
    [`portal-invoices-${clientId}`],
    { revalidate: 10 }
  )();
