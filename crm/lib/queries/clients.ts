export interface GQLClient {
  id: string;
  databaseId: number;
  title: string;
  acf: {
    contactName: string;
    companyName: string;
    portalEmail: string;
    status: string;
    healthStatus: string;
    activeSubscriptionCount: number;
    tags: string;
    notes?: string;
  };
}

export interface GQLClientsResponse {
  clients: {
    nodes: GQLClient[];
    pageInfo: { hasNextPage: boolean; endCursor: string };
  };
}

export const GET_CLIENTS = `
  query GetClients($first: Int = 20, $after: String, $search: String) {
    clients(
      first: $first
      after: $after
      where: { search: $search }
    ) {
      nodes {
        id
        databaseId
        title
        acf {
          contactName: contact_name
          companyName: company_name
          portalEmail: portal_email
          status
          healthStatus: health_status
          activeSubscriptionCount: active_subscription_count
          tags
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_CLIENT = `
  query GetClient($id: ID!) {
    client(id: $id, idType: DATABASE_ID) {
      id
      databaseId
      title
      acf {
        contactName: contact_name
        companyName: company_name
        portalEmail: portal_email
        status
        healthStatus: health_status
        healthOverrideNote: health_override_note
        activeSubscriptionCount: active_subscription_count
        tags
        notes
        wpUserId: wp_user_id
      }
    }
  }
`;

export const SEARCH_CLIENTS = `
  query SearchClients($search: String!, $first: Int = 10) {
    clients(first: $first, where: { search: $search }) {
      nodes {
        databaseId
        title
        acf {
          contactName: contact_name
          companyName: company_name
          portalEmail: portal_email
          status
        }
      }
    }
  }
`;
