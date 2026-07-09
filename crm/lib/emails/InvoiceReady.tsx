import { Html, Head, Body, Preview, Text, Button, Section } from "@react-email/components";
import React from "react";
import { EmailLayout, bodyTextStyle, buttonStyle } from "./shared";

export function getSubject(invoiceNumber: string, amount: string, dueDate: string) {
  return `Invoice ${invoiceNumber} from BluuHQ — ${amount} due ${dueDate}`;
}

export interface InvoiceReadyProps {
  clientName: string;
  invoiceNumber: string;
  amount: string;
  currency: string;
  dueDate: string;
  payUrl: string;
}

export default function InvoiceReady({ clientName, invoiceNumber, amount, currency, dueDate, payUrl }: InvoiceReadyProps) {
  return (
    <Html>
      <Head />
      <Preview>Invoice {invoiceNumber} — {currency} {amount} due {dueDate}</Preview>
      <Body style={{ backgroundColor: "#F1F5F9", margin: 0, padding: "32px 0" }}>
        <EmailLayout heading={`Invoice ${invoiceNumber}`} preview="">
          <Text style={bodyTextStyle}>Hi {clientName},</Text>
          <Text style={bodyTextStyle}>A new invoice is ready for payment:</Text>
          <Section style={{ backgroundColor: "#F8FAFC", borderRadius: "8px", padding: "16px 20px", marginBottom: "24px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {[
                  ["Invoice Number", invoiceNumber],
                  ["Amount Due", `${currency} ${amount}`],
                  ["Due Date", dueDate],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td style={{ padding: "6px 0", color: "#64748B", fontSize: "13px" }}>{label}</td>
                    <td style={{ padding: "6px 0", fontWeight: "600", fontSize: "13px", textAlign: "right" }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
          <Button href={payUrl} style={buttonStyle}>Pay Now</Button>
          <Text style={{ ...bodyTextStyle, marginTop: "20px", fontSize: "13px", color: "#64748B" }}>
            You can also view all your invoices and payment history in your{" "}
            <a href={payUrl} style={{ color: "#1875F2" }}>client portal</a>.
          </Text>
        </EmailLayout>
      </Body>
    </Html>
  );
}
