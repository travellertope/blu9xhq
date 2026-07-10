import { Html, Head, Body, Preview, Text, Button, Section } from "@react-email/components";
import React from "react";
import { EmailLayout, bodyTextStyle, buttonStyle } from "./shared";

export function getSubject(daysOverdue: number, invoiceNumber: string) {
  if (daysOverdue === 0) return "Invoice due today";
  return `Invoice ${invoiceNumber} ${daysOverdue} day(s) overdue — action required`;
}

export interface InvoiceReminderProps {
  clientName: string;
  invoiceNumber: string;
  amount: string;
  currency: string;
  dueDate: string;
  daysOverdue: number;
  payUrl: string;
}

export default function InvoiceReminder({ clientName, invoiceNumber, amount, currency, dueDate, daysOverdue, payUrl }: InvoiceReminderProps) {
  const tone =
    daysOverdue === 0
      ? { heading: "Invoice Due Today", opening: `Hi ${clientName}, your invoice ${invoiceNumber} is due today.`, urgency: "Please pay at your earliest convenience." }
      : daysOverdue <= 3
      ? { heading: `Invoice Overdue — ${daysOverdue} Day(s)`, opening: `Hi ${clientName}, your invoice ${invoiceNumber} is now ${daysOverdue} day(s) overdue.`, urgency: "Please make payment as soon as possible to avoid any service interruptions." }
      : { heading: `Urgent: Invoice ${daysOverdue} Days Overdue`, opening: `Hi ${clientName}, your invoice ${invoiceNumber} is ${daysOverdue} days overdue.`, urgency: "This requires immediate attention. Please settle your balance to maintain your services." };

  return (
    <Html>
      <Head />
      <Preview>{tone.opening}</Preview>
      <Body style={{ backgroundColor: "#F1F5F9", margin: 0, padding: "32px 0" }}>
        <EmailLayout heading={tone.heading} preview="">
          <Text style={bodyTextStyle}>{tone.opening}</Text>
          <Text style={bodyTextStyle}>{tone.urgency}</Text>
          <Section style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "16px 20px", marginBottom: "24px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {[
                  ["Invoice Number", invoiceNumber],
                  ["Amount Due", `${currency} ${amount}`],
                  ["Due Date", dueDate],
                  daysOverdue > 0 ? ["Days Overdue", String(daysOverdue)] : null,
                ]
                  .filter(Boolean)
                  .map((row) => (
                    <tr key={row![0]}>
                      <td style={{ padding: "6px 0", color: "#64748B", fontSize: "13px" }}>{row![0]}</td>
                      <td style={{ padding: "6px 0", fontWeight: "600", fontSize: "13px", textAlign: "right", color: daysOverdue > 0 ? "#DC2626" : "inherit" }}>{row![1]}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </Section>
          <Button href={payUrl} style={{ ...buttonStyle, backgroundColor: "#DC2626" }}>Pay Now</Button>
        </EmailLayout>
      </Body>
    </Html>
  );
}
