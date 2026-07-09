import { Html, Head, Body, Preview, Text, Button, Section } from "@react-email/components";
import React from "react";
import { EmailLayout, bodyTextStyle, buttonStyle } from "./shared";

export function getSubject(clientName: string) {
  return `Payment received — thank you, ${clientName}`;
}

export interface PaymentReceiptProps {
  clientName: string;
  invoiceNumber: string;
  amount: string;
  currency: string;
  paidAt: string;
  serviceName: string;
}

export default function PaymentReceipt({ clientName, invoiceNumber, amount, currency, paidAt, serviceName }: PaymentReceiptProps) {
  const portalUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "") + "/portal/invoices";
  return (
    <Html>
      <Head />
      <Preview>Payment confirmed — {currency} {amount} received for invoice {invoiceNumber}</Preview>
      <Body style={{ backgroundColor: "#F1F5F9", margin: 0, padding: "32px 0" }}>
        <EmailLayout heading="Payment Received" preview="">
          <Text style={bodyTextStyle}>Hi {clientName}, thank you for your payment!</Text>
          <Section style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "8px", padding: "16px 20px", marginBottom: "24px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {[
                  ["Invoice Number", invoiceNumber],
                  ["Service", serviceName],
                  ["Amount Paid", `${currency} ${amount}`],
                  ["Paid On", paidAt],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <tr key={label}>
                    <td style={{ padding: "6px 0", color: "#64748B", fontSize: "13px" }}>{label}</td>
                    <td style={{ padding: "6px 0", fontWeight: "600", fontSize: "13px", textAlign: "right" }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
          <Button href={portalUrl} style={buttonStyle}>View Invoice History</Button>
        </EmailLayout>
      </Body>
    </Html>
  );
}
