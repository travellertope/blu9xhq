export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/apiPermissions";
import { getInvoice, updateInvoice, getClientPost } from "@/lib/wp-api";
import { uploadToR2 } from "@/lib/r2";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import React from "react";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 48,
    color: "#1e293b",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  brandName: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  invoiceLabel: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    textAlign: "right",
  },
  metaBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  metaLabel: {
    color: "#64748b",
    marginBottom: 2,
  },
  metaValue: {
    fontFamily: "Helvetica-Bold",
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    padding: "6 8",
    marginBottom: 4,
  },
  tableHeaderDesc: {
    flex: 1,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
  },
  tableHeaderAmount: {
    width: 100,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
  },
  tableRow: {
    flexDirection: "row",
    padding: "6 8",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  tableRowDesc: {
    flex: 1,
  },
  tableRowAmount: {
    width: 100,
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    padding: "8 8",
    marginTop: 8,
  },
  totalLabel: {
    flex: 1,
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
  },
  totalAmount: {
    width: 100,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
  },
  notes: {
    marginTop: 24,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
  },
  notesLabel: {
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    color: "#64748b",
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 9,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
  },
});

interface LineItem {
  description: string;
  amount: number;
}

interface InvoicePDFProps {
  invNumber: string;
  issuedDate: string;
  dueDate: string;
  clientName: string;
  clientCompany?: string;
  lineItems: LineItem[];
  total: number;
  currency: string;
  notes?: string;
}

function InvoicePDF({
  invNumber,
  issuedDate,
  dueDate,
  clientName,
  clientCompany,
  lineItems,
  total,
  currency,
  notes,
}: InvoicePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brandName}>BluuHQ</Text>
          <Text style={styles.invoiceLabel}>TAX INVOICE</Text>
        </View>

        {/* Meta */}
        <View style={styles.metaBlock}>
          <View>
            <Text style={styles.metaLabel}>Bill To</Text>
            <Text style={styles.metaValue}>{clientName}</Text>
            {clientCompany ? <Text>{clientCompany}</Text> : null}
          </View>
          <View>
            <Text style={styles.metaLabel}>Invoice Number</Text>
            <Text style={styles.metaValue}>{invNumber}</Text>
            <Text style={[styles.metaLabel, { marginTop: 8 }]}>Issue Date</Text>
            <Text>{issuedDate}</Text>
            <Text style={[styles.metaLabel, { marginTop: 8 }]}>Due Date</Text>
            <Text style={styles.metaValue}>{dueDate}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        {/* Table */}
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderDesc}>Description</Text>
          <Text style={styles.tableHeaderAmount}>Amount ({currency})</Text>
        </View>

        {lineItems.map((item, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.tableRowDesc}>{item.description}</Text>
            <Text style={styles.tableRowAmount}>{item.amount?.toLocaleString()}</Text>
          </View>
        ))}

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>
            {currency} {total?.toLocaleString()}
          </Text>
        </View>

        {/* Notes */}
        {notes ? (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text>{notes}</Text>
          </View>
        ) : null}

        {/* Footer */}
        <Text style={styles.footer}>
          Pay via your client portal or contact us with any questions.
        </Text>
      </Page>
    </Document>
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireSession(req);
  if (auth instanceof NextResponse) return auth;

  const postId = parseInt(params.id, 10);
  if (isNaN(postId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const [invoice, ] = await Promise.all([getInvoice(postId)]);
    const clientPost = await getClientPost(invoice.acf.inv_client);

    let lineItems: LineItem[] = [];
    try {
      lineItems = JSON.parse(invoice.acf.inv_line_items ?? "[]");
    } catch {
      lineItems = [];
    }

    const pdfBuffer = await renderToBuffer(
      React.createElement(InvoicePDF, {
        invNumber: invoice.acf.inv_number,
        issuedDate: invoice.acf.inv_issued_date,
        dueDate: invoice.acf.inv_due_date,
        clientName: clientPost.acf.contact_name || clientPost.title.rendered,
        clientCompany: clientPost.acf.company_name,
        lineItems,
        total: invoice.acf.inv_total,
        currency: invoice.acf.inv_currency,
        notes: invoice.acf.inv_notes,
      })
    );

    const invNumber = invoice.acf.inv_number.replace(/[^a-zA-Z0-9-]/g, "-");
    const key = `invoices/${postId}/invoice-${invNumber}.pdf`;

    await uploadToR2(key, pdfBuffer, "application/pdf");

    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL ?? ""}/${key}`;
    await updateInvoice(postId, { acf: { inv_pdf_url: publicUrl } });

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${invNumber}.pdf"`,
      },
    });
  } catch (err) {
    console.error("[POST /api/admin/invoices/[id]/pdf]", err);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
