import { Html, Head, Body, Preview, Text, Button, Section } from "@react-email/components";
import React from "react";
import { EmailLayout, bodyTextStyle, buttonStyle } from "./shared";

export function getSubject(ticketNumber: string, clientName: string) {
  return `New support ticket ${ticketNumber} from ${clientName}`;
}

export interface NewTicketProps {
  clientName: string;
  clientCompany?: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: string;
  description: string;
  reviewUrl: string;
}

const PRIORITY_COLOR: Record<string, string> = {
  urgent: "#DC2626",
  high:   "#EA580C",
  normal: "#2563EB",
  low:    "#64748B",
};

export default function NewTicket({
  clientName,
  clientCompany,
  ticketNumber,
  subject,
  category,
  priority,
  description,
  reviewUrl,
}: NewTicketProps) {
  const priorityColor = PRIORITY_COLOR[priority] ?? "#64748B";

  return (
    <Html>
      <Head />
      <Preview>New ticket {ticketNumber} from {clientName}: {subject}</Preview>
      <Body style={{ backgroundColor: "#F1F5F9", margin: 0, padding: "32px 0" }}>
        <EmailLayout heading="New Support Ticket" preview="">
          <Text style={bodyTextStyle}>
            <strong>{clientName}</strong>{clientCompany ? ` (${clientCompany})` : ""} has submitted a support ticket.
          </Text>

          <Section style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", padding: "16px 20px", marginBottom: "16px" }}>
            <Text style={{ margin: "0 0 4px", fontSize: "12px", color: "#94A3B8", fontWeight: "600", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Ticket</Text>
            <Text style={{ margin: "0 0 12px", fontSize: "16px", fontWeight: "700", color: "#1E293B" }}>{ticketNumber}</Text>

            <Text style={{ margin: "0 0 4px", fontSize: "12px", color: "#94A3B8", fontWeight: "600", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Subject</Text>
            <Text style={{ margin: "0 0 12px", fontSize: "14px", color: "#1E293B" }}>{subject}</Text>

            <Text style={{ margin: "0 0 8px", fontSize: "12px", color: "#94A3B8", fontWeight: "600", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Details</Text>
            <Text style={{ margin: "0", fontSize: "13px", color: "#475569" }}>
              Category: <strong style={{ textTransform: "capitalize" as const }}>{category}</strong>
              {"  ·  "}
              Priority: <strong style={{ color: priorityColor, textTransform: "capitalize" as const }}>{priority}</strong>
            </Text>
          </Section>

          <Section style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px", padding: "16px 20px", marginBottom: "24px" }}>
            <Text style={{ margin: "0 0 6px", fontSize: "12px", color: "#94A3B8", fontWeight: "600", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Description</Text>
            <Text style={{ margin: 0, fontSize: "14px", color: "#1E293B", lineHeight: "1.6", whiteSpace: "pre-wrap" as const }}>{description}</Text>
          </Section>

          <Button href={reviewUrl} style={buttonStyle}>View &amp; Respond</Button>
        </EmailLayout>
      </Body>
    </Html>
  );
}
