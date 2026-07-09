import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const WORDPRESS_GRAPHQL_URL = process.env.WORDPRESS_GRAPHQL_URL!;

// WP Application Password credentials for server-side admin requests
const WP_APP_USERNAME = process.env.WP_APP_USERNAME!;
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD!;

function makeAuthHeader(): string {
  const credentials = Buffer.from(
    `${WP_APP_USERNAME}:${WP_APP_PASSWORD}`
  ).toString("base64");
  return `Basic ${credentials}`;
}

// ─── Authenticated client (server-side only, admin operations) ────────────────

const httpLink = createHttpLink({ uri: WORDPRESS_GRAPHQL_URL });

const authLink = setContext((_, { headers }) => ({
  headers: {
    ...headers,
    Authorization: makeAuthHeader(),
  },
}));

export const wpClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: { fetchPolicy: "no-cache" },
    mutate: { fetchPolicy: "no-cache" },
  },
});

// ─── Public client (no auth — for public WP data if needed) ──────────────────

export const wpPublicClient = new ApolloClient({
  link: createHttpLink({ uri: WORDPRESS_GRAPHQL_URL }),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: { fetchPolicy: "no-cache" },
  },
});

// ─── Re-usable query helper ───────────────────────────────────────────────────

export async function wpQuery<T = unknown>(
  query: Parameters<typeof wpClient.query>[0]["query"],
  variables?: Record<string, unknown>
): Promise<T> {
  // Apollo throws ApolloError on network/GraphQL errors when errorPolicy is not set
  const result = await wpClient.query({ query, variables });
  return result.data as T;
}

export async function wpMutate<T = unknown>(
  mutation: Parameters<typeof wpClient.mutate>[0]["mutation"],
  variables?: Record<string, unknown>
): Promise<T> {
  const result = await wpClient.mutate({ mutation, variables });
  if (!result.data) throw new Error("Mutation returned no data");
  return result.data as T;
}
