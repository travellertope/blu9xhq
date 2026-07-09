export interface GQLService {
  databaseId: number;
  title: string;
  acf: {
    serviceType: string;
    description: string;
    defaultPrice: number;
    billingCycle: string;
    status: string;
  };
}

export interface GQLServicesResponse {
  services: {
    nodes: GQLService[];
    pageInfo: { hasNextPage: boolean; endCursor: string };
  };
}

export const GET_SERVICES = `
  query GetServices($first: Int = 50, $after: String) {
    services(first: $first, after: $after) {
      nodes {
        databaseId
        title
        acf {
          serviceType: service_type
          description
          defaultPrice: default_price
          billingCycle: billing_cycle
          status
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_SERVICE = `
  query GetService($id: ID!) {
    service(id: $id, idType: DATABASE_ID) {
      databaseId
      title
      acf {
        serviceType: service_type
        description
        defaultPrice: default_price
        billingCycle: billing_cycle
        status
      }
    }
  }
`;
