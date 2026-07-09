export interface GQLSubscription {
  databaseId: number;
  title: string;
  acf: {
    clientId: number;
    serviceId: number;
    status: string;
    amount: number;
    currency: string;
    billingCycle: string;
    startDate: string;
    nextBillingDate: string;
    paymentGateway: string;
  };
}

export interface GQLSubscriptionsResponse {
  subscriptions: {
    nodes: GQLSubscription[];
    pageInfo: { hasNextPage: boolean; endCursor: string };
  };
}

export const GET_SUBSCRIPTIONS = `
  query GetSubscriptions($first: Int = 20, $after: String) {
    subscriptions(first: $first, after: $after) {
      nodes {
        databaseId
        title
        acf {
          clientId: sub_client
          serviceId: sub_service
          status: sub_status
          amount: sub_amount
          currency: sub_currency
          billingCycle: sub_billing_cycle
          startDate: sub_start_date
          nextBillingDate: sub_next_billing_date
          paymentGateway: payment_gateway
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_SUBSCRIPTION = `
  query GetSubscription($id: ID!) {
    subscription(id: $id, idType: DATABASE_ID) {
      databaseId
      title
      acf {
        clientId: sub_client
        serviceId: sub_service
        status: sub_status
        amount: sub_amount
        currency: sub_currency
        billingCycle: sub_billing_cycle
        startDate: sub_start_date
        nextBillingDate: sub_next_billing_date
        paymentGateway: payment_gateway
      }
    }
  }
`;

export const GET_CLIENT_SUBSCRIPTIONS = `
  query GetClientSubscriptions($clientIds: [ID!]!, $first: Int = 50) {
    subscriptions(
      first: $first
      where: { metaQuery: { metaArray: [{ key: "sub_client", value: $clientIds, compare: IN }] } }
    ) {
      nodes {
        databaseId
        title
        acf {
          clientId: sub_client
          status: sub_status
          amount: sub_amount
          currency: sub_currency
          billingCycle: sub_billing_cycle
          nextBillingDate: sub_next_billing_date
          paymentGateway: payment_gateway
        }
      }
    }
  }
`;
