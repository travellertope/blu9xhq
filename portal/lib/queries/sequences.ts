export interface GQLSequence {
  databaseId: number;
  title: string;
  acf: {
    seqTrigger: string;
    seqStatus: string;
    seqLoopsId?: string;
    seqDescription?: string;
    seqEnrolledCount?: number;
  };
}

export interface GQLSequencesResponse {
  sequences: {
    nodes: GQLSequence[];
    pageInfo: { hasNextPage: boolean; endCursor: string };
  };
}

export const GET_SEQUENCES = `
  query GetSequences($first: Int = 50) {
    sequences(first: $first, where: { orderby: { field: TITLE, order: ASC } }) {
      nodes {
        databaseId
        title
        acf {
          seqTrigger: seq_trigger
          seqStatus: seq_status
          seqLoopsId: seq_loops_id
          seqDescription: seq_description
          seqEnrolledCount: seq_enrolled_count
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_SEQUENCE = `
  query GetSequence($id: ID!) {
    sequence(id: $id, idType: DATABASE_ID) {
      databaseId
      title
      acf {
        seqTrigger: seq_trigger
        seqStatus: seq_status
        seqLoopsId: seq_loops_id
        seqDescription: seq_description
        seqEnrolledCount: seq_enrolled_count
      }
    }
  }
`;
