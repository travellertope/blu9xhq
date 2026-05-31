export interface GQLCommunication {
  databaseId: number;
  title: string;
  date: string;
  acf: {
    commClient: number;
    commType: string;
    commDirection: string;
    commContent: string;
    commMoodScore?: number;
    commMoodLabel?: string;
    commLoggedBy: string;
    followUpDate?: string;
    followUpComplete?: boolean;
  };
}

export interface GQLCommunicationsResponse {
  communications: {
    nodes: GQLCommunication[];
    pageInfo: { hasNextPage: boolean; endCursor: string };
  };
}

export const GET_COMMUNICATIONS = `
  query GetCommunications($first: Int = 20, $after: String) {
    communications(
      first: $first
      after: $after
      where: { orderby: { field: DATE, order: DESC } }
    ) {
      nodes {
        databaseId
        title
        date
        acf {
          commClient: comm_client
          commType: comm_type
          commDirection: comm_direction
          commContent: comm_content
          commMoodScore: comm_mood_score
          commMoodLabel: comm_mood_label
          commLoggedBy: comm_logged_by
          followUpDate: follow_up_date
          followUpComplete: follow_up_complete
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_CLIENT_COMMUNICATIONS = `
  query GetClientCommunications($clientIds: [ID!]!, $first: Int = 20, $after: String) {
    communications(
      first: $first
      after: $after
      where: {
        metaQuery: { metaArray: [{ key: "comm_client", value: $clientIds, compare: IN }] }
        orderby: { field: DATE, order: DESC }
      }
    ) {
      nodes {
        databaseId
        title
        date
        acf {
          commClient: comm_client
          commType: comm_type
          commDirection: comm_direction
          commContent: comm_content
          commMoodScore: comm_mood_score
          commMoodLabel: comm_mood_label
          commLoggedBy: comm_logged_by
          followUpDate: follow_up_date
          followUpComplete: follow_up_complete
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
