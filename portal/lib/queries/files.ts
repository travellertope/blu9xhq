export interface GQLFile {
  databaseId: number;
  title: string;
  date: string;
  acf: {
    fileClient: number;
    fileVisibility: string;
    fileCategory: string;
    fileOriginalName: string;
    fileMimeType: string;
    fileSize: number;
    fileR2Key: string;
    fileUploadedBy: number;
    fileDescription?: string;
  };
}

export interface GQLFilesResponse {
  files: {
    nodes: GQLFile[];
    pageInfo: { hasNextPage: boolean; endCursor: string };
  };
}

export const GET_FILES = `
  query GetFiles($first: Int = 12, $after: String) {
    files(first: $first, after: $after, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        databaseId
        title
        date
        acf {
          fileClient: file_client
          fileVisibility: file_visibility
          fileCategory: file_category
          fileOriginalName: file_original_name
          fileMimeType: file_mime_type
          fileSize: file_size
          fileR2Key: file_r2_key
          fileUploadedBy: file_uploaded_by
          fileDescription: file_description
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_CLIENT_FILES = `
  query GetClientFiles($clientIds: [ID!]!, $first: Int = 12, $after: String) {
    files(
      first: $first
      after: $after
      where: {
        metaQuery: { metaArray: [{ key: "file_client", value: $clientIds, compare: IN }] }
        orderby: { field: DATE, order: DESC }
      }
    ) {
      nodes {
        databaseId
        title
        date
        acf {
          fileClient: file_client
          fileVisibility: file_visibility
          fileCategory: file_category
          fileOriginalName: file_original_name
          fileMimeType: file_mime_type
          fileSize: file_size
          fileUploadedBy: file_uploaded_by
          fileDescription: file_description
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
