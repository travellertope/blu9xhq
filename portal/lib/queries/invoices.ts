export interface GQLInvoice {
  databaseId: number;
  title: string;
  acf: {
    invNumber: string;
    invClient: number;
    invStatus: string;
    invTotal: number;
    invCurrency: string;
    invDueDate: string;
    invIssuedDate: string;
    invPaidAt?: string;
  };
}

export interface GQLInvoicesResponse {
  invoices: {
    nodes: GQLInvoice[];
    pageInfo: { hasNextPage: boolean; endCursor: string };
  };
}

export const GET_INVOICES = `
  query GetInvoices($first: Int = 20, $after: String) {
    invoices(first: $first, after: $after, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        databaseId
        title
        acf {
          invNumber: inv_number
          invClient: inv_client
          invStatus: inv_status
          invTotal: inv_total
          invCurrency: inv_currency
          invDueDate: inv_due_date
          invIssuedDate: inv_issued_date
          invPaidAt: inv_paid_at
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_INVOICE = `
  query GetInvoice($id: ID!) {
    invoice(id: $id, idType: DATABASE_ID) {
      databaseId
      title
      acf {
        invNumber: inv_number
        invClient: inv_client
        invStatus: inv_status
        invTotal: inv_total
        invCurrency: inv_currency
        invDueDate: inv_due_date
        invIssuedDate: inv_issued_date
        invPaidAt: inv_paid_at
        invNotes: inv_notes
        invLineItems: inv_line_items
        invPdfUrl: inv_pdf_url
      }
    }
  }
`;

export const GET_CLIENT_INVOICES = `
  query GetClientInvoices($clientIds: [ID!]!, $first: Int = 20, $after: String) {
    invoices(
      first: $first
      after: $after
      where: {
        metaQuery: { metaArray: [{ key: "inv_client", value: $clientIds, compare: IN }] }
        orderby: { field: DATE, order: DESC }
      }
    ) {
      nodes {
        databaseId
        acf {
          invNumber: inv_number
          invStatus: inv_status
          invTotal: inv_total
          invCurrency: inv_currency
          invDueDate: inv_due_date
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
