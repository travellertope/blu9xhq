export const runtime = "nodejs";

import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/apiPermissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { uploadToR2 } from "@/lib/r2";
import { type DocumentProps, Document, Page, Text, View, Image, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import React, { type ReactElement, type JSXElementConstructor } from "react";

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
  logoImage: {
    width: 100,
    objectFit: "contain",
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
  tableHeaderQty: {
    width: 40,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
  },
  tableHeaderUnitPrice: {
    width: 70,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
  },
  tableHeaderAmount: {
    width: 80,
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
  tableRowQty: {
    width: 40,
    textAlign: "center",
  },
  tableRowUnitPrice: {
    width: 70,
    textAlign: "right",
  },
  tableRowAmount: {
    width: 80,
    textAlign: "right",
  },
  subtotalRow: {
    flexDirection: "row",
    padding: "4 8",
    justifyContent: "flex-end",
  },
  subtotalLabel: {
    width: 100,
    textAlign: "right",
    color: "#64748b",
  },
  subtotalValue: {
    width: 80,
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    padding: "8 8",
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  totalLabel: {
    flex: 1,
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
  },
  totalAmount: {
    width: 80,
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
  quantity?: number;
  unitPrice?: number;
  discount?: number;
  amount: number;
}

interface InvoicePDFProps {
  invNumber: string;
  issuedDate: string;
  dueDate: string;
  clientName: string;
  clientCompany?: string;
  lineItems: LineItem[];
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  notes?: string;
  logoSrc?: string;
}

function InvoicePDF({
  invNumber,
  issuedDate,
  dueDate,
  clientName,
  clientCompany,
  lineItems,
  subtotal,
  discount,
  taxRate,
  taxAmount,
  total,
  currency,
  notes,
  logoSrc,
}: InvoicePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {logoSrc
            ? <Image src={logoSrc} style={styles.logoImage} />
            : <Text style={styles.brandName}>BluuHQ</Text>
          }
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
          <Text style={styles.tableHeaderQty}>Qty</Text>
          <Text style={styles.tableHeaderUnitPrice}>Unit Price</Text>
          <Text style={styles.tableHeaderAmount}>Amount</Text>
        </View>

        {lineItems.map((item, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.tableRowDesc}>
              {item.description}
              {(item.discount ?? 0) > 0 ? ` (disc: -${item.discount})` : ""}
            </Text>
            <Text style={styles.tableRowQty}>{item.quantity ?? 1}</Text>
            <Text style={styles.tableRowUnitPrice}>{(item.unitPrice ?? item.amount)?.toLocaleString()}</Text>
            <Text style={styles.tableRowAmount}>{item.amount?.toLocaleString()}</Text>
          </View>
        ))}

        {/* Subtotal / Discount / Tax */}
        {(discount > 0 || taxAmount > 0) && (
          <View style={styles.subtotalRow}>
            <Text style={styles.subtotalLabel}>Subtotal</Text>
            <Text style={styles.subtotalValue}>{currency} {subtotal?.toLocaleString()}</Text>
          </View>
        )}
        {discount > 0 && (
          <View style={styles.subtotalRow}>
            <Text style={styles.subtotalLabel}>Discount</Text>
            <Text style={[styles.subtotalValue, { color: "#ef4444" }]}>-{currency} {discount?.toLocaleString()}</Text>
          </View>
        )}
        {taxAmount > 0 && (
          <View style={styles.subtotalRow}>
            <Text style={styles.subtotalLabel}>Tax{taxRate ? ` (${taxRate}%)` : ""}</Text>
            <Text style={styles.subtotalValue}>+{currency} {taxAmount?.toLocaleString()}</Text>
          </View>
        )}

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
  const tenantId = auth.session.user.tenantId!;

  try {
    const supabase = createSupabaseServerClient();

    const [{ data: invoice, error: fetchErr }, logoSrc] = await Promise.all([
      supabase
        .from("invoices")
        .select("*, clients(contact_name, company_name)")
        .eq("id", params.id)
        .eq("tenant_id", tenantId)
        .maybeSingle(),
      // logo loaded in parallel — no await needed before createElement
      Promise.resolve((() => {
        try {
          const logoPath = path.join(process.cwd(), "public", "logo.png");
          if (fs.existsSync(logoPath)) {
            return `data:image/png;base64,${fs.readFileSync(logoPath).toString("base64")}`;
          }
        } catch { /* fall through */ }
        return undefined;
      })()),
    ]);
    if (fetchErr) throw fetchErr;
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    const lineItems: LineItem[] = invoice.line_items ?? [];

    const pdfElement = React.createElement(InvoicePDF, {
      invNumber: invoice.invoice_number,
      issuedDate: invoice.issued_date,
      dueDate: invoice.due_date,
      clientName: invoice.clients?.contact_name || invoice.clients?.company_name || "",
      clientCompany: invoice.clients?.company_name,
      lineItems,
      subtotal: invoice.subtotal ?? invoice.total,
      discount: invoice.discount ?? 0,
      taxRate: invoice.tax_rate ?? 0,
      taxAmount: invoice.tax_amount ?? 0,
      total: invoice.total,
      currency: invoice.currency,
      notes: invoice.notes,
      logoSrc,
    }) as unknown as ReactElement<DocumentProps, string | JSXElementConstructor<DocumentProps>>;

    const pdfBuffer = await renderToBuffer(pdfElement);

    const invNumber = invoice.invoice_number.replace(/[^a-zA-Z0-9-]/g, "-");
    const key = `invoices/${invoice.id}/invoice-${invNumber}.pdf`;

    await uploadToR2(key, pdfBuffer, "application/pdf");

    // Store just the R2 object key — download routes generate presigned URLs from it
    const { error: updateErr } = await supabase
      .from("invoices")
      .update({ pdf_url: key })
      .eq("id", params.id)
      .eq("tenant_id", tenantId);
    if (updateErr) throw updateErr;

    return new Response(new Uint8Array(pdfBuffer), {
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
