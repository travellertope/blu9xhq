import { Html, Head, Body, Preview, Text, Button, Section } from "@react-email/components";
import React from "react";
import { EmailLayout, bodyTextStyle, buttonStyle } from "./shared";

export interface TicketSlaBreachedProps {
  ticketNumber: string;
  subject: string;
  clientName: string;
  priority: string;
  breachType: "response" | "resolve";
  assignedTo?: string;
  ticketUrl: string;
}

export function getSubject(ticketNumber: string, breachType: "response" | "resolve") {
  return `SLA ${breachType} breach — ${ticketNumber}`;
}

export default function TicketSlaBreached({
  ticketNumber,
  subject,
  clientName,
  priority,
  breachType,
  assignedTo,
  ticketUrl,
}: TicketSlaBreachedProps) {
  return (
    <Html>
      <Head />
      <Preview>SLA {breachType} breach on ticket {ticketNumber}</Preview>
      <Body style={{ backgroundColor: "#F1F5F9", margin: 0, padding: "32px 0" }}>
        <EmailLayout heading="⚠ SLA Breach Alert" preview="">
          <Text style={{ ...bodyTextStyle, color: "#DC2626", fontWeight: "bold" }}>
            Ticket {ticketNumber} has breached its {breachType} SLA target.
          </Text>
          <Section style={{ backgroundColor: "#FEF2F2", borderRadius: 8, padding: "16px 20px", marginBottom: 20 }}>
            <Text style={{ ...bodyTextStyle, margin: "4px 0" }}>
              <strong>Ticket:</strong> {ticketNumber}
            </Text>
            <Text style={{ ...bodyTextStyle, margin: "4px 0" }}>
              <strong>Subject:</strong> {subject}
            </Text>
            <Text style={{ ...bodyTextStyle, margin: "4px 0" }}>
              <strong>Client:</strong> {clientName}
            </Text>
            <Text style={{ ...bodyTextStyle, margin: "4px 0" }}>
              <strong>Priority:</strong> {priority}
            </Text>
            <Text style={{ ...bodyTextStyle, margin: "4px 0" }}>
              <strong>Breach type:</strong> {breachType === "response" ? "First response overdue" : "Resolution overdue"}
            </Text>
            {assignedTo && (
              <Text style={{ ...bodyTextStyle, margin: "4px 0" }}>
                <strong>Assigned to:</strong> {assignedTo}
              </Text>
            )}
          </Section>
          <Button href={ticketUrl} style={{ ...buttonStyle, backgroundColor: "#DC2626" }}>
            View &amp; Action Ticket
          </Button>
        </EmailLayout>
      </Body>
    </Html>
  );
}
